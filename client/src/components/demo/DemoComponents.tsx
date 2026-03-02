import { textOn } from '@/lib/color-utils.ts';
import { PALETTE_KEYS, type PaletteColors, type PaletteKey, PALETTE_LABELS } from '@/lib/palette-utils.ts';

interface DemoComponentsProps {
  colors: PaletteColors;
}

function getTone(colors: PaletteColors, key: PaletteKey, index: number): string {
  const c = colors[key];
  if (c && c.tones && c.tones[index]) return c.tones[index].hex;
  return c ? c.hex : '#888';
}

export function DemoComponents({ colors }: DemoComponentsProps) {
  const p = colors.primary;
  const s = colors.secondary;
  const a = colors.accent;
  const w = colors.warning;
  const d = colors.danger;
  const su = colors.success;
  const inf = colors.info;

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
    { color: p.hex, value: '12.4k', label: 'Users' },
    { color: s.hex, value: '98.2%', label: 'Uptime' },
    { color: a.hex, value: '$3.2M', label: 'Revenue' },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Navigation */}
      <div>
        <div className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2 font-heading">Navigation</div>
        <div
          className="flex items-center justify-between px-6 py-3 rounded-lg"
          style={{ background: p.hex, color: textOn(p.hex) }}
        >
          <span className="font-bold text-lg font-heading">AppName</span>
          <div className="flex gap-4 text-sm opacity-90">
            <span>Home</span>
            <span>Features</span>
            <span>Pricing</span>
            <span>Contact</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div>
        <div className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2 font-heading">Hero Section</div>
        <div
          className="rounded-lg px-8 py-12 text-center text-white"
          style={{ background: `linear-gradient(135deg, ${p.hex}, ${s.hex})` }}
        >
          <div className="text-2xl font-bold mb-2 font-heading">Build something amazing</div>
          <div className="text-base opacity-90 mb-6 font-sans">A beautiful color palette generated just for you.</div>
          <span
            className="inline-block px-6 py-2 rounded-lg font-semibold text-sm cursor-pointer"
            style={{ background: a.hex, color: textOn(a.hex) }}
          >
            Get Started
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div>
        <div className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2 font-heading">Buttons</div>
        <div className="flex flex-wrap gap-3">
          {btnColors.map(b => (
            <span
              key={b.label}
              className="inline-block px-5 py-2 rounded-lg font-semibold text-sm cursor-pointer"
              style={{ background: b.c.hex, color: textOn(b.c.hex) }}
            >
              {b.label}
            </span>
          ))}
          <span
            className="inline-block px-5 py-2 rounded-lg font-semibold text-sm cursor-pointer bg-transparent"
            style={{ borderColor: p.hex, color: p.hex, borderWidth: 2, borderStyle: 'solid' }}
          >
            Outline
          </span>
        </div>
      </div>

      {/* Alerts */}
      <div>
        <div className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2 font-heading">Alerts</div>
        <div className="flex flex-col gap-3">
          {alertColors.map(al => (
            <div
              key={al.key}
              className="px-4 py-3 rounded-lg text-sm font-sans"
              style={{
                background: getTone(colors, al.key, 8),
                color: getTone(colors, al.key, 1),
                borderLeft: `4px solid ${al.c.hex}`,
              }}
            >
              {al.label}
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div>
        <div className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2 font-heading">Card</div>
        <div
          className="bg-white rounded-lg p-5 shadow-sm"
          style={{ borderLeft: `4px solid ${a.hex}` }}
        >
          <div className="font-bold text-lg mb-2 font-heading" style={{ color: p.hex }}>
            Feature Highlight
          </div>
          <div className="text-sm text-gray-600 font-sans">
            This card showcases how your palette colors work together in a typical UI component with accent borders and primary headings.
          </div>
        </div>
      </div>

      {/* Badges */}
      <div>
        <div className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2 font-heading">Badges</div>
        <div className="flex flex-wrap gap-2">
          {PALETTE_KEYS.map(key => {
            const c = colors[key];
            if (!c) return null;
            return (
              <span
                key={key}
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: getTone(colors, key, 8),
                  color: getTone(colors, key, 1),
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
        <div className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2 font-heading">Form</div>
        <div className="bg-white rounded-lg p-5 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700 font-sans">Email address</label>
            <input
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none transition-all font-sans"
              type="text"
              placeholder="you@example.com"
              style={
                {
                  '--demo-focus-color': p.hex,
                  '--demo-focus-ring': `${getTone(colors, 'primary', 8)}40`,
                } as React.CSSProperties
              }
              onFocus={e => {
                e.currentTarget.style.borderColor = p.hex;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${getTone(colors, 'primary', 8)}40`;
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700 font-sans">Message</label>
            <input
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none transition-all font-sans"
              type="text"
              placeholder="Write something..."
              onFocus={e => {
                e.currentTarget.style.borderColor = p.hex;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${getTone(colors, 'primary', 8)}40`;
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
          <span
            className="inline-block px-5 py-2 rounded-lg font-semibold text-sm cursor-pointer self-start"
            style={{ background: p.hex, color: textOn(p.hex) }}
          >
            Submit
          </span>
        </div>
      </div>

      {/* Stats */}
      <div>
        <div className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2 font-heading">Stats</div>
        <div className="grid grid-cols-3 gap-4">
          {stats.map(st => (
            <div
              key={st.label}
              className="bg-white rounded-lg p-5 text-center shadow-sm"
              style={{ borderTop: `3px solid ${st.color}` }}
            >
              <div className="text-2xl font-bold font-heading" style={{ color: st.color }}>
                {st.value}
              </div>
              <div className="text-sm text-gray-500 mt-1 font-sans">{st.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
