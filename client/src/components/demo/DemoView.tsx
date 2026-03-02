import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import type { PaletteColors } from '@/lib/palette-utils.ts';
import { DemoComponents } from './DemoComponents.tsx';
import { DemoLanding } from './DemoLanding.tsx';
import { DemoDashboard } from './DemoDashboard.tsx';
import { DemoMobile } from './DemoMobile.tsx';
import { DemoBlog } from './DemoBlog.tsx';

interface DemoViewProps {
  colors: PaletteColors;
}

export function DemoView({ colors }: DemoViewProps) {
  return (
    <Tabs defaultValue="components">
      <TabsList>
        <TabsTrigger value="components">Components</TabsTrigger>
        <TabsTrigger value="landing">Landing Page</TabsTrigger>
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="mobile">Mobile App</TabsTrigger>
        <TabsTrigger value="blog">Blog</TabsTrigger>
      </TabsList>
      <TabsContent value="components"><DemoComponents colors={colors} /></TabsContent>
      <TabsContent value="landing"><DemoLanding colors={colors} /></TabsContent>
      <TabsContent value="dashboard"><DemoDashboard colors={colors} /></TabsContent>
      <TabsContent value="mobile"><DemoMobile colors={colors} /></TabsContent>
      <TabsContent value="blog"><DemoBlog colors={colors} /></TabsContent>
    </Tabs>
  );
}
