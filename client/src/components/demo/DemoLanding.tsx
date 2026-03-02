import { textOn } from '@/lib/color-utils.ts';
import { getTone, type PaletteColors } from '@/lib/palette-utils.ts';
import { useDemoSettings } from '@/hooks/use-demo-settings.tsx';
import {
  Zap, Palette, Shield, ArrowRight, Play, Star, Check, Twitter, Github, Linkedin,
  Menu, ChevronRight, Hexagon, Mail,
} from 'lucide-react';

interface DemoLandingProps {
  colors: PaletteColors;
}

export function DemoLanding({ colors }: DemoLandingProps) {
  const { headingFont, bodyFont, isDark } = useDemoSettings();
  const p = colors.primary;
  const s = colors.secondary;
  const a = colors.accent;

  const bg = isDark ? getTone(colors, 'neutral', 1) : '#fff';
  const textMuted = isDark ? getTone(colors, 'neutral', 6) : '#6b7280';
  const cardBg = isDark ? getTone(colors, 'neutral', 2) : '#fff';
  const headingColor = isDark ? '#e5e5e5' : '#1a1a1a';

  const features = [
    { Icon: Zap, title: 'Lightning Fast', desc: 'Optimized performance that keeps users engaged and coming back.', color: p.hex },
    { Icon: Palette, title: 'Beautiful Design', desc: 'Pixel-perfect interfaces crafted with attention to every detail.', color: s.hex },
    { Icon: Shield, title: 'Secure & Reliable', desc: 'Enterprise-grade security to protect your data around the clock.', color: a.hex },
  ];

  const pricingTiers = [
    { name: 'Starter', price: '$0', period: '/month', desc: 'Perfect for side projects', features: ['Up to 3 projects', '1 team member', 'Basic analytics', 'Community support'], color: s.hex, popular: false },
    { name: 'Pro', price: '$29', period: '/month', desc: 'For growing businesses', features: ['Unlimited projects', '10 team members', 'Advanced analytics', 'Priority support', 'Custom domain'], color: p.hex, popular: true },
    { name: 'Enterprise', price: '$99', period: '/month', desc: 'For large organizations', features: ['Everything in Pro', 'Unlimited members', 'SSO & SAML', 'Dedicated support', '99.99% SLA'], color: a.hex, popular: false },
  ];

  return (
    <div className="flex flex-col" style={{ background: bg }}>
      {/* Navbar */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{ background: p.hex, color: textOn(p.hex) }}
      >
        <div className="flex items-center gap-2">
          <Hexagon size={22} />
          <span className="font-bold text-lg" style={{ fontFamily: headingFont }}>BrandName</span>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex gap-5 text-sm opacity-90" style={{ fontFamily: bodyFont }}>
            <span className="cursor-pointer hover:opacity-100 transition-opacity">Home</span>
            <span className="cursor-pointer hover:opacity-100 transition-opacity">About</span>
            <span className="cursor-pointer hover:opacity-100 transition-opacity">Services</span>
            <span className="cursor-pointer hover:opacity-100 transition-opacity">Contact</span>
          </div>
          <Menu size={20} className="cursor-pointer opacity-80 hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Hero */}
      <div
        className="px-8 py-28 text-center text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${p.hex}, ${s.hex})` }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{ background: 'radial-gradient(circle at 70% 30%, white 0%, transparent 50%)' }}
        />
        {/* Decorative shapes */}
        <div className="absolute top-10 left-12 w-20 h-20 rounded-full opacity-10" style={{ background: '#fff' }} />
        <div className="absolute bottom-12 right-16 w-14 h-14 rounded-lg rotate-45 opacity-10" style={{ background: '#fff' }} />
        <div className="absolute top-20 right-32 w-8 h-8 rounded-full opacity-15" style={{ background: '#fff' }} />
        <div className="relative">
          <div className="text-5xl font-bold mb-4 max-w-xl mx-auto leading-tight" style={{ fontFamily: headingFont }}>
            Transform Your Digital Experience
          </div>
          <div className="text-lg opacity-90 mb-8 max-w-lg mx-auto" style={{ fontFamily: bodyFont }}>
            Create stunning interfaces with a palette designed to inspire. Your brand deserves colors that speak.
          </div>
          <div className="flex gap-3 justify-center">
            <span
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:brightness-110"
              style={{ background: a.hex, color: textOn(a.hex), boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
            >
              Get Started Free <ArrowRight size={16} />
            </span>
            <span
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:bg-white/20"
              style={{ border: '2px solid rgba(255,255,255,0.7)', color: '#fff' }}
            >
              <Play size={16} /> Watch Demo
            </span>
          </div>
          {/* Star rating + trust */}
          <div className="flex items-center justify-center gap-2 mt-8 opacity-80">
            <div className="flex gap-0.5">
              {[0, 1, 2, 3, 4].map(i => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </div>
            <span className="text-sm" style={{ fontFamily: bodyFont }}>Trusted by 10,000+ designers</span>
          </div>
        </div>
      </div>

      {/* Logo strip */}
      <div
        className="px-8 py-6 text-center"
        style={{ background: isDark ? getTone(colors, 'neutral', 0) : '#f9fafb' }}
      >
        <div className="text-xs uppercase tracking-widest mb-4 font-semibold" style={{ color: textMuted, fontFamily: bodyFont }}>
          Trusted by leading teams
        </div>
        <div className="flex items-center justify-center gap-8">
          {['Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Stark'].map(name => (
            <div
              key={name}
              className="px-4 py-2 rounded-lg text-sm font-bold opacity-40"
              style={{ color: isDark ? getTone(colors, 'neutral', 6) : '#374151', fontFamily: headingFont }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-3 gap-6 p-8">
        {features.map(f => (
          <div
            key={f.title}
            className="rounded-xl p-6 text-center transition-all hover:-translate-y-1"
            style={{ background: cardBg, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: `${f.color}15`, color: f.color }}
            >
              <f.Icon size={28} />
            </div>
            <div className="font-bold text-base mb-2" style={{ fontFamily: headingFont, color: headingColor }}>{f.title}</div>
            <div className="text-sm leading-relaxed mb-3" style={{ color: textMuted, fontFamily: bodyFont }}>{f.desc}</div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold cursor-pointer" style={{ color: f.color, fontFamily: bodyFont }}>
              Learn more <ChevronRight size={14} />
            </span>
          </div>
        ))}
      </div>

      {/* Testimonials */}
      <div className="grid grid-cols-2 gap-6 mx-8 mb-8">
        {[
          { initials: 'SC', name: 'Sarah Chen', role: 'Design Lead at TechCo', quote: 'This platform completely transformed how we approach design. The color system is incredibly intuitive and our team productivity skyrocketed.', color: a.hex },
          { initials: 'JM', name: 'James Miller', role: 'CTO at StartupXYZ', quote: 'The best investment we made this year. Our design-to-development handoff improved dramatically and consistency across products is amazing.', color: s.hex },
        ].map(t => (
          <div
            key={t.initials}
            className="p-6 rounded-xl relative"
            style={{
              background: isDark ? getTone(colors, 'neutral', 2) : getTone(colors, 'neutral', 8),
              borderLeft: `4px solid ${t.color}`,
            }}
          >
            <div className="absolute -top-2 left-4 text-4xl leading-none" style={{ color: `${t.color}40` }}>&ldquo;</div>
            <div className="flex gap-0.5 mb-3">
              {[0, 1, 2, 3, 4].map(i => (
                <Star key={i} size={14} fill={t.color} style={{ color: t.color }} />
              ))}
            </div>
            <div className="flex gap-4 items-start">
              <div
                className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                style={{ background: t.color, color: textOn(t.color) }}
              >
                {t.initials}
              </div>
              <div>
                <div className="text-sm italic mb-2" style={{ color: isDark ? getTone(colors, 'neutral', 7) : getTone(colors, 'neutral', 2), fontFamily: bodyFont }}>
                  "{t.quote}"
                </div>
                <div className="text-sm font-semibold" style={{ color: t.color, fontFamily: bodyFont }}>{t.name}</div>
                <div className="text-xs" style={{ color: textMuted, fontFamily: bodyFont }}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div className="px-8 py-12" style={{ background: isDark ? getTone(colors, 'neutral', 0) : '#f9fafb' }}>
        <div className="text-center mb-8">
          <div className="text-3xl font-bold mb-2" style={{ color: headingColor, fontFamily: headingFont }}>Simple Pricing</div>
          <div className="text-sm" style={{ color: textMuted, fontFamily: bodyFont }}>Choose the plan that fits your needs</div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {pricingTiers.map(tier => (
            <div
              key={tier.name}
              className="rounded-xl p-6 flex flex-col relative transition-all hover:-translate-y-1"
              style={{
                background: cardBg,
                boxShadow: tier.popular ? `0 8px 24px ${tier.color}25` : '0 2px 12px rgba(0,0,0,0.06)',
                border: tier.popular ? `2px solid ${tier.color}` : `1px solid ${isDark ? getTone(colors, 'neutral', 3) : '#e5e7eb'}`,
              }}
            >
              {tier.popular && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: tier.color, color: textOn(tier.color) }}
                >
                  Most Popular
                </div>
              )}
              <div className="text-sm font-semibold mb-1" style={{ color: tier.color, fontFamily: headingFont }}>{tier.name}</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold" style={{ color: headingColor, fontFamily: headingFont }}>{tier.price}</span>
                <span className="text-sm" style={{ color: textMuted, fontFamily: bodyFont }}>{tier.period}</span>
              </div>
              <div className="text-xs mb-5" style={{ color: textMuted, fontFamily: bodyFont }}>{tier.desc}</div>
              <div className="flex flex-col gap-2.5 mb-6 flex-1">
                {tier.features.map(feat => (
                  <div key={feat} className="flex items-center gap-2 text-sm" style={{ color: isDark ? getTone(colors, 'neutral', 7) : '#374151', fontFamily: bodyFont }}>
                    <Check size={15} style={{ color: tier.color, flexShrink: 0 }} />
                    {feat}
                  </div>
                ))}
              </div>
              <span
                className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:brightness-110"
                style={{
                  background: tier.popular ? tier.color : 'transparent',
                  color: tier.popular ? textOn(tier.color) : tier.color,
                  border: tier.popular ? 'none' : `2px solid ${tier.color}`,
                  boxShadow: tier.popular ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                  fontFamily: bodyFont,
                }}
              >
                Get Started <ArrowRight size={14} />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div
        className="px-8 py-14 text-center"
        style={{ background: s.hex, color: textOn(s.hex) }}
      >
        <div className="text-2xl font-bold mb-3" style={{ fontFamily: headingFont }}>Ready to get started?</div>
        <div className="text-base opacity-90 mb-8" style={{ fontFamily: bodyFont }}>Join thousands of designers who trust our platform.</div>
        <div className="flex gap-3 justify-center">
          <span
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:brightness-110"
            style={{ background: a.hex, color: textOn(a.hex), boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
          >
            Start Free Trial <ArrowRight size={16} />
          </span>
          <span
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:opacity-80"
            style={{ border: `2px solid ${textOn(s.hex)}60`, color: textOn(s.hex) }}
          >
            <Mail size={16} /> Contact Sales
          </span>
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-8 py-8"
        style={{ background: getTone(colors, 'neutral', 0), color: getTone(colors, 'neutral', 6) }}
      >
        <div className="grid grid-cols-4 gap-8 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Hexagon size={18} style={{ color: getTone(colors, 'neutral', 3) }} />
              <span className="font-bold text-base" style={{ color: getTone(colors, 'neutral', 3), fontFamily: headingFont }}>BrandName</span>
            </div>
            <div className="text-xs leading-relaxed" style={{ fontFamily: bodyFont }}>
              Building beautiful digital experiences since 2024.
            </div>
          </div>
          <div className="flex flex-col gap-2 text-sm" style={{ fontFamily: bodyFont }}>
            <strong className="font-semibold" style={{ color: getTone(colors, 'neutral', 3), fontFamily: headingFont }}>Product</strong>
            <div>Features</div>
            <div>Pricing</div>
            <div>Docs</div>
          </div>
          <div className="flex flex-col gap-2 text-sm" style={{ fontFamily: bodyFont }}>
            <strong className="font-semibold" style={{ color: getTone(colors, 'neutral', 3), fontFamily: headingFont }}>Company</strong>
            <div>About</div>
            <div>Blog</div>
            <div>Careers</div>
          </div>
          <div className="flex flex-col gap-2 text-sm" style={{ fontFamily: bodyFont }}>
            <strong className="font-semibold" style={{ color: getTone(colors, 'neutral', 3), fontFamily: headingFont }}>Support</strong>
            <div>Help Center</div>
            <div>Contact</div>
            <div>Status</div>
          </div>
        </div>
        <div
          className="pt-4 flex items-center justify-between text-xs"
          style={{ borderTop: `1px solid ${getTone(colors, 'neutral', 1)}`, color: getTone(colors, 'neutral', 5) }}
        >
          <span>&copy; 2026 BrandName. All rights reserved.</span>
          <div className="flex gap-3">
            {[
              { Icon: Twitter, label: 'Twitter' },
              { Icon: Github, label: 'GitHub' },
              { Icon: Linkedin, label: 'LinkedIn' },
            ].map(({ Icon, label }) => (
              <div
                key={label}
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:opacity-80"
                style={{ background: getTone(colors, 'neutral', 1) }}
              >
                <Icon size={14} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
