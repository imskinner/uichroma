import { PALETTE_KEYS, type PaletteColors } from './palette-utils.ts';

export function generateCSSVariables(colors: PaletteColors): string {
  const lines = [':root {'];
  for (const key of PALETTE_KEYS) {
    const color = colors[key];
    if (!color) continue;
    lines.push(`  --color-${key}: ${color.hex};`);
    if (color.tones?.length) {
      for (const tone of color.tones) {
        lines.push(`  --color-${key}-${tone.l}: ${tone.hex};`);
      }
    }
  }
  lines.push('}');
  return lines.join('\n');
}

export function generateSCSSVariables(colors: PaletteColors): string {
  const lines = ['// UI Chroma Palette — SCSS Variables'];
  for (const key of PALETTE_KEYS) {
    const color = colors[key];
    if (!color) continue;
    lines.push(`$color-${key}: ${color.hex};`);
    if (color.tones?.length) {
      for (const tone of color.tones) {
        lines.push(`$color-${key}-${tone.l}: ${tone.hex};`);
      }
    }
  }
  return lines.join('\n');
}

export function generateTailwindConfig(colors: PaletteColors): string {
  const lines = [
    '// UI Chroma Palette — Tailwind CSS Config',
    '// Add to your tailwind.config.js under theme.extend.colors',
    '',
    'module.exports = {',
    '  theme: {',
    '    extend: {',
    '      colors: {',
  ];
  const keys = [...PALETTE_KEYS];
  keys.forEach((key, idx) => {
    const color = colors[key];
    if (!color) return;
    const comma = idx < keys.length - 1 ? ',' : '';
    lines.push(`        '${key}': {`);
    lines.push(`          DEFAULT: '${color.hex}',`);
    if (color.tones?.length) {
      color.tones.forEach((tone, tIdx) => {
        const toneComma = tIdx < color.tones.length - 1 ? ',' : '';
        lines.push(`          '${tone.l}': '${tone.hex}'${toneComma}`);
      });
    }
    lines.push(`        }${comma}`);
  });
  lines.push('      }', '    }', '  }', '};');
  return lines.join('\n');
}

export function generateJSONExport(colors: PaletteColors): string {
  const exportObj: Record<string, unknown> = {};
  for (const key of PALETTE_KEYS) {
    const color = colors[key];
    if (!color) continue;
    exportObj[key] = {
      hex: color.hex,
      h: color.h,
      s: color.s,
      l: color.l,
      tones: (color.tones || []).map(t => ({ hex: t.hex, h: t.h, s: t.s, l: t.l })),
    };
  }
  return JSON.stringify(exportObj, null, 2);
}

export interface ExportFormat {
  generator: (colors: PaletteColors) => string;
  filename: string;
  mime: string;
  label: string;
}

export const EXPORT_FORMATS: Record<string, ExportFormat> = {
  css:      { generator: generateCSSVariables,  filename: 'palette.css',         mime: 'text/css',                label: 'CSS Variables' },
  scss:     { generator: generateSCSSVariables,  filename: '_palette.scss',       mime: 'text/x-scss',            label: 'SCSS Variables' },
  tailwind: { generator: generateTailwindConfig, filename: 'tailwind.palette.js', mime: 'application/javascript', label: 'Tailwind Config' },
  json:     { generator: generateJSONExport,     filename: 'palette.json',        mime: 'application/json',       label: 'JSON' },
};

export function downloadFile(text: string, filename: string, mimeType: string): void {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
