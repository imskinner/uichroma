import { useState, useCallback } from 'react';
import { Copy, Check, Pencil } from 'lucide-react';
import { textOn } from '@/lib/color-utils.ts';
import { PALETTE_LABELS, type PaletteKey, type PaletteColor } from '@/lib/palette-utils.ts';
import { ColorPicker } from './ColorPicker.tsx';

interface ColorBoxProps {
  colorKey: PaletteKey;
  color: PaletteColor;
  onColorChange: (key: PaletteKey, hex: string) => void;
}

export function ColorBox({ colorKey, color, onColorChange }: ColorBoxProps) {
  const [copied, setCopied] = useState(false);
  const on = textOn(color.hex);
  const chipBg = on === '#FFFFFF' ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.10)';

  const copyHex = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(color.hex).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    },
    [color.hex],
  );

  return (
    <ColorPicker color={color.hex} colorKey={colorKey} onChangeComplete={onColorChange}>
      <div
        className="group relative h-[200px] rounded-2xl p-4 flex flex-col justify-between cursor-pointer overflow-hidden shadow-[0_2px_10px_-6px_rgba(0,0,0,0.3)] transition-[transform,box-shadow] duration-200 hover:shadow-[0_16px_34px_-12px_rgba(0,0,0,0.45)] hover:-translate-y-1 max-md:h-[132px] max-md:rounded-xl"
        style={{ backgroundColor: color.hex, color: on }}
      >
        <div className="flex items-start justify-between">
          <span className="font-heading font-semibold text-[15px] leading-none">{PALETTE_LABELS[colorKey]}</span>
          <Pencil size={14} className="opacity-0 group-hover:opacity-60 transition-opacity" />
        </div>
        <button
          onClick={copyHex}
          className="self-start inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono font-medium transition-colors hover:brightness-110"
          style={{ background: chipBg }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} className="opacity-70" />}
          {copied ? 'Copied' : color.hex.toUpperCase()}
        </button>
      </div>
    </ColorPicker>
  );
}
