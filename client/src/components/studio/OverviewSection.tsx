import { buildTheme, type Style } from '@uichroma/core/theme';
import { textOn } from '@/lib/color-utils.ts';
import type { PaletteColors, PaletteKey } from '@/lib/palette-utils.ts';

interface OverviewSectionProps {
  colors: PaletteColors;
  style: Style | null;
}

const ROLES: PaletteKey[] = ['primary', 'secondary', 'accent', 'warning', 'danger', 'success', 'info', 'neutral'];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-5 py-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9ca3af]">{label}</div>
      <div className="font-heading font-bold text-lg text-[#1B1A18] dark:text-[#e5e5e5] mt-1 truncate">{value}</div>
      <div className="text-xs text-[#6b7280] dark:text-[#9ca3af] truncate">{sub}</div>
    </div>
  );
}

export function OverviewSection({ colors, style }: OverviewSectionProps) {
  const { wcag, tokens } = buildTheme(colors, style ?? undefined);

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
        <Stat label="Accessibility" value={`${wcag.summary.passAA}/${wcag.summary.total} pass AA`} sub={`${wcag.summary.passAAA} pass AAA · both modes`} />
        <Stat label="Typography" value={tokens.fonts.heading} sub={`body · ${tokens.fonts.body}`} />
        <Stat label="Modes" value="Light + Dark" sub="generated automatically" />
      </div>

      <div>
        <h3 className="font-heading font-bold text-xl text-[#1B1A18] dark:text-[#e5e5e5] mb-1">Color story</h3>
        <p className="text-sm text-[#6b7280] dark:text-[#9ca3af] mb-5">Why each role was chosen for this brand.</p>
        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          {ROLES.map((r) => {
            const c = colors[r];
            if (!c) return null;
            return (
              <div
                key={r}
                className="flex gap-4 p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03]"
              >
                <div
                  className="w-14 h-14 rounded-xl shrink-0 ring-1 ring-inset ring-black/10"
                  style={{ background: c.hex, color: textOn(c.hex) }}
                />
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-[#1B1A18] dark:text-[#e5e5e5]">{cap(r)}</span>
                    <span className="text-xs font-mono text-[#9ca3af]">{c.hex}</span>
                  </div>
                  <p className="text-sm text-[#6b7280] dark:text-[#9ca3af] mt-1 leading-relaxed">
                    {c.description || 'A supporting color in the system.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
