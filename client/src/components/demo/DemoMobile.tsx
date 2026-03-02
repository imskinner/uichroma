import { textOn } from '@/lib/color-utils.ts';
import type { PaletteColors, PaletteKey } from '@/lib/palette-utils.ts';

interface DemoMobileProps {
  colors: PaletteColors;
}

function getTone(colors: PaletteColors, key: PaletteKey, index: number): string {
  const c = colors[key];
  if (c && c.tones && c.tones[index]) return c.tones[index].hex;
  return c ? c.hex : '#888';
}

export function DemoMobile({ colors }: DemoMobileProps) {
  const p = colors.primary;
  const s = colors.secondary;
  const a = colors.accent;

  const cards = [
    {
      title: 'Morning Routine',
      sub: 'Start your day right with these tips',
      tag: 'Wellness',
      tagBg: getTone(colors, 'success', 8),
      tagColor: colors.success.hex,
    },
    {
      title: 'Design Systems',
      sub: 'Building scalable component libraries',
      tag: 'Tech',
      tagBg: getTone(colors, 'info', 8),
      tagColor: colors.info.hex,
    },
    {
      title: 'Travel Guide',
      sub: 'Top destinations for this season',
      tag: 'Lifestyle',
      tagBg: getTone(colors, 'accent', 8),
      tagColor: a.hex,
    },
  ];

  const tabs = [
    { icon: '\uD83C\uDFE0', label: 'Home', active: true },
    { icon: '\uD83D\uDD0D', label: 'Search', active: false },
    { icon: '\u2764', label: 'Saved', active: false },
    { icon: '\uD83D\uDC64', label: 'Profile', active: false },
  ];

  return (
    <div className="flex justify-center py-8">
      {/* Phone frame */}
      <div
        className="relative overflow-hidden shadow-xl flex flex-col"
        style={{
          width: 320,
          height: 580,
          borderRadius: 32,
          border: '8px solid #1a1a1a',
        }}
      >
        {/* Status bar */}
        <div
          className="flex items-center justify-between px-6 py-1 text-xs"
          style={{ background: p.hex, color: textOn(p.hex) }}
        >
          <span>9:41</span>
          <span>{'\u2022\u2022\u2022\u2022'} {'\uD83D\uDD0B'}</span>
        </div>

        {/* App header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ background: p.hex, color: textOn(p.hex) }}
        >
          <span className="text-lg">{'\u2630'}</span>
          <span className="font-bold text-base font-heading">Discover</span>
          <span className="text-lg">{'\uD83D\uDD14'}</span>
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto p-3 flex flex-col gap-3"
          style={{ background: getTone(colors, 'neutral', 9) }}
        >
          {cards.map(card => (
            <div key={card.title} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div
                className="h-24"
                style={{ background: `linear-gradient(135deg, ${s.hex}, ${p.hex})` }}
              />
              <div className="p-3">
                <div className="font-bold text-sm mb-1 font-heading">{card.title}</div>
                <div className="text-xs text-gray-500 mb-2 font-sans">{card.sub}</div>
                <span
                  className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: card.tagBg, color: card.tagColor }}
                >
                  {card.tag}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* FAB */}
        <div
          className="absolute flex items-center justify-center text-2xl font-bold cursor-pointer shadow-lg"
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            bottom: 72,
            right: 16,
            background: a.hex,
            color: textOn(a.hex),
          }}
        >
          +
        </div>

        {/* Bottom tab bar */}
        <div
          className="flex items-center justify-around py-2 bg-white"
          style={{ borderTop: `1px solid ${getTone(colors, 'neutral', 8)}` }}
        >
          {tabs.map(tab => (
            <div
              key={tab.label}
              className="flex flex-col items-center gap-0.5 text-center cursor-pointer"
              style={{ color: tab.active ? p.hex : getTone(colors, 'neutral', 5) }}
            >
              <div className="text-lg">{tab.icon}</div>
              <div className="text-[10px] font-sans">{tab.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
