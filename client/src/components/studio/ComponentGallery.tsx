import { useEffect, useState, type ReactNode, type CSSProperties } from 'react';
import {
  Check, Search, ChevronRight, Star, Heart, Download, Plus, Bell, Loader2,
  AlertTriangle, XCircle, CheckCircle2, Info, ArrowRight, Sun, Moon,
} from 'lucide-react';
import { buildTheme, type Style, type TokenSet } from '@uichroma/core/theme';
import { textOn } from '@/lib/color-utils.ts';
import { loadGoogleFont } from '@/lib/google-fonts.ts';
import type { PaletteColors } from '@/lib/palette-utils.ts';

interface ComponentGalleryProps {
  colors: PaletteColors;
  style: Style | null;
}

export function ComponentGallery({ colors, style }: ComponentGalleryProps) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const theme = buildTheme(colors, style ?? undefined);
  const chrome: TokenSet = theme.modes[mode];
  const { radii, shadows, fonts } = theme.tokens;

  useEffect(() => {
    loadGoogleFont(fonts.heading);
    loadGoogleFont(fonts.body);
  }, [fonts.heading, fonts.body]);

  const primary = colors.primary.hex;
  const secondary = colors.secondary.hex;
  const accent = colors.accent.hex;
  const heading = `'${fonts.heading}', sans-serif`;
  const body = `'${fonts.body}', sans-serif`;
  const rx = (n: number) => `${n}px`;

  // --- primitives (closures over the current theme) ---

  const Specimen = ({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) => (
    <div className={wide ? 'col-span-2 max-md:col-span-1' : ''}>
      <div
        className="border flex items-center justify-center gap-3 flex-wrap min-h-[104px] p-5"
        style={{ background: chrome.surface, borderColor: chrome.border, borderRadius: rx(radii.lg) }}
      >
        {children}
      </div>
      <span className="text-xs font-medium mt-2 block opacity-55">{label}</span>
    </div>
  );

  const Category = ({ title, children }: { title: string; children: ReactNode }) => (
    <div className="mb-9">
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-3.5 opacity-45">{title}</h4>
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">{children}</div>
    </div>
  );

  const btn = (bg: string, extra?: CSSProperties): CSSProperties => ({
    background: bg,
    color: textOn(bg),
    borderRadius: rx(radii.md),
    boxShadow: shadows.sm,
    fontFamily: body,
    fontWeight: 600,
    fontSize: 14,
    padding: '9px 18px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    lineHeight: 1,
    ...extra,
  });
  const outlineBtn = (c: string): CSSProperties => ({
    background: 'transparent', color: c, border: `1.5px solid ${c}`, borderRadius: rx(radii.md),
    fontFamily: body, fontWeight: 600, fontSize: 14, padding: '8px 17px', display: 'inline-flex', alignItems: 'center', gap: 8, lineHeight: 1,
  });
  const ghostBtn = (c: string): CSSProperties => ({
    background: `${c}18`, color: c, borderRadius: rx(radii.md),
    fontFamily: body, fontWeight: 600, fontSize: 14, padding: '9px 18px', display: 'inline-flex', alignItems: 'center', gap: 8, lineHeight: 1,
  });
  const input = (border: string): CSSProperties => ({
    background: mode === 'light' ? '#fff' : chrome.background,
    color: chrome.text,
    border: `1.5px solid ${border}`,
    borderRadius: rx(radii.md),
    padding: '9px 12px',
    fontFamily: body,
    fontSize: 14,
    outline: 'none',
    width: '100%',
  });
  const semantic = { success: colors.success.hex, warning: colors.warning.hex, danger: colors.danger.hex, info: colors.info.hex };

  return (
    <div>
      {/* Mode toggle */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#6b7280] dark:text-[#9ca3af]">Every component, themed with your brand — browse and copy.</p>
        <div className="inline-flex rounded-lg border border-black/[0.08] dark:border-white/10 p-0.5 bg-white/60 dark:bg-white/5">
          {(['light', 'dark'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${mode === m ? 'bg-[#1B1A18] text-white dark:bg-white dark:text-[#1a1a1a]' : 'text-[#6b7280] dark:text-[#9ca3af]'}`}
            >
              {m === 'light' ? <Sun size={13} /> : <Moon size={13} />} {m}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery canvas (on the theme's mode chrome) */}
      <div
        className="rounded-3xl p-7 md:p-9 border transition-colors"
        style={{ background: chrome.background, color: chrome.text, borderColor: chrome.border, fontFamily: body }}
      >
        <Category title="Buttons">
          <Specimen label="Variants">
            <span style={btn(primary)}>Primary</span>
            <span style={btn(secondary)}>Secondary</span>
            <span style={btn(accent)}>Accent</span>
          </Specimen>
          <Specimen label="Outline · Ghost · Danger">
            <span style={outlineBtn(primary)}>Outline</span>
            <span style={ghostBtn(primary)}>Ghost</span>
            <span style={btn(semantic.danger)}>Delete</span>
          </Specimen>
          <Specimen label="Sizes">
            <span style={btn(primary, { padding: '6px 12px', fontSize: 12 })}>Small</span>
            <span style={btn(primary)}>Medium</span>
            <span style={btn(primary, { padding: '12px 24px', fontSize: 16 })}>Large</span>
          </Specimen>
          <Specimen label="With icon · Loading · Disabled">
            <span style={btn(accent)}><Download size={15} /> Export</span>
            <span style={btn(primary)}><Loader2 size={15} className="animate-spin" /> Saving</span>
            <span style={btn(primary, { opacity: 0.45, boxShadow: 'none' })}>Disabled</span>
          </Specimen>
        </Category>

        <Category title="Inputs">
          <Specimen label="Text · Focused">
            <div className="w-full flex flex-col gap-2.5">
              <input style={input(chrome.border)} placeholder="you@example.com" readOnly />
              <input style={input(primary)} value="Focused field" readOnly />
            </div>
          </Specimen>
          <Specimen label="Search · Error">
            <div className="w-full flex flex-col gap-2.5">
              <div className="relative">
                <Search size={15} style={{ color: chrome.textMuted, position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
                <input style={{ ...input(chrome.border), paddingLeft: 34 }} placeholder="Search…" readOnly />
              </div>
              <div>
                <input style={input(semantic.danger)} value="invalid-email" readOnly />
                <span className="text-xs mt-1 block" style={{ color: semantic.danger }}>Enter a valid email.</span>
              </div>
            </div>
          </Specimen>
          <Specimen label="Textarea">
            <textarea style={{ ...input(chrome.border), resize: 'none', height: 66 }} defaultValue="Write something…" readOnly />
          </Specimen>
          <Specimen label="Select">
            <div style={{ ...input(chrome.border), display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <span>Choose an option</span>
              <ChevronRight size={15} style={{ transform: 'rotate(90deg)', color: chrome.textMuted }} />
            </div>
          </Specimen>
        </Category>

        <Category title="Selection">
          <Specimen label="Checkbox · Radio">
            <div className="flex items-center gap-2.5">
              <span style={{ width: 20, height: 20, borderRadius: rx(Math.min(radii.sm, 6)), background: primary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Check size={13} color={textOn(primary)} /></span>
              <span style={{ width: 20, height: 20, borderRadius: rx(Math.min(radii.sm, 6)), border: `1.5px solid ${chrome.border}` }} />
            </div>
            <div className="flex items-center gap-2.5">
              <span style={{ width: 20, height: 20, borderRadius: 999, border: `5px solid ${primary}`, background: chrome.surface }} />
              <span style={{ width: 20, height: 20, borderRadius: 999, border: `1.5px solid ${chrome.border}` }} />
            </div>
          </Specimen>
          <Specimen label="Toggle · Segmented">
            <span style={{ width: 42, height: 24, borderRadius: 999, background: primary, position: 'relative', display: 'inline-block' }}>
              <span style={{ position: 'absolute', width: 18, height: 18, borderRadius: 999, background: '#fff', top: 3, right: 3 }} />
            </span>
            <span style={{ width: 42, height: 24, borderRadius: 999, background: chrome.surfaceMuted, position: 'relative', display: 'inline-block' }}>
              <span style={{ position: 'absolute', width: 18, height: 18, borderRadius: 999, background: '#fff', top: 3, left: 3 }} />
            </span>
            <span className="inline-flex p-0.5" style={{ background: chrome.surfaceMuted, borderRadius: rx(radii.md) }}>
              {['Day', 'Week', 'Month'].map((s, i) => (
                <span key={s} style={{ padding: '5px 12px', fontSize: 13, borderRadius: rx(Math.max(radii.md - 2, 4)), fontWeight: 600, background: i === 0 ? chrome.surface : 'transparent', color: i === 0 ? chrome.text : chrome.textMuted, boxShadow: i === 0 ? shadows.sm : undefined }}>{s}</span>
              ))}
            </span>
          </Specimen>
        </Category>

        <Category title="Feedback">
          <Specimen label="Alerts" wide>
            <div className="w-full flex flex-col gap-2.5">
              {([
                ['success', semantic.success, CheckCircle2, 'Changes saved successfully.'],
                ['warning', semantic.warning, AlertTriangle, 'Your trial ends in 3 days.'],
                ['danger', semantic.danger, XCircle, 'Something went wrong.'],
                ['info', semantic.info, Info, 'A new version is available.'],
              ] as const).map(([k, c, Icon, text]) => (
                <div key={k} className="flex items-center gap-3 px-3.5 py-2.5 text-sm" style={{ background: `${c}18`, borderLeft: `3px solid ${c}`, borderRadius: rx(radii.md), color: chrome.text }}>
                  <Icon size={17} style={{ color: c, flexShrink: 0 }} /> {text}
                </div>
              ))}
            </div>
          </Specimen>
          <Specimen label="Badges">
            {[primary, secondary, accent].map((c, i) => (
              <span key={i} style={{ background: c, color: textOn(c), fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999 }}>Solid</span>
            ))}
            {Object.values(semantic).map((c, i) => (
              <span key={i} style={{ background: `${c}22`, color: c, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999 }}>Soft</span>
            ))}
          </Specimen>
          <Specimen label="Progress · Spinner">
            <div className="flex-1 min-w-[120px]" style={{ height: 8, borderRadius: 999, background: chrome.surfaceMuted }}>
              <div style={{ width: '64%', height: '100%', borderRadius: 999, background: primary }} />
            </div>
            <Loader2 size={22} className="animate-spin" style={{ color: primary }} />
          </Specimen>
        </Category>

        <Category title="Data display">
          <Specimen label="Feature card">
            <div className="w-full" style={{ background: chrome.surface, borderRadius: rx(radii.lg), boxShadow: shadows.md, padding: 18 }}>
              <span style={{ width: 40, height: 40, borderRadius: rx(radii.md), background: `${accent}1F`, color: accent, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Star size={19} /></span>
              <div style={{ fontFamily: heading, fontWeight: 700, marginTop: 12, color: chrome.text }}>Design System</div>
              <div style={{ fontSize: 13, color: chrome.textMuted, marginTop: 4 }}>Reusable components and tokens.</div>
              <span className="inline-flex items-center gap-1 mt-3" style={{ color: primary, fontSize: 13, fontWeight: 600 }}>Learn more <ChevronRight size={13} /></span>
            </div>
          </Specimen>
          <Specimen label="Stat">
            <div className="w-full" style={{ background: chrome.surface, borderRadius: rx(radii.lg), boxShadow: shadows.md, padding: 18, borderTop: `3px solid ${primary}` }}>
              <div style={{ fontFamily: heading, fontWeight: 800, fontSize: 28, color: primary }}>$48.2k</div>
              <div style={{ fontSize: 13, color: chrome.textMuted }}>Revenue</div>
              <div className="inline-flex items-center gap-1 mt-1" style={{ color: semantic.success, fontSize: 12, fontWeight: 600 }}><ArrowRight size={12} style={{ transform: 'rotate(-45deg)' }} /> +22%</div>
            </div>
          </Specimen>
          <Specimen label="Avatars">
            <div className="flex -space-x-2.5">
              {[primary, secondary, accent, semantic.success].map((c, i) => (
                <span key={i} style={{ width: 38, height: 38, borderRadius: 999, background: c, color: textOn(c), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, border: `2px solid ${chrome.surface}` }}>{String.fromCharCode(65 + i)}{String.fromCharCode(75 + i)}</span>
              ))}
              <span style={{ width: 38, height: 38, borderRadius: 999, background: chrome.surfaceMuted, color: chrome.textMuted, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, border: `2px solid ${chrome.surface}` }}>+9</span>
            </div>
          </Specimen>
          <Specimen label="Table">
            <div className="w-full text-sm" style={{ color: chrome.text }}>
              {['Alex Rivera · Owner', 'Sam Chen · Editor', 'Jo Park · Viewer'].map((row, i) => (
                <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: i < 2 ? `1px solid ${chrome.border}` : 'none' }}>
                  <span>{row.split(' · ')[0]}</span>
                  <span style={{ background: `${primary}1A`, color: primary, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999 }}>{row.split(' · ')[1]}</span>
                </div>
              ))}
            </div>
          </Specimen>
        </Category>

        <Category title="Navigation">
          <Specimen label="Top bar" wide>
            <div className="w-full flex items-center justify-between px-4 py-2.5" style={{ background: primary, color: textOn(primary), borderRadius: rx(radii.md) }}>
              <span style={{ fontFamily: heading, fontWeight: 700 }}>Acme</span>
              <div className="flex items-center gap-4 text-sm opacity-90">
                <span>Home</span><span>Features</span><span>Pricing</span>
                <span style={{ position: 'relative' }}><Bell size={16} /></span>
              </div>
            </div>
          </Specimen>
          <Specimen label="Tabs">
            <div className="flex gap-5" style={{ borderBottom: `1px solid ${chrome.border}` }}>
              {['Overview', 'Activity', 'Settings'].map((t, i) => (
                <span key={t} style={{ paddingBottom: 8, fontSize: 14, fontWeight: 600, color: i === 0 ? primary : chrome.textMuted, borderBottom: i === 0 ? `2px solid ${primary}` : '2px solid transparent' }}>{t}</span>
              ))}
            </div>
          </Specimen>
          <Specimen label="Pagination">
            {['‹', '1', '2', '3', '›'].map((p, i) => (
              <span key={i} style={{ width: 32, height: 32, borderRadius: rx(radii.md), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, background: p === '2' ? primary : 'transparent', color: p === '2' ? textOn(primary) : chrome.textMuted, border: p === '2' ? 'none' : `1px solid ${chrome.border}` }}>{p}</span>
            ))}
          </Specimen>
        </Category>

        <Category title="Typography">
          <Specimen label="Scale" wide>
            <div className="w-full flex flex-col gap-1.5" style={{ color: chrome.text }}>
              <div style={{ fontFamily: heading, fontWeight: 800, fontSize: theme.tokens.typeScale.find((s) => s.name === '3xl')?.px, lineHeight: 1.1 }}>Heading</div>
              <div style={{ fontFamily: heading, fontWeight: 700, fontSize: theme.tokens.typeScale.find((s) => s.name === 'xl')?.px }}>Subheading</div>
              <div style={{ fontFamily: body, fontSize: 15, color: chrome.textMuted }}>Body copy in {fonts.body}, set at a comfortable reading size for the brand.</div>
              <div style={{ fontFamily: body, fontSize: 12, color: chrome.textMuted, opacity: 0.8 }}>CAPTION · METADATA</div>
            </div>
          </Specimen>
          <Specimen label="Icon buttons">
            {[Heart, Star, Plus].map((Icon, i) => (
              <span key={i} style={{ width: 40, height: 40, borderRadius: 999, background: `${[primary, secondary, accent][i]}18`, color: [primary, secondary, accent][i], display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={18} /></span>
            ))}
          </Specimen>
        </Category>
      </div>
    </div>
  );
}
