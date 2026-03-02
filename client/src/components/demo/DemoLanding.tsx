import { textOn } from '@/lib/color-utils.ts';
import type { PaletteColors, PaletteKey } from '@/lib/palette-utils.ts';

interface DemoLandingProps {
  colors: PaletteColors;
}

function getTone(colors: PaletteColors, key: PaletteKey, index: number): string {
  const c = colors[key];
  if (c && c.tones && c.tones[index]) return c.tones[index].hex;
  return c ? c.hex : '#888';
}

export function DemoLanding({ colors }: DemoLandingProps) {
  const p = colors.primary;
  const s = colors.secondary;
  const a = colors.accent;

  const features = [
    { icon: '\u26A1', title: 'Lightning Fast', desc: 'Optimized performance that keeps users engaged and coming back.', color: p.hex },
    { icon: '\uD83C\uDFA8', title: 'Beautiful Design', desc: 'Pixel-perfect interfaces crafted with attention to every detail.', color: s.hex },
    { icon: '\uD83D\uDD12', title: 'Secure & Reliable', desc: 'Enterprise-grade security to protect your data around the clock.', color: a.hex },
  ];

  return (
    <div className="flex flex-col">
      {/* Navbar */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{ background: p.hex, color: textOn(p.hex) }}
      >
        <span className="font-bold text-lg font-heading">BrandName</span>
        <div className="flex gap-4 text-sm opacity-90">
          <span>Home</span>
          <span>About</span>
          <span>Services</span>
          <span>Contact</span>
        </div>
      </div>

      {/* Hero */}
      <div
        className="px-8 py-16 text-center text-white"
        style={{ background: `linear-gradient(135deg, ${p.hex}, ${s.hex})` }}
      >
        <div className="text-3xl font-bold mb-3 font-heading">Transform Your Digital Experience</div>
        <div className="text-base opacity-90 mb-6 max-w-lg mx-auto font-sans">
          Create stunning interfaces with a palette designed to inspire. Your brand deserves colors that speak.
        </div>
        <span
          className="inline-block px-6 py-2 rounded-lg font-semibold text-sm cursor-pointer"
          style={{ background: a.hex, color: textOn(a.hex) }}
        >
          Get Started Free
        </span>
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-3 gap-6 p-8">
        {features.map(f => (
          <div key={f.title} className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl mx-auto mb-4"
              style={{ background: f.color, color: textOn(f.color) }}
            >
              {f.icon}
            </div>
            <div className="font-bold text-base mb-2 font-heading">{f.title}</div>
            <div className="text-sm text-gray-600 font-sans">{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Testimonial */}
      <div
        className="mx-8 mb-8 p-6 rounded-lg"
        style={{
          background: getTone(colors, 'neutral', 8),
          borderLeft: `4px solid ${a.hex}`,
        }}
      >
        <div className="text-base italic mb-3 font-sans" style={{ color: getTone(colors, 'neutral', 2) }}>
          "This platform completely transformed how we approach design. The color system is incredibly intuitive and our team productivity skyrocketed."
        </div>
        <div className="text-sm font-semibold" style={{ color: a.hex }}>
          — Sarah Chen, Design Lead at TechCo
        </div>
      </div>

      {/* CTA */}
      <div
        className="px-8 py-12 text-center"
        style={{ background: s.hex, color: textOn(s.hex) }}
      >
        <div className="text-2xl font-bold mb-2 font-heading">Ready to get started?</div>
        <div className="text-base opacity-90 mb-6 font-sans">Join thousands of designers who trust our platform.</div>
        <span
          className="inline-block px-6 py-2 rounded-lg font-semibold text-sm cursor-pointer"
          style={{ background: a.hex, color: textOn(a.hex) }}
        >
          Start Free Trial
        </span>
      </div>

      {/* Footer */}
      <div
        className="px-8 py-8"
        style={{ background: getTone(colors, 'neutral', 0), color: getTone(colors, 'neutral', 6) }}
      >
        <div className="grid grid-cols-3 gap-8 mb-6">
          <div className="flex flex-col gap-2 text-sm">
            <strong className="font-semibold font-heading" style={{ color: getTone(colors, 'neutral', 2) }}>Product</strong>
            <div>Features</div>
            <div>Pricing</div>
            <div>Docs</div>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <strong className="font-semibold font-heading" style={{ color: getTone(colors, 'neutral', 2) }}>Company</strong>
            <div>About</div>
            <div>Blog</div>
            <div>Careers</div>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <strong className="font-semibold font-heading" style={{ color: getTone(colors, 'neutral', 2) }}>Support</strong>
            <div>Help Center</div>
            <div>Contact</div>
            <div>Status</div>
          </div>
        </div>
        <div
          className="pt-4 text-xs text-center"
          style={{
            borderTop: `1px solid ${getTone(colors, 'neutral', 1)}`,
            color: getTone(colors, 'neutral', 5),
          }}
        >
          &copy; 2026 BrandName. All rights reserved.
        </div>
      </div>
    </div>
  );
}
