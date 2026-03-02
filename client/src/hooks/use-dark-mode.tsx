import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface DarkModeContextValue {
  isDark: boolean;
  toggleDark: () => void;
  setIsDark: (dark: boolean) => void;
}

const DarkModeContext = createContext<DarkModeContextValue>({
  isDark: false,
  toggleDark: () => {},
  setIsDark: () => {},
});

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDark: () => setIsDark(d => !d), setIsDark }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  return useContext(DarkModeContext);
}
