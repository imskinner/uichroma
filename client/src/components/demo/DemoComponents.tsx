import { textOn } from '@/lib/color-utils.ts';
import { PALETTE_KEYS, type PaletteColors, type PaletteKey, PALETTE_LABELS, getTone } from '@/lib/palette-utils.ts';
import { useDemoSettings } from '@/hooks/use-demo-settings.tsx';

interface DemoComponentsProps {
  colors: PaletteColors;
}

export function DemoComponents({ colors }: DemoComponentsProps) {
  const { headingFont, bodyFont, isDark } = useDemoSettings();
  const p = colors.primary;
  const s = colors.secondary;
  const a = colors.accent;
  const w = colors.warning;
  const d = colors.danger;
  const su = colors.success;
  const inf = colors.info;

  const cardBg = isDark ? getTone(colors, 'neutral', 2) : '#fff';
  const textMuted = isDark ? getTone(colors, 'neutral', 7) : '#6b7280';
  const textDefault = isDark ? getTone(colors, 'neutral', 8) : '#374151';
  const labelColor = isDark ? getTone(colors, 'neutral', 6) : '#9ca3af';
  const borderColor = isDark ? getTone(colors, 'neutral', 3) : '#d1d5db';
  const inputBg = isDark ? getTone(colors, 'neutral', 1) : '#fff';

  const btnColors: { label: string; c: { hex: string } }[] = [
    { label: 'Primary', c: p },
    { label: 'Secondary', c: s },
    { label: 'Accent', c: a },
    { label: 'Danger', c: d },
  ];

  const alertColors: { key: PaletteKey; label: string; c: { hex: string } }[] = [
    { key: 'success', label: 'Success! Operation completed.', c: su },
    { key: 'warning', label: 'Warning: Please review your input.', c: w },
    { key: 'danger', label: 'Error: Something went wrong.', c: d },
    { key: 'info', label: 'Info: New updates are available.', c: inf },
  ];

  const stats = [
    { color: p.hex, value: '12.4k', label: 'Users', change: '+14%' },
    { color: s.hex, value: '98.2%', label: 'Uptime', change: '+0.3%' },
    { color: a.hex, value: '$3.2M', label: 'Revenue', change: '+22%' },
  ];

  return (
    <div className="flex flex-col gap-10">
      {/* Navigation */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: labelColor, fontFamily: headingFont }}>Navigation</div>
        <div
          className="flex items-center justify-between px-6 py-3 rounded-xl"
          style={{ background: p.hex, color: textOn(p.hex), boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          <span className="font-bold text-lg" style={{ fontFamily: headingFont }}>AppName</span>
          <div className="flex gap-5 text-sm opacity-90" style={{ fontFamily: bodyFont }}>
            <span className="cursor-pointer hover:opacity-100 transition-opacity">Home</span>
            <span className="cursor-pointer hover:opacity-100 transition-opacity">Features</span>
            <span className="cursor-pointer hover:opacity-100 transition-opacity">Pricing</span>
            <span className="cursor-pointer hover:opacity-100 transition-opacity">Contact</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: labelColor, fontFamily: headingFont }}>Hero Section</div>
        <div
          className="rounded-xl px-8 py-14 text-center text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${p.hex}, ${s.hex})` }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{ background: 'radial-gradient(circle at 30% 50%, white 0%, transparent 60%)' }}
          />
          <div className="relative">
            <div className="text-3xl font-bold mb-3" style={{ fontFamily: headingFont }}>Build something amazing</div>
            <div className="text-base opacity-90 mb-8 max-w-md mx-auto" style={{ fontFamily: bodyFont }}>A beautiful color palette generated just for you.</div>
            <span
              className="inline-block px-7 py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:brightness-110"
              style={{ background: a.hex, color: textOn(a.hex), boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            >
              Get Started
            </span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: labelColor, fontFamily: headingFont }}>Buttons</div>
        <div className="flex flex-wrap gap-3">
          {btnColors.map(b => (
            <span
              key={b.label}
              className="inline-block px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:brightness-110"
              style={{ background: b.c.hex, color: textOn(b.c.hex), boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontFamily: bodyFont }}
            >
              {b.label}
            </span>
          ))}
          <span
            className="inline-block px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer bg-transparent transition-all hover:brightness-110"
            style={{ borderColor: p.hex, color: p.hex, borderWidth: 2, borderStyle: 'solid', fontFamily: bodyFont }}
          >
            Outline
          </span>
          <span
            className="inline-block px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:opacity-80"
            style={{ background: 'transparent', color: p.hex, fontFamily: bodyFont }}
          >
            Ghost
          </span>
        </div>
      </div>

      {/* Alerts */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: labelColor, fontFamily: headingFont }}>Alerts</div>
        <div className="flex flex-col gap-3">
          {alertColors.map(al => (
            <div
              key={al.key}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
              style={{
                background: isDark ? getTone(colors, al.key, 1) : getTone(colors, al.key, 8),
                color: isDark ? getTone(colors, al.key, 8) : getTone(colors, al.key, 1),
                borderLeft: `4px solid ${al.c.hex}`,
                fontFamily: bodyFont,
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex-shrink-0"
                style={{ background: al.c.hex, opacity: 0.6 }}
              />
              {al.label}
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: labelColor, fontFamily: headingFont }}>Card</div>
        <div
          className="rounded-xl p-6 transition-shadow hover:shadow-md"
          style={{ background: cardBg, borderLeft: `4px solid ${a.hex}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div className="font-bold text-lg mb-2" style={{ color: p.hex, fontFamily: headingFont }}>
            Feature Highlight
          </div>
          <div className="text-sm leading-relaxed" style={{ color: textMuted, fontFamily: bodyFont }}>
            This card showcases how your palette colors work together in a typical UI component with accent borders and primary headings.
          </div>
        </div>
      </div>

      {/* Badges */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: labelColor, fontFamily: headingFont }}>Badges</div>
        <div className="flex flex-wrap gap-2">
          {PALETTE_KEYS.map(key => {
            const c = colors[key];
            if (!c) return null;
            return (
              <span
                key={key}
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: isDark ? getTone(colors, key, 1) : getTone(colors, key, 8),
                  color: isDark ? getTone(colors, key, 8) : getTone(colors, key, 1),
                  fontFamily: bodyFont,
                }}
              >
                {PALETTE_LABELS[key]}
              </span>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: labelColor, fontFamily: headingFont }}>Form</div>
        <div
          className="rounded-xl p-6 flex flex-col gap-4"
          style={{ background: cardBg, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold" style={{ color: textDefault, fontFamily: bodyFont }}>Email address</label>
            <input
              className="rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
              type="text"
              placeholder="you@example.com"
              style={{
                fontFamily: bodyFont,
                background: inputBg,
                color: textDefault,
                border: `1px solid ${borderColor}`,
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = p.hex;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${getTone(colors, 'primary', 8)}40`;
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = borderColor;
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold" style={{ color: textDefault, fontFamily: bodyFont }}>Message</label>
            <textarea
              className="rounded-xl px-3 py-2.5 text-sm outline-none transition-all resize-none"
              rows={3}
              placeholder="Write something..."
              style={{
                fontFamily: bodyFont,
                background: inputBg,
                color: textDefault,
                border: `1px solid ${borderColor}`,
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = p.hex;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${getTone(colors, 'primary', 8)}40`;
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = borderColor;
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
          <span
            className="inline-block px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer self-start transition-all hover:brightness-110"
            style={{ background: p.hex, color: textOn(p.hex), fontFamily: bodyFont, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          >
            Submit
          </span>
        </div>
      </div>

      {/* Stats */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: labelColor, fontFamily: headingFont }}>Stats</div>
        <div className="grid grid-cols-3 gap-4">
          {stats.map(st => (
            <div
              key={st.label}
              className="rounded-xl p-5 text-center transition-transform hover:scale-[1.02]"
              style={{ background: cardBg, borderTop: `3px solid ${st.color}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <div className="text-2xl font-bold" style={{ color: st.color, fontFamily: headingFont }}>
                {st.value}
              </div>
              <div className="text-sm mt-1" style={{ color: textMuted, fontFamily: bodyFont }}>{st.label}</div>
              <div className="text-xs mt-1 font-semibold" style={{ color: su.hex, fontFamily: bodyFont }}>{st.change}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
