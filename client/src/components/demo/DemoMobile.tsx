import { textOn, hslToHex } from '@/lib/color-utils.ts';
import type { PaletteColors } from '@/lib/palette-utils.ts';
import { useDemoSettings } from '@/hooks/use-demo-settings.tsx';
import {
  Bell, Signal, Wifi, Battery, Nfc, ArrowUpRight, ArrowDownLeft, Plus, MoreHorizontal,
  ShoppingBag, Coffee, Music, Home, CreditCard, BarChart2, User, Check, PiggyBank,
} from 'lucide-react';

interface DemoMobileProps {
  colors: PaletteColors;
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export function DemoMobile({ colors }: DemoMobileProps) {
  const { headingFont, bodyFont, chrome, radii } = useDemoSettings();
  const P = colors.primary, S = colors.secondary, A = colors.accent;
  const p = P.hex, s = S.hex, a = A.hex;
  const su = colors.success.hex;
  const H = { fontFamily: `'${headingFont}', sans-serif` };
  const B = { fontFamily: `'${bodyFont}', sans-serif` };
  const rx = (n: number) => `${n}px`;
  const tone = (c: { h: number; s: number }, l: number, sAdj = 0) => hslToHex(c.h, clamp(c.s + sAdj), clamp(l));

  // A genuine payment-card gradient (grounded in a deep primary — reads as a real card, not a color slab).
  const cardHi = tone(P, 34, -2);
  const cardLo = tone(P, 17, -4);

  const quick = [
    { label: 'Send', Icon: ArrowUpRight }, { label: 'Request', Icon: ArrowDownLeft },
    { label: 'Top up', Icon: Plus }, { label: 'More', Icon: MoreHorizontal },
  ];
  const txns = [
    { name: 'Spotify', cat: 'Subscription', amt: '-$9.99', Icon: Music, tint: a, income: false },
    { name: 'Whole Foods', cat: 'Groceries', amt: '-$54.20', Icon: ShoppingBag, tint: p, income: false },
    { name: 'Salary', cat: 'Acme Inc · Income', amt: '+$3,200', Icon: ArrowDownLeft, tint: su, income: true },
    { name: 'Blue Bottle', cat: 'Coffee', amt: '-$5.75', Icon: Coffee, tint: s, income: false },
  ];
  const spend = [40, 66, 48, 82, 58, 72, 46];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const tabs = [{ Icon: Home, label: 'Home', active: true }, { Icon: CreditCard, label: 'Cards', active: false }, { Icon: BarChart2, label: 'Stats', active: false }, { Icon: User, label: 'Profile', active: false }];

  return (
    <div className="relative flex justify-center items-center overflow-hidden py-12 px-4" style={{ background: chrome.background, borderRadius: rx(Math.max(radii.lg, 12)), minHeight: 680 }}>
      {/* Ambient brand glows so the device sits on a designed stage, not a void */}
      <div className="absolute -top-16 -left-10 w-[360px] h-[360px] rounded-full pointer-events-none" style={{ background: p, opacity: 0.14, filter: 'blur(90px)' }} />
      <div className="absolute -bottom-24 -right-8 w-[340px] h-[340px] rounded-full pointer-events-none" style={{ background: a, opacity: 0.13, filter: 'blur(90px)' }} />

      <div className="relative" style={{ width: 300 }}>
        {/* Floating accessory: payment received */}
        <div className="absolute -left-40 top-10 w-52 p-3 flex items-center gap-2.5 max-lg:hidden z-20" style={{ background: chrome.surface, border: `1px solid ${chrome.border}`, borderRadius: rx(radii.lg), boxShadow: '0 18px 40px -18px rgba(0,0,0,0.35)' }}>
          <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: `${su}1c`, color: su }}><Check size={17} strokeWidth={2.5} /></span>
          <div className="min-w-0">
            <div className="text-[11px]" style={{ color: chrome.textMuted, ...B }}>Payment received</div>
            <div className="text-sm font-bold" style={{ color: chrome.text, ...H }}>+$240.00</div>
          </div>
        </div>

