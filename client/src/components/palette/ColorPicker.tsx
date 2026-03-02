import { useState, useCallback } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import type { PaletteKey } from '@/lib/palette-utils.ts';

interface ColorPickerProps {
  color: string;
  colorKey: PaletteKey;
  onChangeComplete: (key: PaletteKey, hex: string) => void;
  children: React.ReactNode;
}

export function ColorPicker({ color, colorKey, onChangeComplete, children }: ColorPickerProps) {
  const [tempColor, setTempColor] = useState(color);
  const [open, setOpen] = useState(false);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (isOpen) {
      setTempColor(color);
    } else if (tempColor !== color) {
      onChangeComplete(colorKey, tempColor);
    }
    setOpen(isOpen);
  }, [color, tempColor, colorKey, onChangeComplete]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <HexColorPicker color={tempColor} onChange={setTempColor} />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground">{tempColor}</span>
          <button
            className="text-xs font-medium px-3 py-1 bg-[#008CF4] text-white rounded hover:bg-[#0072C6] cursor-pointer"
            onClick={() => {
              onChangeComplete(colorKey, tempColor);
              setOpen(false);
            }}
          >
            Save
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
