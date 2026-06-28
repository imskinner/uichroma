import { buildTheme, type WcagPair } from '@uichroma/core/theme';
import type { PaletteColors } from '@/lib/palette-utils.ts';

interface AccessibilityPanelProps {
  colors: PaletteColors;
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold"
      style={{
        background: ok ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)',
        color: ok ? '#15803d' : '#b91c1c',
      }}
    >
      {label} {ok ? '✓' : '✕'}
    </span>
  );
}

function PairRow({ p }: { p: WcagPair }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-black/5 dark:border-white/10">
      <span
        className="w-14 h-8 rounded flex items-center justify-center text-xs font-bold shrink-0"
        style={{ background: p.bg, color: p.fg, border: '1px solid rgba(0,0,0,0.08)' }}
      >
        Aa
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm truncate text-[#1B1A18] dark:text-[#e5e5e5]">{p.name}</div>
        <div className="text-xs text-[#6b7280] dark:text-[#9ca3af]">{p.ratio.toFixed(2)}:1</div>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <Badge ok={p.AA} label="AA" />
        <Badge ok={p.AAA} label="AAA" />
      </div>
    </div>
  );
}

export function AccessibilityPanel({ colors }: AccessibilityPanelProps) {
  const { wcag } = buildTheme(colors);
  const columns: { title: string; pairs: WcagPair[] }[] = [
    { title: 'Light mode', pairs: wcag.light },
    { title: 'Dark mode', pairs: wcag.dark },
  ];

  return (
    <div>
      <p className="mb-5 text-sm text-[#1B1A18] dark:text-[#e5e5e5]">
        <strong>{wcag.summary.passAA}/{wcag.summary.total}</strong> foreground/background pairs pass WCAG{' '}
        <strong>AA</strong> (≥4.5:1); <strong>{wcag.summary.passAAA}</strong> pass <strong>AAA</strong> (≥7:1) —
        across both generated modes. Light + dark chrome is derived from the palette automatically.
      </p>
      <div className="grid grid-cols-2 gap-8 max-md:grid-cols-1">
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="font-heading font-bold text-base mb-2 text-[#1B1A18] dark:text-[#e5e5e5]">
              {col.title}
            </h3>
            <div>
              {col.pairs.map((p, i) => (
                <PairRow key={i} p={p} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
