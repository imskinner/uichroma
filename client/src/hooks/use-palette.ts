import { createContext, useContext, useReducer, useCallback, useEffect, type Dispatch } from 'react';
import type { PaletteColors, PaletteKey } from '@/lib/palette-utils.ts';
import { hexToHSL, hslToHex, generateTonesForColor } from '@/lib/color-utils.ts';
import type { Style } from '@uichroma/core/theme';

interface PaletteState {
  colors: PaletteColors | null;
  permalink: string | null;
  keywords: string | null;
  style: Style | null;
  isDirty: boolean;
}

type PaletteAction =
  | { type: 'SET_PALETTE'; colors: PaletteColors; permalink: string; keywords?: string; style?: Style | null }
  | { type: 'UPDATE_COLOR'; key: PaletteKey; hex: string }
  | { type: 'MARK_SAVED' };

function paletteReducer(state: PaletteState, action: PaletteAction): PaletteState {
  switch (action.type) {
    case 'SET_PALETTE':
      return {
        colors: action.colors,
        permalink: action.permalink,
        keywords: action.keywords ?? null,
        style: action.style ?? null,
        isDirty: false,
      };
    case 'UPDATE_COLOR': {
      if (!state.colors) return state;
      const hsl = hexToHSL(action.hex);
      const tones = generateTonesForColor(hsl.h, hsl.s);
      const existing = state.colors[action.key];
      const updated: PaletteColors = {
        ...state.colors,
        [action.key]: {
          hex: action.hex,
          h: hsl.h,
          s: hsl.s,
          l: hsl.l,
          tones,
          description: existing?.description || '',
        },
      };
      // Re-derive neutral when primary changes
      if (action.key === 'primary') {
        const neutralHex = hslToHex(hsl.h, 10, 10);
        const neutralHSL = hexToHSL(neutralHex);
        const neutralTones = generateTonesForColor(neutralHSL.h, neutralHSL.s);
        updated.neutral = {
          hex: neutralHex,
          h: neutralHSL.h,
          s: neutralHSL.s,
          l: neutralHSL.l,
          tones: neutralTones,
          description: state.colors.neutral?.description || '',
        };
      }
      return { ...state, colors: updated, isDirty: true };
    }
    case 'MARK_SAVED':
      return { ...state, isDirty: false };
    default:
      return state;
  }
}

const initialState: PaletteState = {
  colors: null,
  permalink: null,
  keywords: null,
  style: null,
  isDirty: false,
};

export interface PaletteContextValue extends PaletteState {
  dispatch: Dispatch<PaletteAction>;
}

export const PaletteContext = createContext<PaletteContextValue>({
  ...initialState,
  dispatch: () => {},
});

export function usePaletteReducer() {
  const [state, dispatch] = useReducer(paletteReducer, initialState);

  // Warn on unsaved changes
  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (state.isDirty) {
      e.preventDefault();
    }
  }, [state.isDirty]);

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [handleBeforeUnload]);

  return { state, dispatch };
}

export function usePalette() {
  return useContext(PaletteContext);
}
