import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { buildTheme, type Style } from '@uichroma/core/theme';
import type { PaletteColors } from '@/lib/palette-utils.ts';
import { DemoSettingsProvider, useDemoSettings } from '@/hooks/use-demo-settings.tsx';
import { DemoToolbar } from './DemoToolbar.tsx';
import { DemoComponents } from './DemoComponents.tsx';
import { DemoLanding } from './DemoLanding.tsx';
import { DemoDashboard } from './DemoDashboard.tsx';
import { DemoMobile } from './DemoMobile.tsx';
import { DemoBlog } from './DemoBlog.tsx';

interface DemoViewProps {
  colors: PaletteColors;
  style?: Style | null;
}

function DemoContent({ colors }: { colors: PaletteColors }) {
  const { isDark, chrome } = useDemoSettings();

  const wrapperStyle = isDark
    ? { background: chrome.background, color: chrome.text }
    : {};

  return (
    <>
      <DemoToolbar />
      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="landing">Landing Page</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="mobile">Mobile App</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
        </TabsList>
        <TabsContent value="components">
          <div className="rounded-lg overflow-hidden" style={{ ...wrapperStyle, padding: isDark ? 16 : 0 }}>
            <DemoComponents colors={colors} />
          </div>
        </TabsContent>
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
    </>
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
