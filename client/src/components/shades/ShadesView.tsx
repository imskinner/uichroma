import { PALETTE_KEYS, type PaletteColors } from '@/lib/palette-utils.ts';
import { ShadeCard } from './ShadeCard.tsx';

interface ShadesViewProps {
  colors: PaletteColors;
}

export function ShadesView({ colors }: ShadesViewProps) {
  return (
    <div>
      {PALETTE_KEYS.map(key => {
        const color = colors[key];
        if (!color || !color.tones?.length) return null;
        return <ShadeCard key={key} colorKey={key} color={color} />;
      })}
    </div>
  );
}
