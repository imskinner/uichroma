// W3C Design Tokens Community Group (DTCG) serializer. Emits the portable `$type`/`$value`
// token JSON that Figma, Tokens Studio, Style Dictionary, and MUI consume — the format the
// vibe-coding ecosystem ingests, so it lives in core alongside the engine. Pure and
// browser-safe: it only depends on the color math, never the generation/network code.

import { generateTonesForColor } from "./color";
import type { ColorRole } from "./types";
import type { TokenSet } from "./theme";

/** Order roles are emitted in: the 7 generated roles plus the derived neutral. */
export const TOKEN_ROLES: (ColorRole | "neutral")[] = [
  "primary",
  "secondary",
  "accent",
  "warning",
  "danger",
  "success",
  "info",
  "neutral",
];

/**
 * Minimal structural input for a single role — satisfied by both the core `Palette` and the
 * web app's `PaletteColors` (which additionally carries pre-computed `tones`). When `tones`
 * are present they are used verbatim (so DTCG matches the CSS/SCSS/Tailwind ramps); otherwise
 * the scale is derived from the hue/saturation, exactly as the client does.
 */
export interface TokenColorInput {
  hex: string;
  h: number;
  s: number;
  description?: string;
  tones?: { l: number; hex: string }[];
}

export type TokenColorsInput = Partial<
  Record<ColorRole | "neutral", TokenColorInput>
>;

export interface DtcgToken {
  $type: "color";
  $value: string;
}

export type DtcgColorGroup = { $description?: string } & Record<
  string,
  DtcgToken | string | undefined
>;

export interface DtcgDocument {
  color: Record<string, DtcgColorGroup>;
  /** Light-mode chrome tokens (background/surface/text/border…), present when modes are passed. */
  light?: Record<string, DtcgToken>;
  /** Dark-mode chrome tokens, present when modes are passed. */
  dark?: Record<string, DtcgToken>;
}

export interface DtcgOptions {
  /** Derived light/dark chrome token sets (from `buildTheme`); emitted as `light`/`dark` groups. */
  modes?: { light: TokenSet; dark: TokenSet };
}

function modeGroup(set: TokenSet): Record<string, DtcgToken> {
  const group: Record<string, DtcgToken> = {};
  for (const [name, value] of Object.entries(set)) {
    group[name] = { $type: "color", $value: value };
  }
  return group;
}

/** Build the DTCG document object: each role as a group with a DEFAULT token + tonal scale. */
export function toDTCGObject(colors: TokenColorsInput, opts?: DtcgOptions): DtcgDocument {
  const color: Record<string, DtcgColorGroup> = {};
  for (const role of TOKEN_ROLES) {
    const c = colors[role];
    if (!c) continue;

    const group: DtcgColorGroup = {};
    if (c.description) group.$description = c.description;
    group.DEFAULT = { $type: "color", $value: c.hex };

    const tones = c.tones?.length ? c.tones : generateTonesForColor(c.h, c.s);
    for (const tone of tones) {
      group[String(tone.l)] = { $type: "color", $value: tone.hex };
    }

    color[role] = group;
  }

  const doc: DtcgDocument = { color };
  if (opts?.modes) {
    doc.light = modeGroup(opts.modes.light);
    doc.dark = modeGroup(opts.modes.dark);
  }
  return doc;
}

/** Serialize a palette to W3C DTCG token JSON (2-space indented). */
export function toDTCG(colors: TokenColorsInput, opts?: DtcgOptions): string {
  return JSON.stringify(toDTCGObject(colors, opts), null, 2);
}
