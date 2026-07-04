import { textOn } from '@/lib/color-utils.ts';
import type { PaletteColors } from '@/lib/palette-utils.ts';
import { useDemoSettings } from '@/hooks/use-demo-settings.tsx';
import {
  Home, Search, Heart, User, Menu, Bell, Plus, Bookmark, Share2,
  MessageCircle, MapPin, Wifi, Battery, Signal, Flame, Star,
} from 'lucide-react';

interface DemoMobileProps {
  colors: PaletteColors;
}

export function DemoMobile({ colors }: DemoMobileProps) {
  const { headingFont, bodyFont, chrome, radii } = useDemoSettings();
  const p = colors.primary.hex;
  const s = colors.secondary.hex;
  const a = colors.accent.hex;
  const H = { fontFamily: `'${headingFont}', sans-serif` };
  const B = { fontFamily: `'${bodyFont}', sans-serif` };
  const rx = (n: number) => `${n}px`;

  const stories = [
    { name: 'You', color: a, isYou: true },
    { name: 'Alex', color: p, isYou: false },
    { name: 'Sara', color: s, isYou: false },
    { name: 'Mike', color: colors.success.hex, isYou: false },
    { name: 'Lily', color: colors.info.hex, isYou: false },
  ];
  const chips = [{ Icon: Flame, label: 'Trending', active: true }, { Icon: Star, label: 'Popular', active: false }, { Icon: MapPin, label: 'Near you', active: false }];
  const cards = [
    { title: 'Morning routine', sub: 'Start your day right', tag: 'Wellness', tagColor: colors.success.hex, color: s, likes: 128, comments: 24 },
    { title: 'Design systems', sub: 'Scalable component libraries', tag: 'Tech', tagColor: colors.info.hex, color: p, likes: 256, comments: 42 },
    { title: 'Travel guide', sub: 'Top destinations this season', tag: 'Lifestyle', tagColor: a, color: a, likes: 89, comments: 15 },
  ];
  const tabs = [{ Icon: Home, label: 'Home', active: true }, { Icon: Search, label: 'Search', active: false }, { Icon: Heart, label: 'Saved', active: false }, { Icon: User, label: 'Profile', active: false }];

  return (
    <div className="flex justify-center py-8">
      <div className="relative overflow-hidden shadow-2xl flex flex-col" style={{ width: 320, height: 620, borderRadius: 44, border: '9px solid #111' }}>
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-10 rounded-full" style={{ width: 88, height: 22, background: '#111' }} />

        {/* Status + header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-1 text-xs" style={{ background: p, color: textOn(p) }}>
          <span style={B}>9:41</span>
          <div className="flex items-center gap-1"><Signal size={11} /><Wifi size={11} /><Battery size={11} /></div>
        </div>
        <div className="flex items-center justify-between px-4 pt-1 pb-3" style={{ background: p, color: textOn(p) }}>
          <Menu size={20} />
          <span className="font-bold text-base" style={H}>Discover</span>
          <div className="relative"><Bell size={20} /><span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: colors.danger.hex }} /></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3" style={{ background: chrome.surfaceMuted }}>
          <div className="flex items-center gap-2 px-3 py-2.5 text-xs" style={{ background: chrome.surface, border: `1px solid ${chrome.border}`, color: chrome.textMuted, borderRadius: rx(radii.md), ...B }}>
            <Search size={14} /> Search articles…
          </div>

          <div className="flex gap-2 overflow-x-auto py-0.5">
            {chips.map((chip) => (
              <div key={chip.label} className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold shrink-0" style={{ background: chip.active ? p : chrome.surface, color: chip.active ? textOn(p) : chrome.textMuted, border: chip.active ? 'none' : `1px solid ${chrome.border}`, borderRadius: 999, ...B }}>
                <chip.Icon size={12} /> {chip.label}
              </div>
            ))}
          </div>

          <div className="flex gap-3 overflow-x-auto py-1">
            {stories.map((st) => (
              <div key={st.name} className="flex flex-col items-center gap-1 shrink-0 relative">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: st.color, padding: 2.5 }}>
                  <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: chrome.surface }}>
                    <span style={{ color: st.color, fontSize: 11, fontWeight: 700 }}>{st.name[0]}</span>
                  </div>
                </div>
                {st.isYou && <div className="absolute bottom-4 right-0 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: p, color: textOn(p), border: `1.5px solid ${chrome.surfaceMuted}` }}><Plus size={9} strokeWidth={3} /></div>}
                <span className="text-[9px]" style={{ color: chrome.textMuted, ...B }}>{st.name}</span>
              </div>
            ))}
          </div>

          {cards.map((card) => (
            <div key={card.title} className="overflow-hidden" style={{ background: chrome.surface, border: `1px solid ${chrome.border}`, borderRadius: rx(radii.lg) }}>
              <div className="h-28 relative overflow-hidden" style={{ background: card.color }}>
                <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 75% 25%, rgba(255,255,255,0.28), transparent 60%)' }} />
                <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.22)' }}><Bookmark size={13} color="#fff" /></div>
              </div>
              <div className="p-3">
                <div className="font-bold text-sm mb-0.5" style={{ color: chrome.text, ...H }}>{card.title}</div>
                <div className="text-xs mb-2.5" style={{ color: chrome.textMuted, ...B }}>{card.sub}</div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${card.tagColor}20`, color: card.tagColor, borderRadius: 999, ...B }}>{card.tag}</span>
                  <div className="flex items-center gap-3" style={{ color: chrome.textMuted }}>
                    <span className="flex items-center gap-1 text-[10px]"><Heart size={12} /> {card.likes}</span>
                    <span className="flex items-center gap-1 text-[10px]"><MessageCircle size={12} /> {card.comments}</span>
                    <Share2 size={12} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAB */}
        <div className="absolute flex items-center justify-center" style={{ width: 50, height: 50, borderRadius: '50%', bottom: 74, right: 16, background: a, color: textOn(a), boxShadow: `0 6px 18px -4px ${a}` }}><Plus size={22} strokeWidth={2.5} /></div>

        {/* Tab bar */}
        <div className="flex items-center justify-around py-2.5" style={{ background: chrome.surface, borderTop: `1px solid ${chrome.border}` }}>
          {tabs.map((tab) => (
            <div key={tab.label} className="flex flex-col items-center gap-0.5 relative" style={{ color: tab.active ? p : chrome.textMuted }}>
              <tab.Icon size={20} strokeWidth={tab.active ? 2.5 : 1.75} />
              <div className="text-[10px]" style={{ fontWeight: tab.active ? 600 : 400, ...B }}>{tab.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
