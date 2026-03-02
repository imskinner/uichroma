import { createContext, useContext, useState, type ReactNode } from 'react';

interface DemoSettings {
  headingFont: string;
  bodyFont: string;
  isDark: boolean;
  setHeadingFont: (font: string) => void;
  setBodyFont: (font: string) => void;
  setIsDark: (dark: boolean) => void;
}

const DemoSettingsContext = createContext<DemoSettings>({
  headingFont: 'Inter',
  bodyFont: 'Inter',
  isDark: false,
  setHeadingFont: () => {},
  setBodyFont: () => {},
  setIsDark: () => {},
});

export function DemoSettingsProvider({ children }: { children: ReactNode }) {
  const [headingFont, setHeadingFont] = useState('Inter');
  const [bodyFont, setBodyFont] = useState('Inter');
  const [isDark, setIsDark] = useState(false);

  return (
    <DemoSettingsContext.Provider
      value={{ headingFont, bodyFont, isDark, setHeadingFont, setBodyFont, setIsDark }}
    >
      {children}
    </DemoSettingsContext.Provider>
  );
}

export function useDemoSettings() {
  return useContext(DemoSettingsContext);
}
