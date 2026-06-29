// The generation engine: GPT-4o function-calling to produce a palette, a deterministic
// score, and a critique call that repairs only flagged colors (accepted only if it scores
// higher). This whole pipeline is reused by the Express API, the Cloud Function, and the
// (Phase 1) MCP server — it is the product, so it lives here once.

import { validatePalette } from "./validate";
import { deriveNeutral } from "./validate";
import { scoreTheme, normalizeStyle, type Style } from "./theme";
import type { Palette } from "./types";

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";

const colorSchema = {
  type: "object",
  properties: {
    hex: { type: "string", description: "Hex color code e.g. #3A86FF" },
    h: { type: "number", description: "Hue 0-360" },
    s: { type: "number", description: "Saturation 0-100" },
    l: { type: "number", description: "Lightness 0-100" },
    description: { type: "string", description: "Brief design rationale" },
  },
  required: ["hex", "h", "s", "l", "description"],
} as const;

const colorProps = {
  primary: colorSchema,
  secondary: colorSchema,
  accent: colorSchema,
  warning: colorSchema,
  danger: colorSchema,
  success: colorSchema,
  info: colorSchema,
} as const;

const REQUIRED_COLORS = [
  "primary",
  "secondary",
  "accent",
  "warning",
  "danger",
  "success",
  "info",
];

const styleSchema = {
  type: "object",
  description: "Non-color brand style that fits the same vibe as the palette.",
  properties: {
    headingFont: {
      type: "string",
      description:
        "A Google Fonts family for headings that fits the brand — avoid defaulting to Inter unless it genuinely fits. e.g. Sora, Space Grotesk, Outfit, Fraunces, Playfair Display, Bricolage Grotesque.",
    },
    bodyFont: {
      type: "string",
      description: "A highly readable Google Fonts family for body text (may differ from heading).",
    },
    monoFont: {
      type: "string",
      description: "A monospace Google Fonts family for code, e.g. JetBrains Mono, IBM Plex Mono.",
    },
    typeScaleRatio: {
      type: "number",
      description:
        "Modular type-scale ratio 1.1–1.6 (smaller = denser/utility UI, larger = expressive/landing).",
    },
    radius: {
      type: "string",
      enum: ["sharp", "rounded", "soft", "pill"],
      description: "Corner roundness fitting the brand.",
    },
    density: {
      type: "string",
      enum: ["compact", "normal", "spacious"],
      description: "Spacing density.",
    },
    elevation: {
      type: "string",
      enum: ["flat", "subtle", "elevated"],
      description: "Shadow/elevation depth.",
    },
  },
  required: [
    "headingFont",
    "bodyFont",
    "monoFont",
    "typeScaleRatio",
    "radius",
    "density",
    "elevation",
  ],
} as const;

/** Generation: palette + non-color style in one call. */
const generateFunction = [
  {
    name: "generate_theme",
    description:
      "Generate a 7-color UI palette plus the brand's non-color style (fonts, type scale, roundness, density, elevation).",
    parameters: {
      type: "object",
      properties: { ...colorProps, style: styleSchema },
      required: [...REQUIRED_COLORS, "style"],
    },
  },
];

/** Critique: repair colors only (style is preserved from the original generation). */
const critiqueFunction = [
  {
    name: "generate_palette",
    description: "Generate a 7-color UI palette with hex, HSL values, and descriptions",
    parameters: {
      type: "object",
      properties: { ...colorProps },
      required: [...REQUIRED_COLORS],
    },
  },
];

export const PALETTE_SYSTEM_PROMPT = `You are an elite UI color system designer creating palettes for real products. The user will describe a project, brand, mood, or aesthetic. Generate a vibrant, cohesive 7-color UI palette that would impress a senior designer.

COLOR ROLES:
- Primary: The dominant brand color. Sets the emotional tone of the entire palette. Choose a bold, distinctive hue — avoid defaulting to generic corporate blue unless the prompt specifically calls for it.
- Secondary: Complements and contrasts with primary. Must be a clearly different hue (at least 40° hue separation) so the two read as a deliberate pair, not a tint variation.
- Accent: The eye-catching CTA / interactive highlight color. Must stand out from both primary and secondary. Must have good contrast on white (lightness 30–50, saturation >= 60). CRITICAL: Do NOT use red or warm-red hues (hue 330–360 or 0–25) for accent — red accents clash with the danger color and feel alarming on CTAs. Prefer vivid blues, purples, teals, bright oranges, magentas, or greens. Only use red-adjacent accent if the user explicitly asks for a red/fiery/passionate brand.
- Warning: Cautionary. Yellow-orange family (hue 30–55).
- Danger: Urgent/negative. Red family (hue 340–360 or 0–15).
- Success: Positive/confirmatory. Green family (hue 100–160).
- Info: Neutral/informational. Blue family (hue 190–240).

QUALITY GUIDELINES:
- Be creative and specific to the prompt. A "zen meditation app" palette should feel completely different from a "gaming esports brand". Don't fall back on the same safe blue/teal/purple every time.
- Primary, secondary, and accent must each occupy distinctly different hue regions. The three together should form a curated color story, not a monochromatic scale.
- Favor higher saturation for primary and accent (S >= 50) unless the prompt calls for muted/pastel aesthetics. Vivid palettes feel more professional and intentional.
- Consider the full prompt — industry, emotion, audience, style — when choosing each hue. A fintech app might want trustworthy deep navy + energetic green accent. A bakery might want warm peach primary + rich chocolate secondary + teal accent.
- Each description should explain the specific design reasoning, not generic filler.

STYLE (non-color — pick values that reinforce the same brand personality):
- Fonts: choose real Google Fonts that match the vibe; avoid the generic Inter-by-default look unless Inter genuinely fits. A bold editorial brand might pair a characterful serif heading (Fraunces, Playfair Display) with a clean sans body; a technical/AI product might use a geometric sans (Space Grotesk, Sora). Heading and body may differ.
- typeScaleRatio: smaller (≈1.125–1.2) for dense/utility apps, larger (≈1.333–1.5) for expressive/marketing brands.
- radius / density / elevation: e.g. sharp + compact + flat for a serious fintech; soft + spacious + elevated for a friendly consumer app.

For each color provide a hex code, HSL values (h 0-360, s 0-100, l 0-100), and a brief description. Also provide the non-color \`style\` object.`;

