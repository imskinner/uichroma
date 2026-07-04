// The generation engine: a forced tool/function call to produce a palette, a deterministic
// score, and a critique call that repairs only flagged colors (accepted only if it scores
// higher). Provider-agnostic — runs on OpenAI or Anthropic behind one interface (chosen by
// the caller). This whole pipeline is reused by the Express API, the Cloud Function, and the
// (Phase 1) MCP server — it is the product, so it lives here once.

import { validatePalette } from "./validate";
import { deriveNeutral } from "./validate";
import { scoreTheme, normalizeStyle, type Style } from "./theme";
import type { Palette } from "./types";

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_OPENAI_MODEL = "gpt-4o";
const DEFAULT_ANTHROPIC_MODEL = "claude-opus-4-8";

export type LLMProvider = "openai" | "anthropic";
export interface LLMOptions {
  /** Which LLM backs generation. Defaults to "openai" for backward compatibility. */
  provider?: LLMProvider;
  /** Override the model id; otherwise a sensible default per provider. */
  model?: string;
}

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
const GENERATE_TOOL = {
  name: "generate_theme",
  description:
    "Generate a 7-color UI palette plus the brand's non-color style (fonts, type scale, roundness, density, elevation).",
  parameters: {
    type: "object",
    properties: { ...colorProps, style: styleSchema },
    required: [...REQUIRED_COLORS, "style"],
  },
};

/** Critique: repair colors only (style is preserved from the original generation). */
const CRITIQUE_TOOL = {
  name: "generate_palette",
  description: "Generate a 7-color UI palette with hex, HSL values, and descriptions",
  parameters: {
    type: "object",
    properties: { ...colorProps },
    required: [...REQUIRED_COLORS],
  },
};

/**
 * One forced tool/function call against OpenAI or Anthropic; returns the model's structured
 * tool input (the arguments object) or null. Keeps both providers behind one interface so the
 * rest of the pipeline is identical regardless of which LLM backs it.
 */
async function callToolLLM(opts: {
  apiKey: string;
  provider: LLMProvider;
  model: string;
  system: string;
  user: string;
  tool: { name: string; description: string; parameters: unknown };
  temperature: number;
  maxTokens: number;
}): Promise<Record<string, any> | null> {
  const { apiKey, provider, model, system, user, tool, temperature, maxTokens } = opts;

  if (provider === "anthropic") {
    const response = await fetch(ANTHROPIC_MESSAGES_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      // Note: newer Anthropic models (e.g. Opus 4.8) reject `temperature`, so we omit it and
      // let the provider default apply. `temperature` still applies to the OpenAI path below.
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: user }],
        tools: [{ name: tool.name, description: tool.description, input_schema: tool.parameters }],
        tool_choice: { type: "tool", name: tool.name },
      }),
    });
    if (!response.ok) {
      const errText = await response.text();
      console.error(`Anthropic API Error: ${response.status} - ${errText}`);
      throw new Error(`Anthropic API request failed (${response.status}): ${errText.slice(0, 400)}`);
    }
    const data: any = await response.json();
    const block = (data.content || []).find((b: any) => b.type === "tool_use");
    return block ? block.input : null;
  }

  // Default: OpenAI function calling.
  const response = await fetch(OPENAI_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      functions: [tool],
      function_call: { name: tool.name },
      temperature,
      max_tokens: maxTokens,
    }),
  });
  if (!response.ok) {
    const errText = await response.text();
    console.error(`OpenAI API Error: ${response.status} - ${errText}`);
    throw new Error(`OpenAI API request failed (${response.status}): ${errText.slice(0, 400)}`);
  }
  const data: any = await response.json();
  const msg = data.choices?.[0]?.message;
  if (msg?.function_call) return JSON.parse(msg.function_call.arguments);
  return null;
}

/** Resolve the model id for a provider (explicit override wins). */
function resolveModel(opts: LLMOptions): { provider: LLMProvider; model: string } {
  const provider = opts.provider ?? "openai";
  const model =
    opts.model ?? (provider === "anthropic" ? DEFAULT_ANTHROPIC_MODEL : DEFAULT_OPENAI_MODEL);
  return { provider, model };
}

