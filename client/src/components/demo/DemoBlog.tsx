import { textOn } from '@/lib/color-utils.ts';
import type { PaletteColors, PaletteKey } from '@/lib/palette-utils.ts';

interface DemoBlogProps {
  colors: PaletteColors;
}

function getTone(colors: PaletteColors, key: PaletteKey, index: number): string {
  const c = colors[key];
  if (c && c.tones && c.tones[index]) return c.tones[index].hex;
  return c ? c.hex : '#888';
}

export function DemoBlog({ colors }: DemoBlogProps) {
  const p = colors.primary;
  const s = colors.secondary;
  const a = colors.accent;

  const tagData = [
    { label: 'Design', bg: getTone(colors, 'primary', 8), color: p.hex },
    { label: 'Color Theory', bg: getTone(colors, 'secondary', 8), color: s.hex },
    { label: 'UI/UX', bg: getTone(colors, 'accent', 8), color: a.hex },
    { label: 'Tutorial', bg: getTone(colors, 'info', 8), color: colors.info.hex },
  ];

  const relatedPosts = [
    'Typography Best Practices',
    'Designing for Accessibility',
    'CSS Grid Layout Patterns',
  ];

  return (
    <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 280px' }}>
      {/* Article */}
      <div className="flex flex-col gap-4">
        {/* Header badge */}
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-semibold self-start"
          style={{ background: a.hex, color: textOn(a.hex) }}
        >
          Design
        </span>

        <h2
          className="text-2xl font-bold font-heading leading-tight"
          style={{ color: getTone(colors, 'neutral', 0) }}
        >
          The Art of Color in User Interfaces
        </h2>

        <div className="text-sm font-sans" style={{ color: getTone(colors, 'neutral', 5) }}>
          March 1, 2026 &middot; 8 min read
        </div>

        <p className="text-sm leading-relaxed text-gray-700 font-sans">
          Color is one of the most powerful tools in a designer's toolkit. It influences mood, guides attention, and creates visual hierarchy. A well-chosen palette can elevate a product from functional to delightful.
        </p>

        <h3 className="text-lg font-bold font-heading" style={{ color: p.hex }}>
          Understanding Color Harmony
        </h3>
        <p className="text-sm leading-relaxed text-gray-700 font-sans">
          The foundation of any great palette starts with understanding how colors relate to each other. Complementary, analogous, and triadic schemes each create different emotional responses.
        </p>

        {/* Blockquote */}
        <blockquote
          className="py-4 px-5 rounded-lg my-2"
          style={{
            borderLeft: `4px solid ${a.hex}`,
            background: getTone(colors, 'accent', 9),
          }}
        >
          <p className="text-sm italic mb-2 font-sans" style={{ color: getTone(colors, 'neutral', 2) }}>
            "Design is not just what it looks like and feels like. Design is how it works."
          </p>
          <cite className="text-sm font-semibold not-italic" style={{ color: a.hex }}>
            — Steve Jobs
          </cite>
        </blockquote>

        <h3 className="text-lg font-bold font-heading" style={{ color: p.hex }}>
          Building a System
        </h3>
        <p className="text-sm leading-relaxed text-gray-700 font-sans">
          A color system goes beyond picking pretty colors. It defines semantic meaning — primary actions, warnings, success states — creating a consistent language throughout your interface.
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-2">
          {tagData.map(t => (
            <span
              key={t.label}
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: t.bg, color: t.color }}
            >
              {t.label}
            </span>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-6">
        {/* Author card */}
        <div className="bg-white rounded-lg p-5 shadow-sm text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3"
            style={{ background: p.hex, color: textOn(p.hex) }}
          >
            AC
          </div>
          <div className="font-bold text-sm font-heading" style={{ color: getTone(colors, 'neutral', 1) }}>
            Alex Chen
          </div>
          <div className="text-xs mt-1 font-sans" style={{ color: getTone(colors, 'neutral', 5) }}>
            Senior Designer
          </div>
        </div>

        {/* Related posts */}
        <div className="bg-white rounded-lg p-5 shadow-sm">
          <div
            className="font-bold text-sm mb-3 font-heading"
            style={{ color: getTone(colors, 'neutral', 1) }}
          >
            Related Posts
          </div>
          <div className="flex flex-col gap-2">
            {relatedPosts.map(title => (
              <a
                key={title}
                className="text-sm cursor-pointer hover:underline font-sans"
                style={{ color: p.hex }}
              >
                {title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
