import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { Button } from '@/components/ui/button.tsx';
import { EXPORT_FORMATS, downloadFile } from '@/lib/export-utils.ts';
import type { PaletteColors } from '@/lib/palette-utils.ts';
import type { Style } from '@uichroma/core/theme';

interface ExportSectionProps {
  colors: PaletteColors;
  style?: Style | null;
}

const FORMAT_KEYS = ['css', 'scss', 'tailwind', 'json', 'dtcg'] as const;

export function ExportSection({ colors, style }: ExportSectionProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const handleCopy = useCallback((format: string) => {
    const fmt = EXPORT_FORMATS[format];
    if (!fmt) return;
    const text = fmt.generator(colors, style);
    navigator.clipboard.writeText(text).then(() => {
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    });
  }, [colors, style]);

  const handleDownload = useCallback((format: string) => {
    const fmt = EXPORT_FORMATS[format];
    if (!fmt) return;
    const text = fmt.generator(colors, style);
    downloadFile(text, fmt.filename, fmt.mime);
  }, [colors, style]);

  return (
    <section className="mt-8">
      <h2 className="font-heading font-bold text-2xl mb-4 text-[#1B1A18] dark:text-[#e5e5e5]">Export Palette</h2>
      <Tabs defaultValue="css">
        <TabsList>
          {FORMAT_KEYS.map(key => (
            <TabsTrigger key={key} value={key}>{EXPORT_FORMATS[key].label}</TabsTrigger>
          ))}
        </TabsList>
        {FORMAT_KEYS.map(key => {
          const fmt = EXPORT_FORMATS[key];
          const text = fmt.generator(colors, style);
          return (
            <TabsContent key={key} value={key}>
              <div className="flex gap-2 mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(key)}
                >
                  {copiedFormat === key ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(key)}
                >
                  Download
                </Button>
              </div>
              <pre className="bg-[#42403D] text-[#FAFAFA] rounded-lg p-4 overflow-auto max-h-80 text-xs leading-5 font-mono">
                <code>{text}</code>
              </pre>
            </TabsContent>
          );
        })}
      </Tabs>
    </section>
  );
}
