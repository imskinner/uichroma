import { PALETTE_KEYS, type PaletteKey, type PaletteColors } from '@/lib/palette-utils.ts';
import { ColorBox } from './ColorBox.tsx';

interface ColorGridProps {
  colors: PaletteColors;
  onColorChange: (key: PaletteKey, hex: string) => void;
}

export function ColorGrid({ colors, onColorChange }: ColorGridProps) {
  const topRow = PALETTE_KEYS.slice(0, 3);
  const bottomRow = PALETTE_KEYS.slice(3);

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex gap-3 max-md:flex-wrap">
        {topRow.map(key => (
          <div key={key} className="flex-1 min-w-0 max-md:basis-[calc(50%-6px)]">
            <ColorBox colorKey={key} color={colors[key]} onColorChange={onColorChange} />
          </div>
        ))}
      </div>
      <div className="flex gap-3 max-md:flex-wrap">
        {bottomRow.map(key => (
          <div key={key} className="flex-1 min-w-0 max-md:basis-[calc(33.3%-8px)]">
            <ColorBox colorKey={key} color={colors[key]} onColorChange={onColorChange} />
          </div>
        ))}
      </div>
    </div>
  );
}
