import { textOn } from '@/lib/color-utils.ts';
import { getTone, type PaletteColors } from '@/lib/palette-utils.ts';
import { useDemoSettings } from '@/hooks/use-demo-settings.tsx';
import {
  Home, Search, Heart, User, Menu, Bell, Plus, Bookmark, Share2,
  MessageCircle, MapPin, Wifi, Battery, Signal, Flame, Star,
} from 'lucide-react';

interface DemoMobileProps {
  colors: PaletteColors;
}

export function DemoMobile({ colors }: DemoMobileProps) {
  const { headingFont, bodyFont, isDark } = useDemoSettings();
  const p = colors.primary;
  const s = colors.secondary;
  const a = colors.accent;

  const contentBg = isDark ? getTone(colors, 'neutral', 1) : getTone(colors, 'neutral', 9);
  const cardBg = isDark ? getTone(colors, 'neutral', 2) : '#fff';
  const textMuted = isDark ? getTone(colors, 'neutral', 6) : '#6b7280';
  const textDefault = isDark ? getTone(colors, 'neutral', 8) : '#1a1a1a';
  const barBg = isDark ? getTone(colors, 'neutral', 0) : '#fff';
  const borderColor = isDark ? getTone(colors, 'neutral', 3) : getTone(colors, 'neutral', 8);

  const stories = [
    { name: 'You', color: a.hex, isYou: true },
    { name: 'Alex', color: p.hex, isYou: false },
    { name: 'Sara', color: s.hex, isYou: false },
    { name: 'Mike', color: colors.success.hex, isYou: false },
    { name: 'Lily', color: colors.info.hex, isYou: false },
  ];

  const filterChips = [
    { Icon: Flame, label: 'Trending', active: true },
    { Icon: Star, label: 'Popular', active: false },
    { Icon: MapPin, label: 'Near You', active: false },
  ];

  const cards = [
    {
      title: 'Morning Routine',
      sub: 'Start your day right with these tips',
      tag: 'Wellness',
      tagBg: isDark ? getTone(colors, 'success', 1) : getTone(colors, 'success', 8),
      tagColor: colors.success.hex,
      gradient: `linear-gradient(135deg, ${s.hex}, ${p.hex})`,
      likes: 128,
      comments: 24,
    },
    {
      title: 'Design Systems',
      sub: 'Building scalable component libraries',
      tag: 'Tech',
      tagBg: isDark ? getTone(colors, 'info', 1) : getTone(colors, 'info', 8),
      tagColor: colors.info.hex,
      gradient: `linear-gradient(135deg, ${p.hex}, ${a.hex})`,
      likes: 256,
      comments: 42,
    },
    {
      title: 'Travel Guide',
      sub: 'Top destinations for this season',
      tag: 'Lifestyle',
      tagBg: isDark ? getTone(colors, 'accent', 1) : getTone(colors, 'accent', 8),
      tagColor: a.hex,
      gradient: `linear-gradient(135deg, ${a.hex}, ${s.hex})`,
      likes: 89,
      comments: 15,
    },
  ];

  const tabs: { Icon: typeof Home; label: string; active: boolean }[] = [
    { Icon: Home, label: 'Home', active: true },
    { Icon: Search, label: 'Search', active: false },
    { Icon: Heart, label: 'Saved', active: false },
    { Icon: User, label: 'Profile', active: false },
  ];

  return (
    <div className="flex justify-center py-8">
      {/* Phone frame */}
      <div
        className="relative overflow-hidden shadow-2xl flex flex-col"
        style={{
          width: 320,
          height: 620,
          borderRadius: 40,
          border: '8px solid #1a1a1a',
        }}
      >
        {/* Dynamic Island */}
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 z-10 rounded-full"
          style={{ width: 80, height: 20, background: '#1a1a1a' }}
        />

        {/* Status bar */}
        <div
          className="flex items-center justify-between px-6 pt-4 pb-1 text-xs"
          style={{ background: p.hex, color: textOn(p.hex) }}
        >
          <span style={{ fontFamily: bodyFont }}>9:41</span>
          <div className="flex items-center gap-1">
            <Signal size={11} />
            <Wifi size={11} />
            <Battery size={11} />
          </div>
        </div>

        {/* App header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ background: p.hex, color: textOn(p.hex) }}
        >
          <Menu size={20} className="cursor-pointer" />
          <span className="font-bold text-base" style={{ fontFamily: headingFont }}>Discover</span>
          <div className="relative">
            <Bell size={20} className="cursor-pointer" />
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: colors.danger.hex }} />
          </div>
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto p-3 flex flex-col gap-3"
          style={{ background: contentBg }}
        >
          {/* Search bar */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
            style={{ background: cardBg, border: `1px solid ${borderColor}`, color: textMuted, fontFamily: bodyFont }}
          >
            <Search size={14} />
            Search articles...
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto py-0.5">
            {filterChips.map(chip => (
              <div
                key={chip.label}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold flex-shrink-0 cursor-pointer transition-all"
                style={{
                  background: chip.active ? p.hex : (isDark ? getTone(colors, 'neutral', 2) : '#f3f4f6'),
                  color: chip.active ? textOn(p.hex) : textMuted,
                  fontFamily: bodyFont,
                }}
              >
                <chip.Icon size={12} />
                {chip.label}
              </div>
            ))}
          </div>

          {/* Stories row */}
          <div className="flex gap-3 overflow-x-auto py-1">
            {stories.map(st => (
              <div key={st.name} className="flex flex-col items-center gap-1 flex-shrink-0 relative">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${st.color}, ${a.hex})`,
                    color: textOn(st.color),
                    padding: 2,
                  }}
                >
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center"
                    style={{ background: cardBg }}
                  >
                    <span style={{ color: st.color, fontSize: 10, fontWeight: 700 }}>{st.name[0]}</span>
                  </div>
                </div>
                {st.isYou && (
                  <div
                    className="absolute -bottom-0.5 right-0 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: p.hex, color: textOn(p.hex) }}
                  >
                    <Plus size={10} strokeWidth={3} />
                  </div>
                )}
                <span className="text-[9px]" style={{ color: textMuted, fontFamily: bodyFont }}>{st.name}</span>
              </div>
            ))}
          </div>

          {/* Cards */}
          {cards.map(card => (
            <div key={card.title} className="rounded-xl overflow-hidden" style={{ background: cardBg, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="h-28 relative" style={{ background: card.gradient }}>
                <div
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
                  style={{ background: 'rgba(0,0,0,0.25)' }}
                >
                  <Bookmark size={13} style={{ color: '#fff' }} />
                </div>
              </div>
              <div className="p-3">
                <div className="font-bold text-sm mb-1" style={{ fontFamily: headingFont, color: textDefault }}>{card.title}</div>
                <div className="text-xs mb-2" style={{ color: textMuted, fontFamily: bodyFont }}>{card.sub}</div>
                <div className="flex items-center justify-between">
                  <span
                    className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ background: card.tagBg, color: card.tagColor, fontFamily: bodyFont }}
                  >
                    {card.tag}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px]" style={{ color: textMuted }}>
                      <Heart size={12} /> {card.likes}
                    </div>
                    <div className="flex items-center gap-1 text-[10px]" style={{ color: textMuted }}>
                      <MessageCircle size={12} /> {card.comments}
                    </div>
                    <Share2 size={12} style={{ color: textMuted }} className="cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAB */}
        <div
          className="absolute flex items-center justify-center cursor-pointer"
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            bottom: 72,
            right: 16,
            background: a.hex,
            color: textOn(a.hex),
            boxShadow: `0 4px 14px ${a.hex}60`,
          }}
        >
          <Plus size={22} strokeWidth={2.5} />
        </div>

        {/* Bottom tab bar */}
        <div
          className="flex items-center justify-around py-2.5"
          style={{ background: barBg, borderTop: `1px solid ${borderColor}`, boxShadow: '0 -2px 8px rgba(0,0,0,0.04)' }}
        >
          {tabs.map(tab => (
            <div
              key={tab.label}
              className="flex flex-col items-center gap-0.5 text-center cursor-pointer relative"
              style={{ color: tab.active ? p.hex : (isDark ? getTone(colors, 'neutral', 5) : getTone(colors, 'neutral', 5)) }}
            >
              <tab.Icon size={20} strokeWidth={tab.active ? 2.5 : 1.5} />
              <div className="text-[10px]" style={{ fontFamily: bodyFont, fontWeight: tab.active ? 600 : 400 }}>{tab.label}</div>
              {tab.active && (
                <div
                  className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full"
                  style={{ background: p.hex }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
