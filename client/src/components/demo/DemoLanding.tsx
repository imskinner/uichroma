import { textOn } from '@/lib/color-utils.ts';
import { getTone, type PaletteColors } from '@/lib/palette-utils.ts';
import { useDemoSettings } from '@/hooks/use-demo-settings.tsx';

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

  const features = [
    { icon: '\u26A1', title: 'Lightning Fast', desc: 'Optimized performance that keeps users engaged and coming back.', color: p.hex },
    { icon: '\uD83C\uDFA8', title: 'Beautiful Design', desc: 'Pixel-perfect interfaces crafted with attention to every detail.', color: s.hex },
    { icon: '\uD83D\uDD12', title: 'Secure & Reliable', desc: 'Enterprise-grade security to protect your data around the clock.', color: a.hex },
  ];

  return (
    <div className="flex flex-col" style={{ background: bg }}>
      {/* Navbar */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{ background: p.hex, color: textOn(p.hex) }}
      >
        <span className="font-bold text-lg" style={{ fontFamily: headingFont }}>BrandName</span>
        <div className="flex gap-5 text-sm opacity-90" style={{ fontFamily: bodyFont }}>
          <span className="cursor-pointer hover:opacity-100 transition-opacity">Home</span>
          <span className="cursor-pointer hover:opacity-100 transition-opacity">About</span>
          <span className="cursor-pointer hover:opacity-100 transition-opacity">Services</span>
          <span className="cursor-pointer hover:opacity-100 transition-opacity">Contact</span>
        </div>
      </div>

      {/* Hero */}
      <div
        className="px-8 py-20 text-center text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${p.hex}, ${s.hex})` }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{ background: 'radial-gradient(circle at 70% 30%, white 0%, transparent 50%)' }}
        />
        <div className="relative">
          <div className="text-4xl font-bold mb-4 max-w-xl mx-auto leading-tight" style={{ fontFamily: headingFont }}>
            Transform Your Digital Experience
          </div>
          <div className="text-lg opacity-90 mb-8 max-w-lg mx-auto" style={{ fontFamily: bodyFont }}>
            Create stunning interfaces with a palette designed to inspire. Your brand deserves colors that speak.
          </div>
          <div className="flex gap-3 justify-center">
            <span
              className="inline-block px-7 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:brightness-110"
              style={{ background: a.hex, color: textOn(a.hex), boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
            >
              Get Started Free
            </span>
            <span
              className="inline-block px-7 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:bg-white/20"
              style={{ border: '2px solid rgba(255,255,255,0.7)', color: '#fff' }}
            >
              Learn More
            </span>
          </div>
        </div>
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-3 gap-6 p-8">
        {features.map(f => (
          <div
            key={f.title}
            className="rounded-xl p-6 text-center transition-all hover:-translate-y-1"
            style={{ background: cardBg, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-xl mx-auto mb-4"
              style={{ background: `${f.color}18`, color: f.color }}
            >
              {f.icon}
            </div>
            <div className="font-bold text-base mb-2" style={{ fontFamily: headingFont, color: isDark ? '#e5e5e5' : '#1a1a1a' }}>{f.title}</div>
            <div className="text-sm leading-relaxed" style={{ color: textMuted, fontFamily: bodyFont }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Testimonial */}
      <div
        className="mx-8 mb-8 p-6 rounded-xl relative"
        style={{
          background: isDark ? getTone(colors, 'neutral', 2) : getTone(colors, 'neutral', 8),
          borderLeft: `4px solid ${a.hex}`,
        }}
      >
        <div
          className="absolute -top-2 left-4 text-4xl leading-none"
          style={{ color: `${a.hex}40` }}
        >
          &ldquo;
        </div>
        <div className="flex gap-4 items-start">
          <div
            className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
            style={{ background: a.hex, color: textOn(a.hex) }}
          >
            SC
          </div>
          <div>
            <div className="text-sm italic mb-2" style={{ color: isDark ? getTone(colors, 'neutral', 7) : getTone(colors, 'neutral', 2), fontFamily: bodyFont }}>
              "This platform completely transformed how we approach design. The color system is incredibly intuitive and our team productivity skyrocketed."
            </div>
            <div className="text-sm font-semibold" style={{ color: a.hex, fontFamily: bodyFont }}>
              Sarah Chen
            </div>
            <div className="text-xs" style={{ color: textMuted, fontFamily: bodyFont }}>
              Design Lead at TechCo
            </div>
          </div>
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
            className="inline-block px-7 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:brightness-110"
            style={{ background: a.hex, color: textOn(a.hex), boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
          >
            Start Free Trial
          </span>
          <span
            className="inline-block px-7 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:opacity-80"
            style={{ border: `2px solid ${textOn(s.hex)}60`, color: textOn(s.hex) }}
          >
            Contact Sales
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
            <div className="font-bold text-base mb-3" style={{ color: getTone(colors, 'neutral', 3), fontFamily: headingFont }}>BrandName</div>
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
          <div className="flex gap-3" style={{ fontFamily: bodyFont }}>
            <span className="cursor-pointer hover:opacity-80">Twitter</span>
            <span className="cursor-pointer hover:opacity-80">GitHub</span>
            <span className="cursor-pointer hover:opacity-80">LinkedIn</span>
          </div>
        </div>
      </div>
    </div>
  );
}
