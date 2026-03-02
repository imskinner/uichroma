export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface Tone extends HSL {
  hex: string;
}

export function hexToHSL(H: string): HSL {
  let r = 0, g = 0, b = 0;
  if (H.length === 4) {
    r = parseInt(H[1] + H[1], 16);
    g = parseInt(H[2] + H[2], 16);
    b = parseInt(H[3] + H[3], 16);
  } else if (H.length === 7) {
    r = parseInt(H.substr(1, 2), 16);
    g = parseInt(H.substr(3, 2), 16);
    b = parseInt(H.substr(5, 2), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const cmin = Math.min(r, g, b), cmax = Math.max(r, g, b);
  const delta = cmax - cmin;
  let h = 0, s = 0;
  const l = (cmax + cmin) / 2;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (cmax) {
      case r: h = ((g - b) / delta) % 6; break;
      case g: h = (b - r) / delta + 2; break;
      case b: h = (r - g) / delta + 4; break;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  s = +(s * 100).toFixed(1);
  return { h, s, l: +(l * 100).toFixed(1) };
}

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

export function generateTonesForColor(h: number, s: number, count = 10, minL = 10, maxL = 95): Tone[] {
  const tones: Tone[] = [];
  for (let i = 0; i < count; i++) {
    const lightness = Math.round(minL + (maxL - minL) * (i / (count - 1)));
    const hex = hslToHex(h, s, lightness);
    tones.push({ h, s, l: lightness, hex });
  }
  return tones;
}

export function textOn(hex: string): string {
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 150 ? '#1B1A18' : '#FFFFFF';
}
