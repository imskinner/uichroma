// Phase 2A: the canonical Theme — the generated palette plus deterministically-derived
// light + dark chrome token sets and a WCAG contrast report. All derived from the colors
// (no extra model call, works on legacy palettes), so the web app, DTCG export, AGENTS.md,
// and the MCP server all get modes + accessibility for free.

import { hexToHSL, hslToHex, textOn } from "./color";
import { scorePalette, type PaletteScore } from "./validate";
import type { Palette } from "./types";

/** Semantic chrome tokens for one mode (the role colors themselves live in `Palette`). */
export interface TokenSet {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  border: string;
}

export type ThemeMode = "light" | "dark";

export interface WcagPair {
  name: string;
  fg: string;
  bg: string;
  ratio: number; // rounded to 2 decimals
  AA: boolean; // normal text, >= 4.5
  AAA: boolean; // normal text, >= 7
  AALarge: boolean; // large text, >= 3
}

export interface WcagReport {
  light: WcagPair[];
  dark: WcagPair[];
  summary: { total: number; passAA: number; passAAA: number };
}

export interface Theme {
  colors: Palette;
  modes: { light: TokenSet; dark: TokenSet };
  wcag: WcagReport;
}

const ROLES = [
  "primary",
  "secondary",
  "accent",
  "warning",
  "danger",
  "success",
  "info",
  "neutral",
] as const;

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// --- WCAG contrast (proper relative-luminance ratio, not the textOn brightness heuristic) ---

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return [
    parseInt(h.substr(0, 2), 16),
    parseInt(h.substr(2, 2), 16),
    parseInt(h.substr(4, 2), 16),
  ];
}

function relLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio between two hex colors (1–21). */
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relLuminance(hex1);
  const l2 = relLuminance(hex2);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function pair(name: string, fg: string, bg: string): WcagPair {
  const ratio = contrastRatio(fg, bg);
  return {
    name,
    fg,
    bg,
    ratio: Math.round(ratio * 100) / 100,
    AA: ratio >= 4.5,
    AAA: ratio >= 7,
    AALarge: ratio >= 3,
  };
}

// --- Mode derivation ---

/** The hue/saturation the neutral chrome is tinted with (from the palette's primary). */
function chromeHue(colors: Palette): number {
  if (colors.neutral && typeof colors.neutral.h === "number") return colors.neutral.h;
  return hexToHSL(colors.primary.hex).h;
}

/** Derive light + dark chrome token sets from the palette's neutral hue. */
export function deriveModes(colors: Palette): { light: TokenSet; dark: TokenSet } {
  const h = chromeHue(colors);
  return {
    light: {
      background: hslToHex(h, 8, 98),
      surface: hslToHex(h, 6, 100),
      surfaceMuted: hslToHex(h, 10, 95),
      text: hslToHex(h, 16, 15),
      textMuted: hslToHex(h, 10, 40),
      border: hslToHex(h, 12, 88),
    },
    dark: {
      background: hslToHex(h, 14, 9),
      surface: hslToHex(h, 13, 13),
      surfaceMuted: hslToHex(h, 12, 18),
      text: hslToHex(h, 8, 95),
      textMuted: hslToHex(h, 8, 66),
      border: hslToHex(h, 12, 24),
    },
  };
}

function modePairs(mode: TokenSet, colors: Palette): WcagPair[] {
  const pairs: WcagPair[] = [
    pair("Body text on background", mode.text, mode.background),
    pair("Muted text on background", mode.textMuted, mode.background),
    pair("Body text on surface", mode.text, mode.surface),
  ];
  for (const role of ROLES) {
    const c = colors[role];
    if (!c) continue;
    // Each role used as a solid fill (button/alert) with its best on-color.
    pairs.push(pair(`${cap(role)} fill`, textOn(c.hex), c.hex));
  }
  return pairs;
}

/** Compute the full WCAG report for both modes. */
export function computeWcag(
  colors: Palette,
  modes: { light: TokenSet; dark: TokenSet },
): WcagReport {
  const light = modePairs(modes.light, colors);
  const dark = modePairs(modes.dark, colors);
  const all = [...light, ...dark];
  return {
    light,
    dark,
    summary: {
      total: all.length,
      passAA: all.filter((p) => p.AA).length,
      passAAA: all.filter((p) => p.AAA).length,
    },
  };
}

/** Build the full Theme (colors + derived light/dark modes + WCAG) from a palette. */
export function buildTheme(colors: Palette): Theme {
  const modes = deriveModes(colors);
  return { colors, modes, wcag: computeWcag(colors, modes) };
}

/**
 * Score a palette as a theme: the existing palette heuristics plus WCAG legibility of the two
 * roles most used as solid CTAs (primary, accent). Failures here are fed to the critique loop,
 * so generation self-corrects contrast — WCAG as a first-class generation constraint.
 */
export function scoreTheme(colors: Palette): PaletteScore {
  const base = scorePalette(colors);
  let score = base.score;
  const issues = [...base.issues];
  for (const role of ["primary", "accent"] as const) {
    const c = colors[role];
    if (!c) continue;
    const ratio = contrastRatio(textOn(c.hex), c.hex);
    if (ratio < 4.5) {
      score -= 10;
      const fg = textOn(c.hex) === "#FFFFFF" ? "white" : "dark";
      issues.push(
        `${cap(role)} fails WCAG AA as a button (${ratio.toFixed(1)}:1 with ${fg} text, need 4.5) — adjust its lightness for legible text.`,
      );
    }
  }
  return { score, issues };
}
