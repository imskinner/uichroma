import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip.tsx';
import { DarkModeProvider } from '@/hooks/use-dark-mode.tsx';
import { AuthProvider } from '@/hooks/use-auth.tsx';
import { PaletteContext, usePaletteReducer } from '@/hooks/use-palette.ts';
import { HomePage } from '@/pages/HomePage.tsx';
import { PalettePage } from '@/pages/PalettePage.tsx';
import { MyThemesPage } from '@/pages/MyThemesPage.tsx';
import { TeamsPage } from '@/pages/TeamsPage.tsx';
import { JoinPage } from '@/pages/JoinPage.tsx';

function PalettePageWrapper() {
  const { state, dispatch } = usePaletteReducer();
  return (
    <PaletteContext.Provider value={{ ...state, dispatch }}>
      <PalettePage />
    </PaletteContext.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DarkModeProvider>
          <TooltipProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/palette/:permalink" element={<PalettePageWrapper />} />
              <Route path="/my-themes" element={<MyThemesPage />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/join/:code" element={<JoinPage />} />
            </Routes>
          </TooltipProvider>
        </DarkModeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
