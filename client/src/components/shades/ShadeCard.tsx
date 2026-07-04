import { useState } from 'react';
import type { PaletteColor, PaletteKey } from '@/lib/palette-utils.ts';
import { PALETTE_LABELS } from '@/lib/palette-utils.ts';

interface ShadeCardProps {
  colorKey: PaletteKey;
  color: PaletteColor;
}

export function ShadeCard({ colorKey, color }: ShadeCardProps) {
  return (
    <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] mb-4 overflow-hidden">
      <div className="flex justify-between items-center px-4 pt-3.5 pb-2.5">
        <span className="font-heading font-bold text-[15px] text-[#1B1A18] dark:text-[#e5e5e5]">
          {PALETTE_LABELS[colorKey]}
        </span>
        <span className="text-xs font-mono text-[#9ca3af]">{color.hex.toUpperCase()}</span>
      </div>
      <div className="flex px-3 pb-3 gap-0">
        {color.tones.map((tone) => (
          <ShadeSwatch key={tone.l} hex={tone.hex} lightness={tone.l} />
        ))}
      </div>
    </div>
  );
}

function ShadeSwatch({ hex, lightness }: { hex: string; lightness: number }) {
  const [copied, setCopied] = useState(false);
  const on = lightness < 52 ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.72)';

  const handleClick = () => {
    navigator.clipboard.writeText(hex).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <button
      onClick={handleClick}
      title={hex}
      className="group flex-1 h-16 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-[flex-grow] duration-200 hover:flex-[1.5] first:rounded-l-[10px] last:rounded-r-[10px] focus:outline-none"
      style={{ background: hex, color: on }}
    >
      <span className="text-[10px] font-semibold leading-none">{lightness}</span>
      <span className="text-[9px] font-mono leading-none opacity-0 group-hover:opacity-100 transition-opacity">
        {copied ? '✓ copied' : hex.replace('#', '').toUpperCase()}
      </span>
    </button>
  );
}
