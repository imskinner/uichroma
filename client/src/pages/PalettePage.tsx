import { useEffect, useCallback, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Sparkles, Shuffle, Moon, Sun } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { BackgroundEllipses } from '@/components/layout/BackgroundEllipses.tsx';
import { GlassCard } from '@/components/layout/GlassCard.tsx';
import { TopBar } from '@/components/layout/TopBar.tsx';
import { ColorGrid } from '@/components/palette/ColorGrid.tsx';
import { PermalinkBar } from '@/components/palette/PermalinkBar.tsx';
import { ShadesView } from '@/components/shades/ShadesView.tsx';
import { AccessibilityPanel } from '@/components/accessibility/AccessibilityPanel.tsx';
import { TokensPanel } from '@/components/tokens/TokensPanel.tsx';
import { DemoView } from '@/components/demo/DemoView.tsx';
import { ExportSection } from '@/components/export/ExportSection.tsx';
import { ConstraintPackSection } from '@/components/export/ConstraintPackSection.tsx';
import { usePalette } from '@/hooks/use-palette.ts';
import { useDarkMode } from '@/hooks/use-dark-mode.tsx';
import { useAuth } from '@/hooks/use-auth.tsx';
import { getPaletteData, updatePalette, generateVariation } from '@/lib/api.ts';
import { normalizePaletteColors } from '@/lib/palette-utils.ts';
import type { PaletteKey } from '@/lib/palette-utils.ts';

export function PalettePage() {
  const { permalink } = useParams<{ permalink: string }>();
  const navigate = useNavigate();
  const { colors, keywords, style, isDirty, dispatch } = usePalette();
  const { isDark, toggleDark } = useDarkMode();
  const { session } = useAuth();
  const [variationLoading, setVariationLoading] = useState(false);

  useEffect(() => {
    if (!permalink) return;
    getPaletteData(permalink)
      .then(data => {
        const normalized = normalizePaletteColors(data.colors);
        dispatch({ type: 'SET_PALETTE', colors: normalized, permalink, keywords: data.keywords, style: data.style });
      })
      .catch(err => console.error('Failed to load palette:', err));
  }, [permalink, dispatch]);

  const handleColorChange = useCallback((key: PaletteKey, hex: string) => {
    dispatch({ type: 'UPDATE_COLOR', key, hex });
  }, [dispatch]);

  const handleSave = useCallback(async () => {
    if (!permalink || !colors) return;
    try {
      await updatePalette(permalink, colors, session?.access_token);
      dispatch({ type: 'MARK_SAVED' });
    } catch (err) {
      console.error('Save error:', err);
      alert(err instanceof Error ? err.message : 'Failed to save changes.');
    }
  }, [permalink, colors, dispatch, session]);

  const handleVariation = useCallback(async () => {
    if (!colors) return;
    setVariationLoading(true);
    try {
      const result = await generateVariation(keywords || '', session?.access_token);
      navigate(`/palette/${result.permalink}`);
    } catch (err) {
      console.error('Variation error:', err);
      alert('Failed to generate variation.');
    } finally {
      setVariationLoading(false);
    }
  }, [colors, keywords, navigate, session]);

  const actions = (
    <>
      {isDirty && (
        <button
          onClick={handleSave}
          className="px-4 py-2.5 border-none rounded-lg bg-[#16a34a] text-white font-medium text-sm cursor-pointer hover:bg-[#15803d] transition-colors"
        >
          Save Changes
        </button>
      )}
      <button
        onClick={handleVariation}
        disabled={variationLoading || !colors}
        className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-[#8b5cf6] rounded-lg bg-transparent text-[#8b5cf6] font-medium text-sm cursor-pointer hover:bg-[#f3f0ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-[#8b5cf620]"
      >
        <Shuffle size={18} className={variationLoading ? 'animate-spin' : ''} />
        {variationLoading ? 'Generating...' : 'Make Variation'}
      </button>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-[#008CF4] rounded-lg bg-transparent text-[#008CF4] font-medium text-sm no-underline hover:bg-[#E5F4FF] transition-colors dark:hover:bg-[#008CF420]"
      >
        <Sparkles size={18} />
        New Palette
      </Link>
      <button
        onClick={toggleDark}
        className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm cursor-pointer border transition-colors"
        style={{
          background: isDark ? '#1a1a1a' : '#fff',
          color: isDark ? '#e5e5e5' : '#374151',
          borderColor: isDark ? '#444' : '#d1d5db',
        }}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
        {isDark ? 'Light' : 'Dark'}
      </button>
    </>
  );

  if (!colors) {
    return (
      <div className="landing-bg min-h-screen flex items-start justify-center p-10 max-md:p-4 overflow-auto">
        <BackgroundEllipses />
        <GlassCard>
          <TopBar actions={actions} />
          <div className="flex justify-center py-20">
            <div className="loader" />
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="landing-bg min-h-screen flex items-start justify-center p-10 max-md:p-4 overflow-auto">
      <BackgroundEllipses />
      <GlassCard>
        <TopBar actions={actions} />

        {/* Header */}
        <div className="px-15 pt-10 max-md:px-6 max-md:pt-6">
          <h1
            className="font-heading font-bold text-5xl leading-[56px] mb-2 max-md:text-[32px] max-md:leading-10"
            style={{ color: isDark ? '#e5e5e5' : '#1B1A18' }}
          >
            {keywords ? `\u201C${keywords}\u201D` : 'Your Color Palette'}
          </h1>
          <ul className="list-none p-0 m-0 flex flex-wrap gap-3 mb-0">
            {(['primary', 'secondary', 'accent', 'warning', 'danger', 'success', 'info', 'neutral'] as PaletteKey[]).map(key => {
              const c = colors[key];
              if (!c?.description) return null;
              return (
                <li key={key} className="text-base leading-6" style={{ color: isDark ? '#d1d5db' : '#1B1A18' }}>
                  <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {c.description}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Body */}
        <div className="flex-1 px-15 py-8 pb-15 max-md:px-6 max-md:py-4 max-md:pb-8">
          <Tabs defaultValue="palette">
            <TabsList className="mb-6">
              <TabsTrigger value="palette">Palette</TabsTrigger>
              <TabsTrigger value="shades">Shades</TabsTrigger>
              <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
              <TabsTrigger value="tokens">Tokens</TabsTrigger>
              <TabsTrigger value="demo">Demo</TabsTrigger>
            </TabsList>

            <TabsContent value="palette">
              <ColorGrid colors={colors} onColorChange={handleColorChange} />
              {permalink && <PermalinkBar permalink={permalink} />}
            </TabsContent>

            <TabsContent value="shades">
              <ShadesView colors={colors} />
            </TabsContent>

            <TabsContent value="accessibility">
              <AccessibilityPanel colors={colors} />
            </TabsContent>

            <TabsContent value="tokens">
              <TokensPanel colors={colors} style={style} />
            </TabsContent>

            <TabsContent value="demo">
              <DemoView colors={colors} style={style} />
            </TabsContent>
          </Tabs>

          <ExportSection colors={colors} style={style} />
          <ConstraintPackSection colors={colors} vibe={keywords} permalink={permalink} style={style} />
        </div>
      </GlassCard>
    </div>
  );
}
