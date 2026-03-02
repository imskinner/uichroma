import { useState } from 'react';
import type { PaletteColor, PaletteKey } from '@/lib/palette-utils.ts';
import { PALETTE_LABELS } from '@/lib/palette-utils.ts';

interface ShadeCardProps {
  colorKey: PaletteKey;
  color: PaletteColor;
}

export function ShadeCard({ colorKey, color }: ShadeCardProps) {
  return (
    <div className="bg-white border border-[#EEEDEC] rounded-lg mb-4 overflow-hidden transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <div className="flex justify-between items-center px-4 py-3">
        <span className="font-heading font-bold text-base text-[#1B1A18]">{PALETTE_LABELS[colorKey]}</span>
        <span className="text-xs text-[#85807A]">{color.hex}</span>
      </div>
      <div className="flex">
        {color.tones.map(tone => (
          <ShadeSwatch key={tone.l} hex={tone.hex} lightness={tone.l} />
        ))}
      </div>
    </div>
  );
}

function ShadeSwatch({ hex, lightness }: { hex: string; lightness: number }) {
  const [copied, setCopied] = useState(false);
  const textColor = lightness < 50 ? '#fff' : '#1B1A18';

  const handleClick = () => {
    navigator.clipboard.writeText(hex).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div
      className="flex-1 h-14 flex flex-col items-center justify-center cursor-pointer relative transition-transform hover:scale-y-110 hover:shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:z-10"
      style={{ backgroundColor: hex, color: textColor }}
      onClick={handleClick}
    >
      <span className="text-[10px] font-medium leading-3.5 opacity-80">{lightness}</span>
      <span className="text-[9px] leading-3 opacity-0 transition-opacity hover:opacity-90 group-hover:opacity-90">
        {copied ? 'Copied!' : hex}
      </span>
    </div>
  );
}
