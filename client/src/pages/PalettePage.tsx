import { useEffect, useCallback, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Sparkles, Moon, Sun, Palette as PaletteIcon, Layers, Eye, Type, Blocks, LayoutGrid, Download } from 'lucide-react';
import { BackgroundEllipses } from '@/components/layout/BackgroundEllipses.tsx';
import { GlassCard } from '@/components/layout/GlassCard.tsx';
import { TopBar } from '@/components/layout/TopBar.tsx';
import { StudioSidebar, type StudioSection } from '@/components/studio/StudioSidebar.tsx';
import { OverviewSection } from '@/components/studio/OverviewSection.tsx';
import { ColorGrid } from '@/components/palette/ColorGrid.tsx';
import { PermalinkBar } from '@/components/palette/PermalinkBar.tsx';
import { ShadesView } from '@/components/shades/ShadesView.tsx';
import { AccessibilityPanel } from '@/components/accessibility/AccessibilityPanel.tsx';
import { TokensPanel } from '@/components/tokens/TokensPanel.tsx';
import { ComponentGallery } from '@/components/studio/ComponentGallery.tsx';
import { DemoView } from '@/components/demo/DemoView.tsx';
import { ExportSection } from '@/components/export/ExportSection.tsx';
import { ConstraintPackSection } from '@/components/export/ConstraintPackSection.tsx';
import { MakeVariationButton } from '@/components/palette/MakeVariationButton.tsx';
import { ShareToTeamButton } from '@/components/teams/ShareToTeamButton.tsx';
import { usePalette } from '@/hooks/use-palette.ts';
import { usePaletteBackground } from '@/hooks/use-palette-background.ts';
import { useDarkMode } from '@/hooks/use-dark-mode.tsx';
import { useAuth } from '@/hooks/use-auth.tsx';
import { getPaletteData, updatePalette, generateVariation } from '@/lib/api.ts';
import { normalizePaletteColors } from '@/lib/palette-utils.ts';
import type { PaletteKey } from '@/lib/palette-utils.ts';

const SECTIONS: StudioSection[] = [
  { id: 'overview', label: 'Overview', icon: Sparkles },
  { id: 'palette', label: 'Palette', icon: PaletteIcon },
  { id: 'shades', label: 'Shades', icon: Layers },
  { id: 'accessibility', label: 'Accessibility', icon: Eye },
  { id: 'tokens', label: 'Tokens', icon: Type },
  { id: 'components', label: 'Components', icon: Blocks },
  { id: 'demos', label: 'Demos', icon: LayoutGrid },
  { id: 'handoff', label: 'Handoff', icon: Download },
];

const SECTION_META: Record<string, { title: string; desc: string }> = {
  overview: { title: 'Overview', desc: 'Your generated brand system at a glance.' },
  palette: { title: 'Palette', desc: 'The eight semantic roles — click a swatch to fine-tune.' },
  shades: { title: 'Shades', desc: 'A 10-step tonal ramp for every role.' },
  accessibility: { title: 'Accessibility', desc: 'WCAG contrast for every pair, in light and dark.' },
  tokens: { title: 'Tokens', desc: 'Typography, spacing, radii and shadows.' },
  components: { title: 'Components', desc: 'A storybook of every UI component, themed with your brand.' },
  demos: { title: 'Demos', desc: 'Your theme applied to full interfaces.' },
  handoff: { title: 'Handoff', desc: 'Export the tokens and the AI constraint packs.' },
};

