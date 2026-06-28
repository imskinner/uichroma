// Palette validation, auto-correction, scoring, and neutral derivation.
// This is the deterministic half of the generation moat — it flags violations that the
// GPT-4o critique call repairs, and derives the neutral that ties the palette together.

import { hexToHSL, hslToHex } from "./color";
import { SEMANTIC_HUE_RANGES, hueDist, hueInRange, nudgeHue } from "./hue";
import type { ColorRole, Palette } from "./types";

const ROLES: ColorRole[] = [
  "primary",
  "secondary",
  "accent",
  "warning",
  "danger",
  "success",
  "info",
];

/** Validate and auto-correct palette colors in place, returning the same object. */
export function validatePalette(colors: Palette): Palette {
  // 1. Ensure each color has HSL derived from its hex.
  for (const key of ROLES) {
    const c = colors[key];
    if (!c) continue;
    if (c.h == null || c.s == null || c.l == null) {
      const hsl = hexToHSL(c.hex);
      c.h = hsl.h;
      c.s = hsl.s;
      c.l = hsl.l;
    }
  }

  // 2. Enforce semantic hue ranges.
  for (const key of ["warning", "danger", "success", "info"] as const) {
    const c = colors[key];
    if (!c) continue;
    const range = SEMANTIC_HUE_RANGES[key];
    if (!hueInRange(c.h, range)) {
      c.h = nudgeHue(c.h, range);
      c.hex = hslToHex(c.h, c.s, c.l);
    }
  }

  // 3. Enforce accent contrast: clamp lightness to 25–55 for CTA usability.
  const accent = colors.accent;
  if (accent) {
    if (accent.l < 25) {
      accent.l = 25;
      accent.hex = hslToHex(accent.h, accent.s, accent.l);
    } else if (accent.l > 55) {
      accent.l = 55;
      accent.hex = hslToHex(accent.h, accent.s, accent.l);
    }
  }

  // 4. Steer accent away from the red/danger zone (hue 320-360 or 0-25).
  if (accent && (accent.h >= 320 || accent.h <= 25)) {
    if (accent.h >= 320) {
      accent.h = 280; // purple/magenta
    } else {
      accent.h = 35; // warm orange (outside danger, inside safe territory)
    }
    accent.hex = hslToHex(accent.h, accent.s, accent.l);
  }

  return colors;
}

export interface PaletteScore {
  score: number;
  issues: string[];
}

/** Score a palette out of 100 and list the specific issues a critique call should fix. */
export function scorePalette(colors: Palette): PaletteScore {
  let score = 100;
  const issues: string[] = [];
  const p = colors.primary,
    s = colors.secondary,
    a = colors.accent;

  if (hueDist(p.h, s.h) < 35) {
    score -= 20;
    issues.push(
      "Primary↔Secondary hue too close (" + hueDist(p.h, s.h) + "°, need 35°+)",
    );
  }
  if (hueDist(p.h, a.h) < 35) {
    score -= 20;
    issues.push(
      "Primary↔Accent hue too close (" + hueDist(p.h, a.h) + "°, need 35°+)",
    );
  }
  if (hueDist(s.h, a.h) < 30) {
    score -= 15;
    issues.push(
      "Secondary↔Accent hue too close (" + hueDist(s.h, a.h) + "°, need 30°+)",
    );
  }
  if (p.s < 40) {
    score -= 15;
    issues.push("Primary saturation too low (" + p.s + ", need 40+)");
  }
  if (a.s < 50) {
    score -= 15;
    issues.push("Accent saturation too low (" + a.s + ", need 50+)");
  }
  if (a.l < 30 || a.l > 50) {
    score -= 10;
    issues.push("Accent lightness outside CTA range (" + a.l + ", need 30-50)");
  }
  if (hueDist(a.h, 0) < 30) {
    score -= 15;
    issues.push("Accent hue too close to red zone (hue " + a.h + ")");
  }
  const lSpread = Math.max(p.l, s.l, a.l) - Math.min(p.l, s.l, a.l);
  if (lSpread < 10) {
    score -= 10;
    issues.push(
      "Primary/Secondary/Accent lightness too uniform (spread " + lSpread + ")",
    );
  }

  return { score, issues };
}

/** Derive the near-black neutral from the primary hue and attach it to the palette. */
export function deriveNeutral(colors: Palette): Palette {
  const primaryHSL = hexToHSL(colors.primary.hex);
  colors.neutral = {
    hex: hslToHex(primaryHSL.h, 10, 10),
    h: primaryHSL.h,
    s: 10,
    l: 10,
    description:
      "A blackish color that elegantly integrates the palette. Best for text, lines, backgrounds, etc",
  };
  return colors;
}
