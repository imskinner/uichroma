import type { Tone } from './color-utils.ts';
import { hexToHSL, hslToHex, generateTonesForColor } from './color-utils.ts';

export const PALETTE_KEYS = ["primary", "secondary", "accent", "warning", "danger", "success", "info", "neutral"] as const;
export type PaletteKey = typeof PALETTE_KEYS[number];

export const PALETTE_LABELS: Record<PaletteKey, string> = {
  primary: "Primary",
  secondary: "Secondary",
  accent: "Accent",
  warning: "Warning",
  danger: "Danger",
  success: "Success",
  info: "Info",
  neutral: "Neutral",
};

export interface PaletteColor {
  hex: string;
  h: number;
  s: number;
  l: number;
  tones: Tone[];
  description: string;
}

export type PaletteColors = Record<PaletteKey, PaletteColor>;

export interface PaletteData {
  colors: PaletteColors;
  aiResponse?: string;
  keywords?: string;
  permalink?: string;
}

export function getTone(colors: PaletteColors, key: PaletteKey, index: number): string {
  const c = colors[key];
  if (c && c.tones && c.tones[index]) return c.tones[index].hex;
  return c ? c.hex : '#888';
}

export function normalizePaletteColors(colors: Record<string, { hex: string; description?: string }>): PaletteColors {
  const normalized = {} as Record<string, PaletteColor>;
  const primaryHSL = hexToHSL(colors.primary.hex);

  for (const key of PALETTE_KEYS) {
    const orig = colors[key];
    if (!orig) continue;

    let h: number, s: number, l: number, hex: string;
    if (key === 'neutral') {
      h = primaryHSL.h;
      s = 10;
      l = 10;
      hex = hslToHex(h, s, l);
    } else {
      hex = orig.hex;
      const hslObj = hexToHSL(orig.hex);
      h = hslObj.h;
      s = hslObj.s;
      l = hslObj.l;
    }

    const tones = generateTonesForColor(h, s);
    normalized[key] = { hex, h, s, l, tones, description: orig.description || '' };
  }

  return normalized as PaletteColors;
}
