// @uichroma/core — single source of truth for color math, palette validation/scoring,
// and the GPT-4o generation + critique pipeline. Imported by the Express API, the Firebase
// Cloud Function, the web app, and (Phase 1) the MCP server.

export * from "./color"; // hexToHSL, hslToHex, generateTonesForColor, textOn, HSL, Tone
export * from "./hue"; // SEMANTIC_HUE_RANGES, hueInRange, nudgeHue, hueDist, HueRange
export * from "./validate"; // validatePalette, scorePalette, deriveNeutral, PaletteScore
export * from "./tokens"; // toDTCG, toDTCGObject, TOKEN_ROLES, DTCG types
export * from "./generate"; // prompts, generateColorPalette, critiquePalette, runPalettePipeline

// Types not already re-exported via ./color.
export type { ColorRole, PaletteColor, Palette } from "./types";
export { SEMANTIC_ROLES } from "./types";
