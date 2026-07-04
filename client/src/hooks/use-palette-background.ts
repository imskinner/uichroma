import { useEffect } from 'react';
import type { PaletteColors } from '@/lib/palette-utils.ts';

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return `rgba(120, 120, 120, ${alpha})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Themes the drifting `landing-bg` background glows (--le-1/2/3) to the active
 * palette. The variables are registered as `<color>` via @property in index.css,
 * so assigning them animates the gradients (a smooth cross-fade into the brand).
 * On unmount the overrides are cleared and the glows ease back to their defaults.
 */
export function usePaletteBackground(colors: PaletteColors | null | undefined) {
  const primary = colors?.primary?.hex;
  const secondary = colors?.secondary?.hex;
  const accent = colors?.accent?.hex;

  useEffect(() => {
    if (!primary || !secondary || !accent) return;
    const root = document.documentElement;
    root.style.setProperty('--le-1', hexToRgba(primary, 0.55));
    root.style.setProperty('--le-2', hexToRgba(accent, 0.5));
    root.style.setProperty('--le-3', hexToRgba(secondary, 0.5));
    return () => {
      root.style.removeProperty('--le-1');
      root.style.removeProperty('--le-2');
      root.style.removeProperty('--le-3');
    };
  }, [primary, secondary, accent]);
}
