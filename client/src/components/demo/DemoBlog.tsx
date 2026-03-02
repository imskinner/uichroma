import { textOn } from '@/lib/color-utils.ts';
import { getTone, type PaletteColors } from '@/lib/palette-utils.ts';
import { useDemoSettings } from '@/hooks/use-demo-settings.tsx';
import {
  Twitter, Linkedin, Link2, Clock, ChevronRight, Heart,
  Bookmark, Code2, Hash, List, Eye, Mail, Calendar,
} from 'lucide-react';

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
  const borderColor = isDark ? getTone(colors, 'neutral', 3) : '#e5e7eb';

  const tagData = [
    { label: 'Design', bg: isDark ? getTone(colors, 'primary', 1) : getTone(colors, 'primary', 8), color: p.hex },
    { label: 'Color Theory', bg: isDark ? getTone(colors, 'secondary', 1) : getTone(colors, 'secondary', 8), color: s.hex },
    { label: 'UI/UX', bg: isDark ? getTone(colors, 'accent', 1) : getTone(colors, 'accent', 8), color: a.hex },
    { label: 'Tutorial', bg: isDark ? getTone(colors, 'info', 1) : getTone(colors, 'info', 8), color: colors.info.hex },
  ];

  const tocItems = [
    { label: 'Understanding Color Harmony', active: true },
    { label: 'Building a System', active: false },
    { label: 'Code Implementation', active: false },
  ];

  const relatedPosts = [
    { title: 'Typography Best Practices', color: p.hex, readTime: '5 min' },
    { title: 'Designing for Accessibility', color: s.hex, readTime: '7 min' },
    { title: 'CSS Grid Layout Patterns', color: a.hex, readTime: '6 min' },
  ];

  return (
    <div style={{ background: bg }}>
      {/* Reading progress bar */}
      <div className="w-full rounded-full overflow-hidden mb-4" style={{ height: 6, background: isDark ? getTone(colors, 'neutral', 2) : '#e5e7eb' }}>
        <div className="h-full rounded-full" style={{ width: '65%', background: `linear-gradient(90deg, ${p.hex}, ${s.hex}, ${a.hex})` }} />
      </div>

      {/* Hero image placeholder */}
      <div
        className="w-full h-48 rounded-xl mb-6 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${p.hex}, ${s.hex}, ${a.hex})` }}
      >
        {/* Decorative shapes */}
        <div className="absolute top-6 left-8 w-14 h-14 rounded-full opacity-15" style={{ background: '#fff' }} />
        <div className="absolute bottom-8 right-16 w-8 h-8 rounded-lg rotate-45 opacity-10" style={{ background: '#fff' }} />
        <div
          className="absolute inset-0 flex items-center justify-center text-white/30 text-6xl font-bold"
          style={{ fontFamily: headingFont }}
        >
          BLOG
        </div>
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16" style={{ background: `linear-gradient(transparent, ${bg})` }} />
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
            <div className="flex items-center gap-1">
              <Calendar size={13} />
              <span>March 1, 2026</span>
            </div>
            <span>&middot;</span>
            <div className="flex items-center gap-1">
              <Clock size={13} />
              <span>8 min read</span>
            </div>
            <span>&middot;</span>
            <div className="flex items-center gap-1">
              <Eye size={13} />
              <span>2.4k views</span>
            </div>
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

          {/* Code Block */}
          <div
            className="rounded-xl overflow-hidden my-2"
            style={{ border: `1px solid ${borderColor}` }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2.5 text-xs"
              style={{
                background: isDark ? getTone(colors, 'neutral', 0) : '#f9fafb',
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              <Code2 size={14} style={{ color: textMuted }} />
              <span style={{ color: textMuted, fontFamily: bodyFont }}>palette.css</span>
            </div>
            <div
              className="px-4 py-4 text-sm leading-6 overflow-x-auto"
              style={{ background: isDark ? getTone(colors, 'neutral', 0) : '#fafafa', fontFamily: 'monospace' }}
            >
              <div style={{ color: textMuted }}>:root {'{'}</div>
              <div className="flex items-center gap-2" style={{ paddingLeft: 16 }}>
                <span style={{ color: p.hex }}>--primary</span>
                <span style={{ color: textMuted }}>:</span>
                <div className="w-3 h-3 rounded-sm inline-block" style={{ background: p.hex }} />
                <span style={{ color: textDefault }}>{p.hex}</span>
                <span style={{ color: textMuted }}>;</span>
              </div>
              <div className="flex items-center gap-2" style={{ paddingLeft: 16 }}>
                <span style={{ color: s.hex }}>--secondary</span>
                <span style={{ color: textMuted }}>:</span>
                <div className="w-3 h-3 rounded-sm inline-block" style={{ background: s.hex }} />
                <span style={{ color: textDefault }}>{s.hex}</span>
                <span style={{ color: textMuted }}>;</span>
              </div>
              <div className="flex items-center gap-2" style={{ paddingLeft: 16 }}>
                <span style={{ color: a.hex }}>--accent</span>
                <span style={{ color: textMuted }}>:</span>
                <div className="w-3 h-3 rounded-sm inline-block" style={{ background: a.hex }} />
                <span style={{ color: textDefault }}>{a.hex}</span>
                <span style={{ color: textMuted }}>;</span>
              </div>
              <div style={{ color: textMuted }}>{'}'}</div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-2">
            {tagData.map(t => (
              <span
                key={t.label}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: t.bg, color: t.color, fontFamily: bodyFont }}
              >
                <Hash size={11} />
                {t.label}
              </span>
            ))}
          </div>

          {/* Share row */}
          <div className="flex items-center gap-3 pt-4 mt-2" style={{ borderTop: `1px solid ${borderColor}` }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: textMuted, fontFamily: bodyFont }}>Share</span>
            {[
              { Icon: Twitter, label: 'Twitter' },
              { Icon: Linkedin, label: 'LinkedIn' },
              { Icon: Link2, label: 'Copy Link' },
              { Icon: Bookmark, label: 'Bookmark' },
            ].map(({ Icon, label }) => (
              <div
                key={label}
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:brightness-110"
                style={{
                  background: isDark ? getTone(colors, 'neutral', 2) : '#f3f4f6',
                  color: p.hex,
                }}
              >
                <Icon size={15} />
              </div>
            ))}
            <div className="ml-auto flex items-center gap-1.5">
              <Heart size={15} style={{ color: colors.danger.hex }} />
              <span className="text-xs font-semibold" style={{ color: textMuted, fontFamily: bodyFont }}>247</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Table of Contents */}
          <div
            className="rounded-xl p-5"
            style={{ background: cardBg, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <List size={16} style={{ color: p.hex }} />
              <span className="font-bold text-sm" style={{ color: headingColor, fontFamily: headingFont }}>Contents</span>
            </div>
            <div className="flex flex-col gap-1">
              {tocItems.map(item => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
                  style={{
                    fontFamily: bodyFont,
                    color: item.active ? p.hex : textMuted,
                    background: item.active ? `${p.hex}10` : 'transparent',
                    borderLeft: item.active ? `3px solid ${p.hex}` : '3px solid transparent',
                    fontWeight: item.active ? 600 : 400,
                  }}
                >
                  <Hash size={10} style={{ flexShrink: 0 }} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Author card */}
          <div
            className="rounded-xl p-5 text-center"
            style={{ background: cardBg, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
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
            <div className="flex justify-center gap-4 mb-3 text-xs" style={{ fontFamily: bodyFont }}>
              <div className="text-center">
                <div className="font-bold" style={{ color: headingColor }}>48</div>
                <div style={{ color: textMuted }}>Articles</div>
              </div>
              <div className="text-center">
                <div className="font-bold" style={{ color: headingColor }}>2.1k</div>
                <div style={{ color: textMuted }}>Followers</div>
              </div>
            </div>
            <span
              className="inline-block px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all hover:brightness-110 mb-2"
              style={{ background: p.hex, color: textOn(p.hex), fontFamily: bodyFont }}
            >
              Follow
            </span>
            <div className="flex justify-center gap-2 mt-1">
              {[Twitter, Linkedin].map((Icon, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:brightness-110"
                  style={{ background: `${p.hex}15`, color: p.hex }}
                >
                  <Icon size={13} />
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div
            className="rounded-xl p-5"
            style={{ background: isDark ? getTone(colors, 'primary', 1) : getTone(colors, 'primary', 8), boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div className="font-bold text-sm mb-1" style={{ color: p.hex, fontFamily: headingFont }}>
              Newsletter
            </div>
            <div className="text-xs mb-3" style={{ color: textMuted, fontFamily: bodyFont }}>
              Get design tips delivered weekly.
            </div>
            <div className="relative mb-2">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: textMuted }} />
              <input
                className="w-full rounded-lg pl-8 pr-3 py-2 text-xs outline-none"
                placeholder="your@email.com"
                style={{
                  background: isDark ? getTone(colors, 'neutral', 1) : '#fff',
                  border: `1px solid ${isDark ? getTone(colors, 'neutral', 3) : '#d1d5db'}`,
                  color: textDefault,
                  fontFamily: bodyFont,
                }}
              />
            </div>
            <span
              className="inline-block w-full text-center px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all hover:brightness-110"
              style={{ background: p.hex, color: textOn(p.hex), fontFamily: bodyFont }}
            >
              Subscribe
            </span>
            <div className="text-[10px] mt-2 text-center" style={{ color: textMuted, fontFamily: bodyFont }}>
              No spam. Unsubscribe anytime.
            </div>
          </div>

          {/* Related posts */}
          <div
            className="rounded-xl p-5"
            style={{ background: cardBg, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div
              className="font-bold text-sm mb-3"
              style={{ color: headingColor, fontFamily: headingFont }}
            >
              Related Posts
            </div>
            <div className="flex flex-col gap-2.5">
              {relatedPosts.map(post => (
                <div
                  key={post.title}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: post.color }} />
                  <span
                    className="text-sm flex-1 group-hover:underline transition-colors"
                    style={{ color: p.hex, fontFamily: bodyFont }}
                  >
                    {post.title}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] flex-shrink-0" style={{ color: textMuted }}>
                    <Clock size={10} />
                    {post.readTime}
                  </div>
                  <ChevronRight size={13} style={{ color: textMuted, flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
