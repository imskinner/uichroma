import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip.tsx';
import { PaletteContext, usePaletteReducer } from '@/hooks/use-palette.ts';
import { HomePage } from '@/pages/HomePage.tsx';
import { PalettePage } from '@/pages/PalettePage.tsx';

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
      <TooltipProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/palette/:permalink" element={<PalettePageWrapper />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  );
}
