import { textOn } from '@/lib/color-utils.ts';
import type { PaletteColors } from '@/lib/palette-utils.ts';
import { useDemoSettings } from '@/hooks/use-demo-settings.tsx';
import {
  Zap, Palette, Shield, ArrowRight, Play, Star, Check, Twitter, Github, Linkedin,
  ChevronRight, Sparkles, TrendingUp, BarChart3, Search, Bell, Settings, LayoutGrid,
} from 'lucide-react';

interface DemoLandingProps {
  colors: PaletteColors;
}

export function DemoLanding({ colors }: DemoLandingProps) {
  const { headingFont, bodyFont, chrome, radii } = useDemoSettings();
  const p = colors.primary.hex;
  const s = colors.secondary.hex;
  const a = colors.accent.hex;
  const H = { fontFamily: `'${headingFont}', sans-serif` };
  const B = { fontFamily: `'${bodyFont}', sans-serif` };
  const rx = (n: number) => `${n}px`;
  const card = { background: chrome.surface, border: `1px solid ${chrome.border}` };
  const shadow = '0 1px 2px rgba(0,0,0,0.04), 0 12px 32px -12px rgba(0,0,0,0.16)';

  const features = [
    { Icon: Zap, title: 'Lightning fast', desc: 'Sub-100ms interactions that keep people in flow.', color: p },
    { Icon: Palette, title: 'Considered design', desc: 'Every surface tuned — nothing off-the-shelf.', color: s },
    { Icon: Shield, title: 'Secure by default', desc: 'Encryption, SSO and audit logs from day one.', color: a },
  ];
  const tiers = [
    { name: 'Starter', price: '$0', period: '/mo', desc: 'For side projects', feats: ['3 projects', '1 seat', 'Community support'], color: s, popular: false },
    { name: 'Pro', price: '$29', period: '/mo', desc: 'For growing teams', feats: ['Unlimited projects', '10 seats', 'Advanced analytics', 'Priority support'], color: p, popular: true },
    { name: 'Scale', price: '$99', period: '/mo', desc: 'For organizations', feats: ['Everything in Pro', 'SSO & SAML', 'Dedicated support', '99.99% SLA'], color: a, popular: false },
  ];

  return (
    <div style={{ background: chrome.background, color: chrome.text, ...B }}>
      {/* Navbar */}
      <header
        className="flex items-center justify-between px-8 py-4 sticky top-0 z-20 backdrop-blur"
        style={{ background: `${chrome.surface}cc`, borderBottom: `1px solid ${chrome.border}` }}
      >
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 flex items-center justify-center" style={{ background: p, color: textOn(p), borderRadius: rx(radii.md) }}>
            <Sparkles size={17} />
          </span>
          <span className="font-bold text-[17px]" style={H}>Northwind</span>
        </div>
        <nav className="flex items-center gap-7 text-sm max-md:hidden" style={{ color: chrome.textMuted }}>
          <span>Product</span><span>Customers</span><span>Pricing</span><span>Docs</span>
        </nav>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium px-3 py-2 max-md:hidden" style={{ color: chrome.text }}>Sign in</span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2" style={{ background: p, color: textOn(p), borderRadius: rx(radii.md) }}>
            Get started <ArrowRight size={15} />
          </span>
        </div>
      </header>

      {/* Hero — asymmetric, with a product preview */}
      <section className="relative overflow-hidden px-8 pt-16 pb-20">
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full pointer-events-none" style={{ background: p, opacity: 0.13, filter: 'blur(90px)' }} />
        <div className="absolute -bottom-32 -right-16 w-[380px] h-[380px] rounded-full pointer-events-none" style={{ background: a, opacity: 0.12, filter: 'blur(90px)' }} />
        <div className="relative grid grid-cols-2 gap-12 items-center max-md:grid-cols-1 max-md:gap-8">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 mb-5" style={{ background: `${a}1c`, color: a, borderRadius: 999 }}>
              <Sparkles size={12} /> New — v2 is here
            </span>
            <h1 className="font-bold text-[46px] leading-[1.05] tracking-[-0.02em] max-md:text-[34px]" style={{ ...H, color: chrome.text }}>
              The workspace your <span style={{ color: p }}>whole team</span> will love.
            </h1>
            <p className="text-[17px] leading-relaxed mt-5 max-w-md" style={{ color: chrome.textMuted }}>
              Plan, build and ship in one place — with a system tuned to your brand from the very first pixel.
            </p>
            <div className="flex items-center gap-3 mt-8">
              <span className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-sm" style={{ background: p, color: textOn(p), borderRadius: rx(radii.md), boxShadow: `0 8px 20px -8px ${p}` }}>
                Start free <ArrowRight size={16} />
              </span>
              <span className="inline-flex items-center gap-2 px-5 py-3 font-semibold text-sm" style={{ color: chrome.text, border: `1.5px solid ${chrome.border}`, borderRadius: rx(radii.md) }}>
                <Play size={15} /> Watch demo
              </span>
            </div>
            <div className="flex items-center gap-3 mt-8">
              <div className="flex -space-x-2.5">
                {[p, s, a, colors.success.hex].map((c, i) => (
                  <span key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: c, color: textOn(c), border: `2px solid ${chrome.background}` }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5" style={{ color: colors.warning.hex }}>
                  {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={12} fill="currentColor" />)}
                </div>
                <span className="text-xs" style={{ color: chrome.textMuted }}>Loved by 10,000+ teams</span>
              </div>
            </div>
          </div>

          {/* Product preview: browser window with a themed mini-app */}
          <div className="rounded-2xl overflow-hidden" style={{ ...card, borderRadius: rx(Math.max(radii.lg, 12)), boxShadow: shadow }}>
            <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: chrome.surfaceMuted, borderBottom: `1px solid ${chrome.border}` }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: colors.danger.hex, opacity: 0.7 }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: colors.warning.hex, opacity: 0.7 }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: colors.success.hex, opacity: 0.7 }} />
              <span className="ml-2 text-[11px] px-2.5 py-0.5 rounded-md" style={{ background: chrome.surface, color: chrome.textMuted }}>app.northwind.com</span>
            </div>
            <div className="flex" style={{ height: 260 }}>
              <div className="w-12 flex flex-col items-center gap-4 py-4" style={{ background: chrome.surfaceMuted, borderRight: `1px solid ${chrome.border}` }}>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: p, color: textOn(p) }}><LayoutGrid size={15} /></span>
                {[BarChart3, Bell, Settings].map((Icon, i) => <Icon key={i} size={16} style={{ color: chrome.textMuted }} />)}
              </div>
              <div className="flex-1 p-4 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold" style={H}>Overview</span>
                  <span className="text-[11px] px-2 py-1 rounded-md flex items-center gap-1" style={{ background: chrome.surfaceMuted, color: chrome.textMuted }}><Search size={11} /> Search</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 mb-3">
                  {[{ v: '$48.2k', l: 'Revenue', c: p }, { v: '2,340', l: 'Users', c: a }].map((st) => (
                    <div key={st.l} className="p-2.5 rounded-lg" style={{ background: chrome.surfaceMuted }}>
                      <div className="text-lg font-bold" style={{ ...H, color: st.c }}>{st.v}</div>
                      <div className="text-[10px] flex items-center gap-1" style={{ color: chrome.textMuted }}><TrendingUp size={9} style={{ color: colors.success.hex }} /> {st.l}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-end gap-1.5 h-20 px-1">
                  {[42, 66, 38, 80, 55, 72, 48].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: i === 3 ? p : `${p}44` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo strip */}
      <div className="px-8 py-7" style={{ borderTop: `1px solid ${chrome.border}`, borderBottom: `1px solid ${chrome.border}` }}>
        <div className="text-[11px] uppercase tracking-[0.16em] text-center mb-4 font-semibold" style={{ color: chrome.textMuted }}>Trusted by teams at</div>
        <div className="flex items-center justify-center gap-10 flex-wrap opacity-50" style={{ color: chrome.text }}>
          {['Acme', 'Globex', 'Initech', 'Umbrella', 'Stark'].map((n) => (
            <span key={n} className="font-bold text-lg" style={H}>{n}</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="px-8 py-16">
        <div className="max-w-md mb-10">
          <h2 className="font-bold text-[32px] tracking-[-0.02em]" style={{ ...H, color: chrome.text }}>Everything you need, nothing you don't.</h2>
        </div>
        <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
          {features.map((f) => (
            <div key={f.title} className="p-6 transition-transform hover:-translate-y-1" style={{ ...card, borderRadius: rx(radii.lg) }}>
              <span className="w-12 h-12 flex items-center justify-center mb-4" style={{ background: `${f.color}18`, color: f.color, borderRadius: rx(radii.md) }}>
                <f.Icon size={22} />
              </span>
              <div className="font-bold text-[17px] mb-1.5" style={{ ...H, color: chrome.text }}>{f.title}</div>
              <div className="text-sm leading-relaxed mb-3" style={{ color: chrome.textMuted }}>{f.desc}</div>
              <span className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: f.color }}>Learn more <ChevronRight size={14} /></span>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-8 pb-16 grid grid-cols-2 gap-5 max-md:grid-cols-1">
        {[
          { initials: 'SC', name: 'Sarah Chen', role: 'Design Lead, TechCo', quote: 'It transformed how our team ships. The system is so consistent that handoff basically disappeared.', color: a },
          { initials: 'JM', name: 'James Miller', role: 'CTO, StartupXYZ', quote: 'The best investment we made this year — product velocity and polish both went up.', color: s },
        ].map((t) => (
          <div key={t.initials} className="p-6" style={{ ...card, borderRadius: rx(radii.lg) }}>
            <div className="flex gap-0.5 mb-3" style={{ color: colors.warning.hex }}>{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={14} fill="currentColor" />)}</div>
            <p className="text-[15px] leading-relaxed mb-5" style={{ color: chrome.text }}>“{t.quote}”</p>
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: t.color, color: textOn(t.color) }}>{t.initials}</span>
              <div>
                <div className="text-sm font-semibold" style={{ color: chrome.text }}>{t.name}</div>
                <div className="text-xs" style={{ color: chrome.textMuted }}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Pricing */}
      <section className="px-8 py-16" style={{ background: chrome.surfaceMuted }}>
        <div className="text-center mb-10">
          <h2 className="font-bold text-[32px] tracking-[-0.02em]" style={{ ...H, color: chrome.text }}>Simple, honest pricing</h2>
          <p className="text-sm mt-2" style={{ color: chrome.textMuted }}>Start free. Upgrade when you're ready.</p>
        </div>
        <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
          {tiers.map((tier) => (
            <div key={tier.name} className="p-6 flex flex-col relative" style={{ background: chrome.surface, borderRadius: rx(radii.lg), border: tier.popular ? `2px solid ${tier.color}` : `1px solid ${chrome.border}`, boxShadow: tier.popular ? `0 16px 40px -16px ${tier.color}` : 'none' }}>
              {tier.popular && <span className="absolute -top-3 left-6 px-3 py-0.5 text-[10px] font-bold rounded-full" style={{ background: tier.color, color: textOn(tier.color) }}>MOST POPULAR</span>}
              <div className="text-sm font-semibold mb-1" style={{ color: tier.color, ...H }}>{tier.name}</div>
              <div className="flex items-baseline gap-1">
                <span className="text-[34px] font-bold" style={{ ...H, color: chrome.text }}>{tier.price}</span>
                <span className="text-sm" style={{ color: chrome.textMuted }}>{tier.period}</span>
              </div>
              <div className="text-xs mb-5" style={{ color: chrome.textMuted }}>{tier.desc}</div>
              <div className="flex flex-col gap-2.5 mb-6 flex-1">
                {tier.feats.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm" style={{ color: chrome.text }}><Check size={15} style={{ color: tier.color }} /> {f}</div>
                ))}
              </div>
              <span className="inline-flex items-center justify-center gap-2 w-full py-2.5 font-semibold text-sm" style={{ background: tier.popular ? tier.color : 'transparent', color: tier.popular ? textOn(tier.color) : tier.color, border: tier.popular ? 'none' : `1.5px solid ${tier.color}`, borderRadius: rx(radii.md) }}>
                Choose {tier.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="px-8 py-16 text-center relative overflow-hidden" style={{ background: p, color: textOn(p) }}>
        <div className="absolute -top-16 right-10 w-64 h-64 rounded-full" style={{ background: '#fff', opacity: 0.08, filter: 'blur(60px)' }} />
        <h2 className="font-bold text-[32px] tracking-[-0.02em] relative" style={H}>Ready to build something great?</h2>
        <p className="text-base opacity-90 mt-2 mb-8 relative" style={B}>Join thousands of teams shipping with Northwind.</p>
        <div className="flex gap-3 justify-center relative">
          <span className="inline-flex items-center gap-2 px-7 py-3 font-semibold text-sm" style={{ background: a, color: textOn(a), borderRadius: rx(radii.md), boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
            Start free trial <ArrowRight size={16} />
          </span>
          <span className="inline-flex items-center gap-2 px-7 py-3 font-semibold text-sm" style={{ border: `1.5px solid ${textOn(p)}66`, borderRadius: rx(radii.md) }}>Talk to sales</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-10" style={{ background: chrome.surface, borderTop: `1px solid ${chrome.border}`, color: chrome.textMuted }}>
        <div className="grid grid-cols-4 gap-8 mb-8 max-md:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 flex items-center justify-center" style={{ background: p, color: textOn(p), borderRadius: rx(radii.sm) }}><Sparkles size={14} /></span>
              <span className="font-bold" style={{ ...H, color: chrome.text }}>Northwind</span>
            </div>
            <p className="text-xs leading-relaxed">The workspace for modern product teams.</p>
          </div>
          {[['Product', ['Features', 'Pricing', 'Changelog']], ['Company', ['About', 'Blog', 'Careers']], ['Support', ['Help', 'Contact', 'Status']]].map(([title, items]) => (
            <div key={title as string} className="flex flex-col gap-2 text-sm">
              <strong className="font-semibold" style={{ color: chrome.text, ...H }}>{title as string}</strong>
              {(items as string[]).map((i) => <span key={i}>{i}</span>)}
            </div>
          ))}
        </div>
        <div className="pt-5 flex items-center justify-between text-xs" style={{ borderTop: `1px solid ${chrome.border}` }}>
          <span>© 2026 Northwind. All rights reserved.</span>
          <div className="flex gap-2">
            {[Twitter, Github, Linkedin].map((Icon, i) => (
              <span key={i} className="w-8 h-8 flex items-center justify-center" style={{ background: chrome.surfaceMuted, borderRadius: rx(radii.sm) }}><Icon size={14} /></span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
