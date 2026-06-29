import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { Button } from '@/components/ui/button.tsx';
import { generateAgentsMd, generateClaudeSkill, generateCursorRules } from '@uichroma/core/constraints';
import { buildTheme, type Style } from '@uichroma/core/theme';
import { downloadFile } from '@/lib/export-utils.ts';
import type { PaletteColors } from '@/lib/palette-utils.ts';

interface ConstraintPackSectionProps {
  colors: PaletteColors;
  vibe?: string | null;
  permalink?: string | null;
  style?: Style | null;
}

interface PackFormat {
  label: string;
  filename: string;
  mime: string;
  hint: string;
  generator: (colors: PaletteColors, vibe?: string, permalink?: string, style?: Style | null) => string;
}

function buildInput(colors: PaletteColors, vibe?: string, permalink?: string, style?: Style | null) {
  const theme = buildTheme(colors, style ?? undefined);
  return {
    colors,
    vibe: vibe || undefined,
    permalink: permalink || undefined,
    modes: theme.modes,
    wcag: theme.wcag,
    tokens: theme.tokens,
  };
}

const PACKS: Record<string, PackFormat> = {
  agents: {
    label: 'AGENTS.md',
    filename: 'AGENTS.md',
    mime: 'text/markdown',
    hint: 'Place at your repo root as AGENTS.md — read by most coding agents.',
    generator: (c, v, p, s) => generateAgentsMd(buildInput(c, v, p, s)),
  },
  claude: {
    label: 'Claude Skill',
    filename: 'SKILL.md',
    mime: 'text/markdown',
    hint: 'Place at .claude/skills/<brand>-theme/SKILL.md, alongside the DTCG tokens.dtcg.json.',
    generator: (c, v, p, s) => generateClaudeSkill(buildInput(c, v, p, s)),
  },
  cursor: {
    label: 'Cursor Rule',
    filename: 'theme.mdc',
    mime: 'text/markdown',
    hint: 'Place at .cursor/rules/<brand>-theme.mdc — applied automatically in Cursor.',
    generator: (c, v, p, s) => generateCursorRules(buildInput(c, v, p, s)),
  },
};

const PACK_KEYS = ['agents', 'claude', 'cursor'] as const;

export function ConstraintPackSection({ colors, vibe, permalink, style }: ConstraintPackSectionProps) {
  const [copiedPack, setCopiedPack] = useState<string | null>(null);

  const handleCopy = useCallback((pack: string) => {
    const fmt = PACKS[pack];
    if (!fmt) return;
    const text = fmt.generator(colors, vibe ?? undefined, permalink ?? undefined, style ?? undefined);
    navigator.clipboard.writeText(text).then(() => {
      setCopiedPack(pack);
      setTimeout(() => setCopiedPack(null), 2000);
    });
  }, [colors, vibe, permalink, style]);

  const handleDownload = useCallback((pack: string) => {
    const fmt = PACKS[pack];
    if (!fmt) return;
    const text = fmt.generator(colors, vibe ?? undefined, permalink ?? undefined, style ?? undefined);
    downloadFile(text, fmt.filename, fmt.mime);
  }, [colors, vibe, permalink, style]);

  return (
    <section className="mt-8">
      <h2 className="font-heading font-bold text-2xl mb-1 text-[#1B1A18] dark:text-[#e5e5e5]">AI Constraint Pack</h2>
      <p className="text-sm mb-4 text-[#6b7280] dark:text-[#9ca3af]">
        Feed these to your codegen agent (v0, Lovable, Cursor, Claude Code) so it builds <em>your</em> brand, not the generic default.
      </p>
      <Tabs defaultValue="agents">
        <TabsList>
          {PACK_KEYS.map(key => (
            <TabsTrigger key={key} value={key}>{PACKS[key].label}</TabsTrigger>
          ))}
        </TabsList>
        {PACK_KEYS.map(key => {
          const fmt = PACKS[key];
          const text = fmt.generator(colors, vibe ?? undefined, permalink ?? undefined, style ?? undefined);
          return (
            <TabsContent key={key} value={key}>
              <div className="flex items-center gap-2 mb-3">
                <Button variant="outline" size="sm" onClick={() => handleCopy(key)}>
                  {copiedPack === key ? 'Copied!' : 'Copy'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload(key)}>
                  Download
                </Button>
                <span className="text-xs text-[#6b7280] dark:text-[#9ca3af]">{fmt.hint}</span>
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
