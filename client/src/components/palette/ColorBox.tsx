import { useState, useCallback } from 'react';
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

  const handleCopyHex = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(color.hex).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [color.hex]);

  const textColor = textOn(color.hex);

  return (
    <ColorPicker color={color.hex} colorKey={colorKey} onChangeComplete={onColorChange}>
      <div
        className="h-[200px] rounded-2xl p-4 flex flex-col justify-between cursor-pointer shadow-[0_2px_8px_-4px_rgba(0,0,0,0.25)] transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 max-md:h-[120px] max-md:rounded-xl"
        style={{ backgroundColor: color.hex }}
      >
        <span
          className="px-1.5 py-0.5 bg-white/80 border border-white/70 rounded text-xs font-medium cursor-pointer w-fit"
          style={{ color: '#1B1A18' }}
          onClick={handleCopyHex}
        >
          {copied ? 'Copied!' : color.hex}
        </span>
        <span
          className="px-1.5 py-0.5 bg-black/10 border border-black/5 rounded text-xs"
          style={{ color: textColor === '#FFFFFF' ? 'white' : textColor }}
        >
          {PALETTE_LABELS[colorKey]}
        </span>
      </div>
    </ColorPicker>
  );
}
