import { type CSSProperties } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { buildTheme, type Style } from '@uichroma/core/theme';
import type { PaletteColors } from '@/lib/palette-utils.ts';
import { DemoSettingsProvider, useDemoSettings } from '@/hooks/use-demo-settings.tsx';
import { DemoToolbar } from './DemoToolbar.tsx';
import { DemoLanding } from './DemoLanding.tsx';
import { DemoDashboard } from './DemoDashboard.tsx';
import { DemoMobile } from './DemoMobile.tsx';
import { DemoBlog } from './DemoBlog.tsx';

interface DemoViewProps {
  colors: PaletteColors;
  style?: Style | null;
}

function DemoContent({ colors }: { colors: PaletteColors }) {
  const { isDark, chrome, radii } = useDemoSettings();

  const wrapperStyle = isDark
    ? { background: chrome.background, color: chrome.text }
    : {};

  // Remap the demo's roundness utilities (.rounded-*) to the generated radii via these vars.
  const rootStyle = {
    '--demo-r-sm': `${radii.sm}px`,
    '--demo-r-md': `${radii.md}px`,
    '--demo-r-lg': `${radii.lg}px`,
    '--demo-r-xl': `${radii.xl}px`,
  } as CSSProperties;

  return (
    <div className="demo-themed" style={rootStyle}>
      <DemoToolbar />
      <Tabs defaultValue="landing">
        <TabsList>
          <TabsTrigger value="landing">Landing Page</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="mobile">Mobile App</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
        </TabsList>
        <TabsContent value="landing">
          <div className="rounded-lg overflow-hidden" style={{ ...wrapperStyle, padding: isDark ? 16 : 0 }}>
            <DemoLanding colors={colors} />
          </div>
        </TabsContent>
        <TabsContent value="dashboard">
          <div className="rounded-lg overflow-hidden" style={{ ...wrapperStyle, padding: isDark ? 16 : 0 }}>
            <DemoDashboard colors={colors} />
          </div>
        </TabsContent>
        <TabsContent value="mobile">
          <div className="rounded-lg overflow-hidden" style={wrapperStyle}>
            <DemoMobile colors={colors} />
          </div>
        </TabsContent>
        <TabsContent value="blog">
          <div className="rounded-lg overflow-hidden" style={{ ...wrapperStyle, padding: isDark ? 16 : 0 }}>
            <DemoBlog colors={colors} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function DemoView({ colors, style }: DemoViewProps) {
  const theme = buildTheme(colors, style ?? undefined);
  return (
    <DemoSettingsProvider theme={theme}>
      <DemoContent colors={colors} />
    </DemoSettingsProvider>
  );
}
