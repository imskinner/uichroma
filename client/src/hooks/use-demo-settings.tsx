import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useDarkMode } from '@/hooks/use-dark-mode.tsx';
import { loadGoogleFont } from '@/lib/google-fonts.ts';
import type { Theme, TokenSet, StyleTokens } from '@uichroma/core/theme';

interface DemoSettings {
  headingFont: string;
  bodyFont: string;
  isDark: boolean;
  /** Active mode's generated chrome tokens (background/surface/text/border…). */
  chrome: TokenSet;
  /** Generated corner radii. */
  radii: StyleTokens['radii'];
  setHeadingFont: (font: string) => void;
  setBodyFont: (font: string) => void;
  setIsDark: (dark: boolean) => void;
}

const FALLBACK_CHROME: TokenSet = {
  background: '#ffffff',
  surface: '#ffffff',
  surfaceMuted: '#f1f2f4',
  text: '#1a1a1a',
  textMuted: '#6b7280',
  border: '#e5e7eb',
};
const FALLBACK_RADII: StyleTokens['radii'] = { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 };

const DemoSettingsContext = createContext<DemoSettings>({
  headingFont: 'Inter',
  bodyFont: 'Inter',
  isDark: false,
  chrome: FALLBACK_CHROME,
  radii: FALLBACK_RADII,
  setHeadingFont: () => {},
  setBodyFont: () => {},
  setIsDark: () => {},
});

export function DemoSettingsProvider({ theme, children }: { theme: Theme; children: ReactNode }) {
  // Default the demo typography to the brand's generated fonts (user can still override).
  const [headingFont, setHeadingFont] = useState(theme.tokens.fonts.heading);
  const [bodyFont, setBodyFont] = useState(theme.tokens.fonts.body);
  const { isDark, setIsDark } = useDarkMode();

  useEffect(() => {
    loadGoogleFont(theme.tokens.fonts.heading);
    loadGoogleFont(theme.tokens.fonts.body);
  }, [theme.tokens.fonts.heading, theme.tokens.fonts.body]);

  const chrome = isDark ? theme.modes.dark : theme.modes.light;

  return (
    <DemoSettingsContext.Provider
      value={{
        headingFont,
        bodyFont,
        isDark,
        chrome,
        radii: theme.tokens.radii,
        setHeadingFont,
        setBodyFont,
        setIsDark,
      }}
    >
      {children}
    </DemoSettingsContext.Provider>
  );
}

export function useDemoSettings() {
  return useContext(DemoSettingsContext);
}