export function PalettePage() {
  const { permalink } = useParams<{ permalink: string }>();
  const navigate = useNavigate();
  const { colors, keywords, style, isDirty, dispatch } = usePalette();
  const { isDark, toggleDark } = useDarkMode();
  const { session } = useAuth();
  const [variationLoading, setVariationLoading] = useState(false);
  const [active, setActive] = useState('overview');

  // Ease the drifting background glows into the active brand's colors.
  usePaletteBackground(colors);

  useEffect(() => {
    if (!permalink) return;
    getPaletteData(permalink)
      .then(data => {
        // Canonicalize legacy MD5 links to the human-readable slug URL.
        if (data.slug && data.slug !== permalink) {
          navigate(`/palette/${data.slug}`, { replace: true });
          return;
        }
        const normalized = normalizePaletteColors(data.colors);
        dispatch({ type: 'SET_PALETTE', colors: normalized, permalink, keywords: data.keywords, style: data.style });
      })
      .catch(err => console.error('Failed to load palette:', err));
  }, [permalink, dispatch, navigate]);

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

  const handleVariation = useCallback(async (overridePrompt?: string) => {
    if (!colors) return;
    setVariationLoading(true);
    try {
      const result = await generateVariation(overridePrompt ?? (keywords || ''), session?.access_token);
      navigate(`/palette/${result.slug || result.permalink}`);
    } catch (err) {
      console.error('Variation error:', err);
      alert('Failed to generate variation.');
    } finally {
      setVariationLoading(false);
    }
  }, [colors, keywords, navigate, session]);

  const actions = (
    <>
      {permalink && <ShareToTeamButton permalink={permalink} />}
      {isDirty && (
        <button
          onClick={handleSave}
          className="px-4 py-2.5 border-none rounded-lg bg-[#16a34a] text-white font-medium text-sm cursor-pointer hover:bg-[#15803d] transition-colors"
        >
          Save Changes
        </button>
      )}
      <MakeVariationButton
        keywords={keywords || ''}
        loading={variationLoading}
        onGenerate={handleVariation}
      />
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
        <GlassCard className="md:h-[calc(100vh-5rem)]">
          <TopBar actions={actions} />
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
            <div className="loader" />
            <p className="text-sm text-[#6b7280] dark:text-[#9ca3af]">Loading your theme…</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="landing-bg min-h-screen flex items-start justify-center p-10 max-md:p-4 overflow-auto">
      <BackgroundEllipses />
      <GlassCard className="md:h-[calc(100vh-5rem)]">
        <TopBar actions={actions} />

        <div className="flex flex-1 min-h-0 border-t border-black/[0.06] dark:border-white/[0.08] max-md:flex-col">
          <StudioSidebar
            sections={SECTIONS}
            active={active}
            onSelect={setActive}
            colors={colors}
            keywords={keywords}
          />

          <main className="flex-1 min-w-0 px-12 py-9 pb-14 max-md:px-6 max-md:py-6 md:overflow-y-auto studio-scroll">
            <div key={active} className="section-enter">
              <div className="mb-7">
                <h1 className="font-heading font-bold text-[28px] leading-tight text-[#1B1A18] dark:text-[#e5e5e5]">
                  {SECTION_META[active].title}
                </h1>
                <p className="text-[15px] text-[#6b7280] dark:text-[#9ca3af] mt-1">
                  {SECTION_META[active].desc}
                </p>
              </div>

              {active === 'overview' && <OverviewSection colors={colors} style={style} />}

              {active === 'palette' && (
                <>
                  <ColorGrid colors={colors} onColorChange={handleColorChange} />
                  {permalink && <PermalinkBar permalink={permalink} />}
                </>
              )}

              {active === 'shades' && <ShadesView colors={colors} />}
              {active === 'accessibility' && <AccessibilityPanel colors={colors} />}
              {active === 'tokens' && <TokensPanel colors={colors} style={style} />}
              {active === 'components' && <ComponentGallery colors={colors} style={style} />}
              {active === 'demos' && <DemoView colors={colors} style={style} />}

              {active === 'handoff' && (
                <div className="flex flex-col">
                  <ExportSection colors={colors} style={style} />
                  <ConstraintPackSection colors={colors} vibe={keywords} permalink={permalink} style={style} />
                </div>
              )}
            </div>
          </main>
        </div>
      </GlassCard>
    </div>
  );
}
