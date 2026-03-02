import { textOn } from '@/lib/color-utils.ts';
import { PALETTE_KEYS, type PaletteColors, type PaletteKey, PALETTE_LABELS, getTone } from '@/lib/palette-utils.ts';
import { useDemoSettings } from '@/hooks/use-demo-settings.tsx';
import {
  CheckCircle2, AlertTriangle, XCircle, Info, TrendingUp, ArrowRight, Loader2, Send,
  Plus, Download, Heart, Star, Mail, MessageSquare, Eye, Users, ChevronRight, Search,
  Bell, Layers, Zap, Settings,
} from 'lucide-react';

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

  const alertItems: { key: PaletteKey; label: string; c: { hex: string }; Icon: typeof CheckCircle2 }[] = [
    { key: 'success', label: 'Success! Operation completed.', c: su, Icon: CheckCircle2 },
    { key: 'warning', label: 'Warning: Please review your input.', c: w, Icon: AlertTriangle },
    { key: 'danger', label: 'Error: Something went wrong.', c: d, Icon: XCircle },
    { key: 'info', label: 'Info: New updates are available.', c: inf, Icon: Info },
  ];

  const stats = [
    { color: p.hex, value: '12.4k', label: 'Users', change: '+14%', Icon: Users },
    { color: s.hex, value: '98.2%', label: 'Uptime', change: '+0.3%', Icon: Zap },
    { color: a.hex, value: '$3.2M', label: 'Revenue', change: '+22%', Icon: TrendingUp },
  ];

  const avatarColors = [p.hex, s.hex, a.hex, su.hex, inf.hex];
  const avatarInitials = ['AB', 'CD', 'EF', 'GH', 'IJ'];

  return (
    <div className="flex flex-col gap-10">
      {/* Navigation */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: labelColor, fontFamily: headingFont }}>Navigation</div>
        <div
          className="flex items-center justify-between px-6 py-3 rounded-xl"
          style={{ background: p.hex, color: textOn(p.hex), boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          <div className="flex items-center gap-2">
            <Layers size={20} />
            <span className="font-bold text-lg" style={{ fontFamily: headingFont }}>AppName</span>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex gap-5 text-sm opacity-90" style={{ fontFamily: bodyFont }}>
              <span className="cursor-pointer hover:opacity-100 transition-opacity">Home</span>
              <span className="cursor-pointer hover:opacity-100 transition-opacity">Features</span>
              <span className="cursor-pointer hover:opacity-100 transition-opacity">Pricing</span>
              <span className="cursor-pointer hover:opacity-100 transition-opacity">Contact</span>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:bg-white/15" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <Search size={16} />
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:bg-white/15 relative" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <Bell size={16} />
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: d.hex }} />
              </div>
            </div>
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
          {/* Decorative shapes */}
          <div className="absolute top-6 left-8 w-16 h-16 rounded-full opacity-10" style={{ background: '#fff' }} />
          <div className="absolute bottom-8 right-12 w-10 h-10 rounded-lg rotate-45 opacity-10" style={{ background: '#fff' }} />
          <div className="absolute top-16 right-24 w-6 h-6 rounded-full opacity-15" style={{ background: '#fff' }} />
          <div className="relative">
            <div className="text-3xl font-bold mb-3" style={{ fontFamily: headingFont }}>Build something amazing</div>
            <div className="text-base opacity-90 mb-8 max-w-md mx-auto" style={{ fontFamily: bodyFont }}>A beautiful color palette generated just for you.</div>
            <span
              className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:brightness-110"
              style={{ background: a.hex, color: textOn(a.hex), boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            >
              Get Started <ArrowRight size={16} />
            </span>
            {/* Social proof */}
            <div className="flex items-center justify-center gap-2 mt-6 opacity-80">
              <div className="flex -space-x-2">
                {[p.hex, s.hex, a.hex, su.hex].map((c, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-white/30 flex items-center justify-center text-[8px] font-bold"
                    style={{ background: c, color: textOn(c) }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span className="text-xs" style={{ fontFamily: bodyFont }}>1,200+ users already joined</span>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: labelColor, fontFamily: headingFont }}>Buttons</div>
        <div className="flex flex-col gap-3">
          {/* Standard buttons */}
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
          {/* Icon + text combos */}
          <div className="flex flex-wrap gap-3">
            <span
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:brightness-110"
              style={{ background: p.hex, color: textOn(p.hex), boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontFamily: bodyFont }}
            >
              <Download size={15} /> Download
            </span>
            <span
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:brightness-110"
              style={{ background: su.hex, color: textOn(su.hex), boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontFamily: bodyFont }}
            >
              <Plus size={15} /> Create
            </span>
            <span
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer opacity-60"
              style={{ background: isDark ? getTone(colors, 'neutral', 3) : '#e5e7eb', color: textMuted, fontFamily: bodyFont }}
            >
              <Loader2 size={15} className="animate-spin" /> Loading...
            </span>
          </div>
          {/* Icon-only row */}
          <div className="flex gap-3">
            {[
              { Icon: Heart, color: d.hex },
              { Icon: Star, color: w.hex },
              { Icon: Send, color: p.hex },
              { Icon: Settings, color: s.hex },
            ].map(({ Icon, color }, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                style={{ background: `${color}15`, color }}
              >
                <Icon size={18} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: labelColor, fontFamily: headingFont }}>Alerts</div>
        <div className="flex flex-col gap-3">
          {alertItems.map(al => (
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
              <al.Icon size={18} style={{ color: al.c.hex, flexShrink: 0 }} />
              {al.label}
            </div>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: labelColor, fontFamily: headingFont }}>Cards</div>
        <div className="grid grid-cols-3 gap-4">
          {/* Simple card with icon */}
          <div
            className="rounded-xl p-6 transition-all hover:-translate-y-1"
            style={{ background: cardBg, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: `${p.hex}15`, color: p.hex }}
            >
              <Zap size={22} />
            </div>
            <div className="font-bold text-base mb-2" style={{ color: isDark ? '#e5e5e5' : '#1a1a1a', fontFamily: headingFont }}>
              Quick Setup
            </div>
            <div className="text-sm leading-relaxed mb-3" style={{ color: textMuted, fontFamily: bodyFont }}>
              Get started in minutes with our intuitive configuration wizard.
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold cursor-pointer" style={{ color: p.hex, fontFamily: bodyFont }}>
              Learn more <ChevronRight size={14} />
            </span>
          </div>

          {/* Image placeholder card */}
          <div
            className="rounded-xl overflow-hidden transition-all hover:-translate-y-1"
            style={{ background: cardBg, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div className="h-28" style={{ background: `linear-gradient(135deg, ${s.hex}, ${a.hex})` }} />
            <div className="p-5">
              <div className="font-bold text-base mb-2" style={{ color: isDark ? '#e5e5e5' : '#1a1a1a', fontFamily: headingFont }}>
                Design System
              </div>
              <div className="text-sm leading-relaxed" style={{ color: textMuted, fontFamily: bodyFont }}>
                A comprehensive library of reusable components and tokens.
              </div>
            </div>
          </div>

          {/* Horizontal layout card */}
          <div
            className="rounded-xl p-5 flex items-start gap-4 transition-all hover:-translate-y-1"
            style={{ background: cardBg, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${a.hex}15`, color: a.hex }}
            >
              <Star size={22} />
            </div>
            <div>
              <div className="font-bold text-base mb-1" style={{ color: isDark ? '#e5e5e5' : '#1a1a1a', fontFamily: headingFont }}>
                Feature Highlight
              </div>
              <div className="text-sm leading-relaxed" style={{ color: textMuted, fontFamily: bodyFont }}>
                Showcases accent borders and primary headings working together.
              </div>
            </div>
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
          style={{ background: cardBg, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold" style={{ color: textDefault, fontFamily: bodyFont }}>Email address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: textMuted }} />
              <input
                className="rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none transition-all w-full"
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
            <span className="text-xs" style={{ color: textMuted, fontFamily: bodyFont }}>We'll never share your email.</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold" style={{ color: textDefault, fontFamily: bodyFont }}>Password</label>
            <div className="relative">
              <input
                className="rounded-xl px-3 py-2.5 text-sm outline-none transition-all w-full pr-9"
                type="password"
                placeholder="Enter password"
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
              <Eye size={16} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: textMuted }} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold" style={{ color: textDefault, fontFamily: bodyFont }}>Message</label>
            <div className="relative">
              <MessageSquare size={16} className="absolute left-3 top-3" style={{ color: textMuted }} />
              <textarea
                className="rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none transition-all resize-none w-full"
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
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded border flex items-center justify-center"
              style={{ borderColor: p.hex, background: p.hex }}
            >
              <CheckCircle2 size={10} style={{ color: textOn(p.hex) }} />
            </div>
            <span className="text-sm" style={{ color: textMuted, fontFamily: bodyFont }}>Remember me</span>
          </div>
          <span
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer self-start transition-all hover:brightness-110"
            style={{ background: p.hex, color: textOn(p.hex), fontFamily: bodyFont, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          >
            <Send size={15} /> Submit
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
              className="rounded-xl p-5 transition-all hover:-translate-y-1 relative overflow-hidden"
              style={{ background: cardBg, borderTop: `3px solid ${st.color}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              <div className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${st.color}12` }}>
                <st.Icon size={18} style={{ color: st.color }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: st.color, fontFamily: headingFont }}>
                {st.value}
              </div>
              <div className="text-sm mt-1" style={{ color: textMuted, fontFamily: bodyFont }}>{st.label}</div>
              <div className="flex items-center gap-1 mt-1.5">
                <TrendingUp size={12} style={{ color: su.hex }} />
                <span className="text-xs font-semibold" style={{ color: su.hex, fontFamily: bodyFont }}>{st.change}</span>
              </div>
              {/* Mini bar chart */}
              <div className="flex items-end gap-1 mt-3 h-6">
                {[40, 65, 45, 80, 55].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm"
                    style={{ height: `${h}%`, background: `${st.color}${i === 3 ? '60' : '25'}` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Avatar Group */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: labelColor, fontFamily: headingFont }}>Avatar Group</div>
        <div className="flex items-center">
          <div className="flex -space-x-3">
            {avatarInitials.map((initials, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ring-2"
                style={{
                  background: avatarColors[i],
                  color: textOn(avatarColors[i]),
                  outline: `2px solid ${cardBg}`,
                }}
              >
                {initials}
              </div>
            ))}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{
                background: isDark ? getTone(colors, 'neutral', 3) : '#e5e7eb',
                color: textMuted,
                outline: `2px solid ${cardBg}`,
                fontFamily: bodyFont,
              }}
            >
              +12
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
