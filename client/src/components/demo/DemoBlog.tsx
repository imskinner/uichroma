import { textOn } from '@/lib/color-utils.ts';
import { getTone, type PaletteColors } from '@/lib/palette-utils.ts';
import { useDemoSettings } from '@/hooks/use-demo-settings.tsx';

interface DemoBlogProps {
  colors: PaletteColors;
}

export function DemoBlog({ colors }: DemoBlogProps) {
  const { headingFont, bodyFont, isDark } = useDemoSettings();
  const p = colors.primary;
  const s = colors.secondary;
  const a = colors.accent;

  const bg = isDark ? getTone(colors, 'neutral', 1) : '#fff';
  const cardBg = isDark ? getTone(colors, 'neutral', 2) : '#fff';
  const textDefault = isDark ? getTone(colors, 'neutral', 8) : '#374151';
  const textMuted = isDark ? getTone(colors, 'neutral', 6) : '#6b7280';
  const headingColor = isDark ? '#e5e5e5' : getTone(colors, 'neutral', 0);

  const tagData = [
    { label: 'Design', bg: isDark ? getTone(colors, 'primary', 1) : getTone(colors, 'primary', 8), color: p.hex },
    { label: 'Color Theory', bg: isDark ? getTone(colors, 'secondary', 1) : getTone(colors, 'secondary', 8), color: s.hex },
    { label: 'UI/UX', bg: isDark ? getTone(colors, 'accent', 1) : getTone(colors, 'accent', 8), color: a.hex },
    { label: 'Tutorial', bg: isDark ? getTone(colors, 'info', 1) : getTone(colors, 'info', 8), color: colors.info.hex },
  ];

  const relatedPosts = [
    'Typography Best Practices',
    'Designing for Accessibility',
    'CSS Grid Layout Patterns',
  ];

  return (
    <div style={{ background: bg }}>
      {/* Reading progress bar (decorative) */}
      <div className="w-full h-1 rounded-full overflow-hidden mb-4" style={{ background: isDark ? getTone(colors, 'neutral', 2) : '#e5e7eb' }}>
        <div className="h-full rounded-full" style={{ width: '65%', background: `linear-gradient(90deg, ${p.hex}, ${a.hex})` }} />
      </div>

      {/* Hero image placeholder */}
      <div
        className="w-full h-48 rounded-xl mb-6 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${p.hex}, ${s.hex}, ${a.hex})` }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center text-white/30 text-6xl font-bold"
          style={{ fontFamily: headingFont }}
        >
          BLOG
        </div>
      </div>

      <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 280px' }}>
        {/* Article */}
        <div className="flex flex-col gap-5">
          {/* Header badge */}
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold self-start"
            style={{ background: a.hex, color: textOn(a.hex), fontFamily: bodyFont }}
          >
            Design
          </span>

          <h2
            className="text-3xl font-bold leading-tight"
            style={{ color: headingColor, fontFamily: headingFont }}
          >
            The Art of Color in User Interfaces
          </h2>

          <div className="flex items-center gap-3 text-sm" style={{ color: textMuted, fontFamily: bodyFont }}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: p.hex, color: textOn(p.hex) }}
            >
              AC
            </div>
            <span>Alex Chen</span>
            <span>&middot;</span>
            <span>March 1, 2026</span>
            <span>&middot;</span>
            <span>8 min read</span>
          </div>

          <p className="text-base leading-7" style={{ color: textDefault, fontFamily: bodyFont }}>
            Color is one of the most powerful tools in a designer's toolkit. It influences mood, guides attention, and creates visual hierarchy. A well-chosen palette can elevate a product from functional to delightful.
          </p>

          <h3 className="text-xl font-bold" style={{ color: p.hex, fontFamily: headingFont }}>
            Understanding Color Harmony
          </h3>
          <p className="text-base leading-7" style={{ color: textDefault, fontFamily: bodyFont }}>
            The foundation of any great palette starts with understanding how colors relate to each other. Complementary, analogous, and triadic schemes each create different emotional responses.
          </p>

          {/* Blockquote */}
          <blockquote
            className="py-5 px-6 rounded-xl my-2 relative"
            style={{
              borderLeft: `4px solid ${a.hex}`,
              background: isDark ? getTone(colors, 'accent', 1) : getTone(colors, 'accent', 9),
            }}
          >
            <div className="absolute -top-1 left-3 text-3xl leading-none" style={{ color: `${a.hex}40` }}>&ldquo;</div>
            <p className="text-base italic mb-2 leading-relaxed" style={{ color: isDark ? getTone(colors, 'neutral', 7) : getTone(colors, 'neutral', 2), fontFamily: bodyFont }}>
              "Design is not just what it looks like and feels like. Design is how it works."
            </p>
            <cite className="text-sm font-semibold not-italic" style={{ color: a.hex, fontFamily: bodyFont }}>
              — Steve Jobs
            </cite>
          </blockquote>

          <h3 className="text-xl font-bold" style={{ color: p.hex, fontFamily: headingFont }}>
            Building a System
          </h3>
          <p className="text-base leading-7" style={{ color: textDefault, fontFamily: bodyFont }}>
            A color system goes beyond picking pretty colors. It defines semantic meaning — primary actions, warnings, success states — creating a consistent language throughout your interface.
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-2">
            {tagData.map(t => (
              <span
                key={t.label}
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: t.bg, color: t.color, fontFamily: bodyFont }}
              >
                {t.label}
              </span>
            ))}
          </div>

          {/* Share row */}
          <div className="flex items-center gap-3 pt-4 mt-2" style={{ borderTop: `1px solid ${isDark ? getTone(colors, 'neutral', 3) : '#e5e7eb'}` }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: textMuted, fontFamily: bodyFont }}>Share</span>
            {['Twitter', 'LinkedIn', 'Copy Link'].map(label => (
              <span
                key={label}
                className="inline-block px-3 py-1 rounded-lg text-xs cursor-pointer transition-all hover:brightness-110"
                style={{
                  background: isDark ? getTone(colors, 'neutral', 2) : '#f3f4f6',
                  color: p.hex,
                  fontFamily: bodyFont,
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Author card */}
          <div
            className="rounded-xl p-5 text-center"
            style={{ background: cardBg, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3"
              style={{ background: p.hex, color: textOn(p.hex) }}
            >
              AC
            </div>
            <div className="font-bold text-sm" style={{ color: headingColor, fontFamily: headingFont }}>
              Alex Chen
            </div>
            <div className="text-xs mt-1 mb-2" style={{ color: textMuted, fontFamily: bodyFont }}>
              Senior Designer
            </div>
            <div className="text-xs leading-relaxed mb-3" style={{ color: textMuted, fontFamily: bodyFont }}>
              Passionate about color theory and accessible design systems.
            </div>
            <span
              className="inline-block px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all hover:brightness-110"
              style={{ background: p.hex, color: textOn(p.hex), fontFamily: bodyFont }}
            >
              Follow
            </span>
          </div>

          {/* Newsletter */}
          <div
            className="rounded-xl p-5"
            style={{ background: isDark ? getTone(colors, 'primary', 1) : getTone(colors, 'primary', 8), boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <div className="font-bold text-sm mb-1" style={{ color: p.hex, fontFamily: headingFont }}>
              Newsletter
            </div>
            <div className="text-xs mb-3" style={{ color: textMuted, fontFamily: bodyFont }}>
              Get design tips delivered weekly.
            </div>
            <input
              className="w-full rounded-lg px-3 py-2 text-xs outline-none mb-2"
              placeholder="your@email.com"
              style={{
                background: isDark ? getTone(colors, 'neutral', 1) : '#fff',
                border: `1px solid ${isDark ? getTone(colors, 'neutral', 3) : '#d1d5db'}`,
                color: textDefault,
                fontFamily: bodyFont,
              }}
            />
            <span
              className="inline-block w-full text-center px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all hover:brightness-110"
              style={{ background: p.hex, color: textOn(p.hex), fontFamily: bodyFont }}
            >
              Subscribe
            </span>
          </div>

          {/* Related posts */}
          <div
            className="rounded-xl p-5"
            style={{ background: cardBg, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <div
              className="font-bold text-sm mb-3"
              style={{ color: headingColor, fontFamily: headingFont }}
            >
              Related Posts
            </div>
            <div className="flex flex-col gap-2">
              {relatedPosts.map(title => (
                <a
                  key={title}
                  className="text-sm cursor-pointer hover:underline transition-colors"
                  style={{ color: p.hex, fontFamily: bodyFont }}
                >
                  {title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
