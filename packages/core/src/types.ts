// Canonical color/palette types shared across the web app, the API, and the MCP server.

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface Tone extends HSL {
  hex: string;
}

/** The seven generated semantic roles (neutral is derived, not generated). */
export type ColorRole =
  | "primary"
  | "secondary"
  | "accent"
  | "warning"
  | "danger"
  | "success"
  | "info";

/** Roles the model produces, in canonical order. `neutral` is derived afterwards. */
export const SEMANTIC_ROLES: ColorRole[] = [
  "primary",
  "secondary",
  "accent",
  "warning",
  "danger",
  "success",
  "info",
];

/**
 * A single color as produced by generation/validation (server-side shape).
 * Tones are layered on client-side for display, so they are not part of this type.
 */
export interface PaletteColor {
  hex: string;
  h: number;
  s: number;
  l: number;
  description?: string;
}

/** The seven generated roles plus the derived `neutral`. */
export type Palette = Record<ColorRole, PaletteColor> & {
  neutral?: PaletteColor;
};