export const CRITIQUE_SYSTEM_PROMPT = `You are a color palette critic. You receive a 7-color UI palette and a list of specific issues. Fix ONLY the identified issues while preserving colors that already work well. Return the corrected palette using the same function schema.`;

/** Result of a single generation: the validated palette, the non-color style, and raw JSON. */
export interface GenerationResult {
  colors: Palette;
  style: Style;
  aiResponse: string;
}

/** Call GPT-4o once and return a validated palette + normalized non-color style. */
export async function generateColorPalette(
  feelings: string,
  apiKey: string,
): Promise<GenerationResult> {
  if (!apiKey) throw new Error("OpenAI API key is not set.");

  const response = await fetch(OPENAI_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: PALETTE_SYSTEM_PROMPT },
        { role: "user", content: feelings },
      ],
      functions: generateFunction,
      function_call: { name: "generate_theme" },
      temperature: 0.75,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`OpenAI API Error: ${response.status} - ${errText}`);
    throw new Error("OpenAI API request failed");
  }

  const data: any = await response.json();
  const choiceMsg = data.choices?.[0]?.message;
  if (choiceMsg?.function_call) {
    const { style: rawStyle, ...colorArgs } = JSON.parse(choiceMsg.function_call.arguments);
    const validated = validatePalette(colorArgs as Palette);
    const style = normalizeStyle(rawStyle);
    return { colors: validated, style, aiResponse: JSON.stringify(validated) };
  }
  throw new Error("OpenAI did not return a function call");
}

/** Re-prompt GPT-4o to repair only the flagged issues. Returns null on any failure. */
export async function critiquePalette(
  feelings: string,
  colors: Palette,
  issues: string[],
  apiKey: string,
): Promise<Palette | null> {
  const compactPalette: Record<string, { hex: string; h: number; s: number; l: number }> = {};
  for (const key of [
    "primary",
    "secondary",
    "accent",
    "warning",
    "danger",
    "success",
    "info",
  ] as const) {
    const c = colors[key];
    compactPalette[key] = { hex: c.hex, h: c.h, s: c.s, l: c.l };
  }

  const issueList = issues.map((msg, i) => i + 1 + ". " + msg).join("\n");
  const userMsg = `Original prompt: "${feelings}"\n\nCurrent palette:\n${JSON.stringify(
    compactPalette,
    null,
    2,
  )}\n\nIssues to fix:\n${issueList}`;

  try {
    const response = await fetch(OPENAI_CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: CRITIQUE_SYSTEM_PROMPT },
          { role: "user", content: userMsg },
        ],
        functions: critiqueFunction,
        function_call: { name: "generate_palette" },
        temperature: 0.6,
      }),
    });
    if (!response.ok) return null;
    const data: any = await response.json();
    const choiceMsg = data.choices?.[0]?.message;
    if (choiceMsg?.function_call) {
      const args = JSON.parse(choiceMsg.function_call.arguments) as Palette;
      return validatePalette(args);
    }
    return null;
  } catch (err) {
    console.error("Critique call failed:", (err as Error).message);
    return null;
  }
}

/**
 * The full generation pipeline: generate → score → critique-if-needed → derive neutral.
 * The critiqued palette is accepted only if it scores strictly higher than the original.
 * Returns the final 8-role palette (7 generated + derived neutral) and the raw model JSON.
 */
export async function runPalettePipeline(
  feelings: string,
  apiKey: string,
): Promise<GenerationResult> {
  const { colors: generated, style, aiResponse } = await generateColorPalette(
    feelings,
    apiKey,
  );
  let colors = generated;

  const firstScore = scoreTheme(colors);
  console.log(
    `Palette score: ${firstScore.score}/100, issues: ${firstScore.issues.length}`,
  );
  if (firstScore.issues.length > 0) {
    console.log("Issues:", firstScore.issues.join("; "));
  }

  if (firstScore.issues.length >= 2) {
    console.log("Triggering critique call...");
    const critiqued = await critiquePalette(
      feelings,
      colors,
      firstScore.issues,
      apiKey,
    );
    if (critiqued) {
      const secondScore = scoreTheme(critiqued);
      console.log(
        `Critique score: ${secondScore.score}/100, issues: ${secondScore.issues.length}`,
      );
      if (secondScore.score > firstScore.score) {
        console.log("Critique improved palette, using critiqued version");
        colors = critiqued;
      } else {
        console.log("Critique did not improve palette, keeping original");
      }
    }
  }

  colors = deriveNeutral(colors);
  return { colors, style, aiResponse };
}
