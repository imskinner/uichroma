// Color math now lives in the shared engine (packages/core) — the single source of truth
// across the web app, the API, and the MCP server. This file re-exports the browser-safe
// `@uichroma/core/color` subpath (color math + types only, no generation engine) so existing
// imports of `./color-utils` keep working unchanged.
export type { HSL, Tone } from '@uichroma/core/color';
export { hexToHSL, hslToHex, generateTonesForColor, textOn } from '@uichroma/core/color';