        {/* Floating accessory: savings goal ring */}
        <div className="absolute -right-36 bottom-16 w-44 p-3.5 max-lg:hidden z-20" style={{ background: chrome.surface, border: `1px solid ${chrome.border}`, borderRadius: rx(radii.lg), boxShadow: '0 18px 40px -18px rgba(0,0,0,0.35)' }}>
          <div className="flex items-center gap-3">
            <div className="relative shrink-0" style={{ width: 46, height: 46 }}>
              <svg width="46" height="46" viewBox="0 0 46 46" className="-rotate-90">
                <circle cx="23" cy="23" r="19" fill="none" stroke={chrome.surfaceMuted} strokeWidth="5" />
                <circle cx="23" cy="23" r="19" fill="none" stroke={p} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 19 * 0.72} ${2 * Math.PI * 19}`} />
              </svg>
              <PiggyBank size={16} className="absolute inset-0 m-auto" style={{ color: p }} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px]" style={{ color: chrome.textMuted, ...B }}>Savings goal</div>
              <div className="text-sm font-bold" style={{ color: chrome.text, ...H }}>72% of $5k</div>
            </div>
          </div>
        </div>

        {/* Phone */}
        <div className="relative overflow-hidden z-10" style={{ width: 300, height: 604, borderRadius: 46, border: '8px solid #0c0c0d', background: chrome.background, boxShadow: '0 30px 70px -24px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.05)' }}>
          {/* Dynamic island */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 rounded-full" style={{ width: 84, height: 24, background: '#0c0c0d' }} />

          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-3.5 pb-1 text-[11px] font-semibold" style={{ color: chrome.text }}>
            <span style={B}>9:41</span>
            <div className="flex items-center gap-1.5"><Signal size={12} /><Wifi size={12} /><Battery size={14} /></div>
          </div>

          {/* Scrollable app */}
          <div className="overflow-y-auto" style={{ height: 'calc(100% - 96px)' }}>
            <div className="px-5 pt-2 pb-4 flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs" style={{ color: chrome.textMuted, ...B }}>Good morning</div>
                  <div className="text-lg font-bold leading-tight" style={{ color: chrome.text, ...H }}>Alex Carter</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="relative w-9 h-9 rounded-full flex items-center justify-center" style={{ background: chrome.surfaceMuted, color: chrome.text }}>
                    <Bell size={16} /><span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ background: a }} />
                  </span>
                  <span className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: p, color: textOn(p) }}>AC</span>
                </div>
              </div>

              {/* Balance card */}
              <div className="relative overflow-hidden p-5" style={{ background: `linear-gradient(135deg, ${cardHi}, ${cardLo})`, borderRadius: rx(Math.max(radii.lg, 16)), boxShadow: `0 16px 34px -16px ${cardLo}` }}>
                <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 82% 8%, ${a}66, transparent 52%)` }} />
                <div className="absolute -bottom-10 -left-6 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.10)' }} />
                <div className="relative flex items-start justify-between">
                  <div>
                    <div className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.7)', ...B }}>Total balance</div>
                    <div className="text-[27px] font-bold tracking-tight mt-0.5" style={{ color: '#fff', ...H }}>$12,480.50</div>
                  </div>
                  <Nfc size={20} style={{ color: 'rgba(255,255,255,0.85)' }} />
                </div>
                <div className="relative flex items-center justify-between mt-6">
                  <div className="flex items-center gap-2.5">
                    <span className="block rounded-[5px]" style={{ width: 30, height: 22, background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.6))' }} />
                    <span className="text-sm font-semibold tracking-widest" style={{ color: 'rgba(255,255,255,0.92)', ...B }}>•••• 4921</span>
                  </div>
                  <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.65)', ...B }}>05/28</span>
                </div>
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-4 gap-2">
                {quick.map((q) => (
                  <div key={q.label} className="flex flex-col items-center gap-1.5">
                    <span className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${p}14`, color: p }}><q.Icon size={19} /></span>
                    <span className="text-[11px] font-medium" style={{ color: chrome.textMuted, ...B }}>{q.label}</span>
                  </div>
                ))}
              </div>

              {/* Weekly spend */}
              <div className="p-4" style={{ background: chrome.surface, border: `1px solid ${chrome.border}`, borderRadius: rx(radii.lg) }}>
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-xs font-semibold" style={{ color: chrome.textMuted, ...B }}>Spent this week</span>
                  <span className="text-base font-bold" style={{ color: chrome.text, ...H }}>$486.20</span>
                </div>
                <div className="flex items-end gap-2" style={{ height: 56 }}>
                  {spend.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="w-full rounded-full" style={{ height: `${h}%`, background: i === 3 ? p : `${p}30` }} />
                      <span className="text-[9px]" style={{ color: chrome.textMuted, ...B }}>{days[i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transactions */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold" style={{ color: chrome.text, ...H }}>Recent activity</span>
                  <span className="text-xs font-semibold" style={{ color: p, ...B }}>See all</span>
                </div>
                <div className="flex flex-col">
                  {txns.map((t, i) => (
                    <div key={t.name} className="flex items-center gap-3 py-2.5" style={{ borderTop: i > 0 ? `1px solid ${chrome.border}` : 'none' }}>
                      <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: `${t.tint}18`, color: t.tint }}><t.Icon size={16} /></span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold truncate" style={{ color: chrome.text, ...B }}>{t.name}</div>
                        <div className="text-[11px]" style={{ color: chrome.textMuted, ...B }}>{t.cat}</div>
                      </div>
                      <span className="text-sm font-bold shrink-0" style={{ color: t.income ? su : chrome.text, ...B }}>{t.amt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="absolute bottom-0 inset-x-0 flex items-center justify-around pt-2.5 pb-3.5" style={{ background: chrome.surface, borderTop: `1px solid ${chrome.border}` }}>
            {tabs.map((tab) => (
              <div key={tab.label} className="flex flex-col items-center gap-1" style={{ color: tab.active ? p : chrome.textMuted }}>
                <tab.Icon size={20} strokeWidth={tab.active ? 2.5 : 1.75} />
                <span className="text-[10px]" style={{ fontWeight: tab.active ? 700 : 500, ...B }}>{tab.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
