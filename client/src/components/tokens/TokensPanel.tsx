import { useEffect } from 'react';
import { buildTheme, type Style } from '@uichroma/core/theme';
import type { PaletteColors } from '@/lib/palette-utils.ts';

interface TokensPanelProps {
  colors: PaletteColors;
  style: Style | null;
}

function googleFontsHref(families: string[]): string {
  const params = families
    .map((f) => `family=${encodeURIComponent(f.trim()).replace(/%20/g, '+')}:wght@400;500;600;700`)
    .join('&');
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

export function TokensPanel({ colors, style }: TokensPanelProps) {
  const { tokens } = buildTheme(colors, style);
  const { heading, body, mono } = tokens.fonts;

  // Load the chosen Google Fonts so the samples actually render in them.
  useEffect(() => {
    const id = 'uichroma-token-fonts';
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = googleFontsHref([heading, body, mono]);
  }, [heading, body, mono]);

  const sectionTitle = 'font-heading font-bold text-base mb-3 text-[#1B1A18] dark:text-[#e5e5e5]';
  const label = 'text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-1';

  return (
    <div className="flex flex-col gap-10">
      {/* Fonts */}
      <div>
        <h3 className={sectionTitle}>Fonts</h3>
        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          {[
            { role: 'Heading', family: heading },
            { role: 'Body', family: body },
            { role: 'Mono', family: mono },
          ].map((f) => (
            <div key={f.role} className="rounded-lg p-4 border border-black/5 dark:border-white/10">
              <div className={label}>{f.role}</div>
              <div className="text-2xl text-[#1B1A18] dark:text-[#e5e5e5]" style={{ fontFamily: `'${f.family}', sans-serif` }}>
                {f.family}
              </div>
              <div className="text-sm mt-1 text-[#6b7280] dark:text-[#9ca3af]" style={{ fontFamily: `'${f.family}', sans-serif` }}>
                The quick brown fox jumps over the lazy dog
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Type scale */}
      <div>
        <h3 className={sectionTitle}>Type scale</h3>
        <div className="flex flex-col gap-1">
          {tokens.typeScale.map((step) => (
            <div key={step.name} className="flex items-baseline gap-4">
              <span className="w-12 shrink-0 text-xs text-[#9ca3af] font-mono">{step.name}</span>
              <span className="w-12 shrink-0 text-xs text-[#9ca3af] font-mono">{step.px}px</span>
              <span
                className="truncate text-[#1B1A18] dark:text-[#e5e5e5]"
                style={{ fontFamily: `'${heading}', sans-serif`, fontSize: step.px, lineHeight: 1.1 }}
              >
                Ag the quick brown fox
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Spacing */}
      <div>
        <h3 className={sectionTitle}>Spacing</h3>
        <div className="flex flex-col gap-1.5">
          {tokens.spacing.map((px, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-10 shrink-0 text-xs text-[#9ca3af] font-mono">{px}</span>
              <div className="h-4 rounded" style={{ width: px, background: colors.primary.hex }} />
            </div>
          ))}
        </div>
      </div>

      {/* Radii */}
      <div>
        <h3 className={sectionTitle}>Radii</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(tokens.radii).map(([name, px]) => (
            <div key={name} className="flex flex-col items-center gap-1">
              <div
                className="w-16 h-16"
                style={{ background: `${colors.primary.hex}22`, border: `2px solid ${colors.primary.hex}`, borderRadius: Math.min(px, 32) }}
              />
              <span className="text-xs text-[#9ca3af] font-mono">{name} · {px >= 9999 ? 'full' : px}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Shadows */}
      <div>
        <h3 className={sectionTitle}>Shadows</h3>
        <div className="flex flex-wrap gap-6 p-2">
          {Object.entries(tokens.shadows).map(([name, value]) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-lg bg-white" style={{ boxShadow: value }} />
              <span className="text-xs text-[#9ca3af] font-mono">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
