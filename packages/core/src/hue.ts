// Hue geometry + the semantic hue ranges used to validate generated palettes.

export interface HueRange {
  min: number;
  max: number;
  /** True for ranges that wrap across 0° (e.g. danger/red). */
  wraps?: boolean;
}

/** Valid hue windows for the semantic roles, enforced server-side after generation. */
export const SEMANTIC_HUE_RANGES: Record<
  "warning" | "danger" | "success" | "info",
  HueRange
> = {
  warning: { min: 25, max: 60 },
  danger: { min: 340, max: 20, wraps: true }, // wraps around 0
  success: { min: 90, max: 165 },
  info: { min: 185, max: 245 },
};

/** Whether a hue falls within a range (handles wrap-around for danger). */
export function hueInRange(hue: number, range: HueRange): boolean {
  if (range.wraps) {
    return hue >= range.min || hue <= range.max;
  }
  return hue >= range.min && hue <= range.max;
}

/** Nudge a hue into its valid range by snapping to the nearest bound. */
export function nudgeHue(hue: number, range: HueRange): number {
  if (hueInRange(hue, range)) return hue;
  if (range.wraps) {
    const distToMin = Math.min(
      Math.abs(hue - range.min),
      360 - Math.abs(hue - range.min),
    );
    const distToMax = Math.min(
      Math.abs(hue - range.max),
      360 - Math.abs(hue - range.max),
    );
    return distToMin <= distToMax ? range.min : range.max;
  }
  const distToMin = Math.abs(hue - range.min);
  const distToMax = Math.abs(hue - range.max);
  return distToMin <= distToMax ? range.min : range.max;
}

/** Shortest angular distance between two hues on the 360° wheel. */
export function hueDist(h1: number, h2: number): number {
  const d = Math.abs(h1 - h2) % 360;
  return d > 180 ? 360 - d : d;
}