export const PALETTE_SYSTEM_PROMPT = `You are an elite brand color designer. From a short prompt describing a project, brand, mood, or aesthetic, design a vibrant, cohesive, DISTINCTIVE 7-role UI palette that a senior designer would ship — one that could only belong to THIS brief.

FIRST, read the brief for its world: industry, era, materials, emotion, audience, culture, references. Let those drive the palette's tonal *character* — deep and moody, bright and airy, earthy and organic, neon and electric, soft and pastel, or rich and luxurious. The overall mood matters as much as the individual hues.

COLOR ROLES:
- Primary: the signature brand color. It must feel chosen specifically for this brief — surprising yet obviously right. Commit to a bold, characterful hue. Do NOT default to generic corporate blue.
- Secondary: complements and contrasts primary — a clearly different hue (≥40° apart) so the two read as a deliberate pair, not a tint variation.
- Accent: the CTA / interactive highlight. Stands apart from primary and secondary, strong contrast on white (lightness 30–50, saturation ≥ 60). CRITICAL: never red or warm-red (hue 330–360 or 0–25) — it clashes with danger and feels alarming on CTAs. Prefer vivid, unexpected choices: electric blue, violet, teal, lime, magenta, tangerine. Only go red-adjacent if the brief explicitly asks for a fiery/passionate feel.
- Warning: yellow-orange (hue 30–55). Danger: red (hue 340–360 or 0–15). Success: green (hue 100–160). Info: blue (hue 190–240).

CRAFT — be specific, avoid the generic:
- A "zen tea house" and a "cyberpunk arcade" must share nothing. Do NOT reach for the same safe blue→teal→purple you'd use for anything else; vary your starting hue widely and take a considered risk that fits the brief.
- Primary, secondary, and accent must occupy distinctly different hue regions and together tell a curated color story, not a monochromatic scale.
- Use saturation and lightness with intent: luxury runs deep and restrained; a kids app bright and saturated; wellness soft and light; a nightlife brand dark and electric. Don't flatten everything to mid-saturation / mid-lightness — that is exactly what makes palettes feel lame and interchangeable.
- Each description must name the specific reason the color fits THIS brief (the mood, industry, or reference it evokes) — never generic filler.

For each color provide a hex code, HSL values (h 0-360, s 0-100, l 0-100), and a brief, specific description.

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

/** Call the LLM once and return a validated palette + normalized non-color style. */
export async function generateColorPalette(
  feelings: string,
  apiKey: string,
  opts: LLMOptions = {},
): Promise<GenerationResult> {
  if (!apiKey) throw new Error("LLM API key is not set.");
  const { provider, model } = resolveModel(opts);

  const args = await callToolLLM({
    apiKey,
    provider,
    model,
    system: PALETTE_SYSTEM_PROMPT,
    user: feelings,
    tool: GENERATE_TOOL,
    temperature: 0.75,
    maxTokens: 2000,
  });
  if (!args) throw new Error("Model did not return a tool call");

  const { style: rawStyle, ...colorArgs } = args;
  const validated = validatePalette(colorArgs as Palette);
  const style = normalizeStyle(rawStyle);
  return { colors: validated, style, aiResponse: JSON.stringify(validated) };
}

/** Re-prompt the LLM to repair only the flagged issues. Returns null on any failure. */
export async function critiquePalette(
  feelings: string,
  colors: Palette,
  issues: string[],
  apiKey: string,
  opts: LLMOptions = {},
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
    const { provider, model } = resolveModel(opts);
    const args = await callToolLLM({
      apiKey,
      provider,
      model,
      system: CRITIQUE_SYSTEM_PROMPT,
      user: userMsg,
      tool: CRITIQUE_TOOL,
      temperature: 0.6,
      maxTokens: 1500,
    });
    if (!args) return null;
    return validatePalette(args as Palette);
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
  opts: LLMOptions = {},
): Promise<GenerationResult> {
  const { colors: generated, style, aiResponse } = await generateColorPalette(
    feelings,
    apiKey,
    opts,
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
      opts,
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
