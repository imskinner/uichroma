import { textOn } from '@/lib/color-utils.ts';
import type { PaletteColors } from '@/lib/palette-utils.ts';
import { useDemoSettings } from '@/hooks/use-demo-settings.tsx';
import {
  Twitter, Linkedin, Link2, Clock, ChevronRight, Heart,
  Bookmark, Code2, Hash, List, Eye, Mail, Calendar,
} from 'lucide-react';

interface DemoBlogProps {
  colors: PaletteColors;
}

export function DemoBlog({ colors }: DemoBlogProps) {
  const { headingFont, bodyFont, chrome, radii } = useDemoSettings();
  const p = colors.primary.hex;
  const s = colors.secondary.hex;
  const a = colors.accent.hex;
  const H = { fontFamily: `'${headingFont}', sans-serif` };
  const B = { fontFamily: `'${bodyFont}', sans-serif` };
  const rx = (n: number) => `${n}px`;

  const tags = [
    { label: 'Design', color: p }, { label: 'Color Theory', color: s },
    { label: 'UI/UX', color: a }, { label: 'Tutorial', color: colors.info.hex },
  ];
  const toc = [{ label: 'Understanding Color Harmony', active: true }, { label: 'Building a System', active: false }, { label: 'Code Implementation', active: false }];
  const related = [{ title: 'Typography Best Practices', color: p, readTime: '5 min' }, { title: 'Designing for Accessibility', color: s, readTime: '7 min' }, { title: 'CSS Grid Layout Patterns', color: a, readTime: '6 min' }];
  const card = { background: chrome.surface, border: `1px solid ${chrome.border}`, borderRadius: rx(radii.lg) };

  return (
    <div style={{ background: chrome.background, color: chrome.text, ...B }}>
      {/* Reading progress */}
      <div className="w-full rounded-full overflow-hidden mb-5" style={{ height: 5, background: chrome.surfaceMuted }}>
        <div className="h-full rounded-full" style={{ width: '65%', background: p }} />
      </div>

      {/* Featured hero */}
      <div className="w-full h-52 mb-7 relative overflow-hidden flex flex-col justify-end p-6" style={{ background: p, borderRadius: rx(Math.max(radii.lg, 12)) }}>
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 78% 20%, ${a}, transparent 55%)`, opacity: 0.6 }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(transparent 30%, rgba(0,0,0,0.35))' }} />
        <div className="relative">
          <span className="inline-block px-3 py-1 text-xs font-semibold mb-2.5" style={{ background: a, color: textOn(a), borderRadius: 999, ...B }}>Design</span>
          <h2 className="text-[26px] font-bold leading-tight max-w-lg" style={{ color: textOn(p), ...H }}>The Art of Color in User Interfaces</h2>
        </div>
      </div>

      <div className="grid gap-8 max-md:grid-cols-1" style={{ gridTemplateColumns: '1fr 280px' }}>
        {/* Article */}
        <div className="flex flex-col gap-5 min-w-0">
          <div className="flex items-center gap-2.5 text-sm flex-wrap" style={{ color: chrome.textMuted }}>
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: p, color: textOn(p) }}>AC</span>
            <span style={{ color: chrome.text, fontWeight: 500 }}>Alex Chen</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Calendar size={13} /> Mar 1, 2026</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock size={13} /> 8 min read</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Eye size={13} /> 2.4k</span>
          </div>

          <p className="text-[16px] leading-8" style={{ color: chrome.text }}>
            Color is one of the most powerful tools in a designer's toolkit. It influences mood, guides attention, and creates visual hierarchy — a well-chosen palette can elevate a product from functional to delightful.
          </p>

          <h3 className="text-xl font-bold mt-1" style={{ color: chrome.text, ...H }}>Understanding color harmony</h3>
          <p className="text-[16px] leading-8" style={{ color: chrome.textMuted }}>
            The foundation of any great palette starts with understanding how colors relate. Complementary, analogous, and triadic schemes each create a different emotional response.
          </p>

          <blockquote className="py-4 px-6 my-1" style={{ borderLeft: `3px solid ${a}`, background: `${a}12`, borderRadius: rx(radii.md) }}>
            <p className="text-[16px] italic leading-relaxed mb-1.5" style={{ color: chrome.text }}>"Design is not just what it looks like and feels like. Design is how it works."</p>
            <cite className="text-sm font-semibold not-italic" style={{ color: a }}>— Steve Jobs</cite>
          </blockquote>

          <h3 className="text-xl font-bold mt-1" style={{ color: chrome.text, ...H }}>Building a system</h3>
          <p className="text-[16px] leading-8" style={{ color: chrome.textMuted }}>
            A color system goes beyond picking pretty colors — it defines semantic meaning (primary actions, warnings, success states), creating a consistent language across the whole interface.
          </p>

          {/* Code block */}
          <div className="overflow-hidden my-1" style={{ border: `1px solid ${chrome.border}`, borderRadius: rx(radii.md) }}>
            <div className="flex items-center gap-2 px-4 py-2.5 text-xs" style={{ background: chrome.surfaceMuted, borderBottom: `1px solid ${chrome.border}`, color: chrome.textMuted }}>
              <Code2 size={14} /> <span style={B}>palette.css</span>
            </div>
            <div className="px-4 py-4 text-sm leading-6" style={{ background: chrome.surfaceMuted, fontFamily: 'monospace' }}>
              <div style={{ color: chrome.textMuted }}>:root {'{'}</div>
              {[['--primary', p], ['--secondary', s], ['--accent', a]].map(([name, hex]) => (
                <div key={name} className="flex items-center gap-2" style={{ paddingLeft: 16 }}>
                  <span style={{ color: hex }}>{name}</span><span style={{ color: chrome.textMuted }}>:</span>
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ background: hex }} />
                  <span style={{ color: chrome.text }}>{hex}</span><span style={{ color: chrome.textMuted }}>;</span>
                </div>
              ))}
              <div style={{ color: chrome.textMuted }}>{'}'}</div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-1">
            {tags.map((t) => (
              <span key={t.label} className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold" style={{ background: `${t.color}18`, color: t.color, borderRadius: 999, ...B }}><Hash size={11} /> {t.label}</span>
            ))}
          </div>

          {/* Share */}
          <div className="flex items-center gap-3 pt-4 mt-1" style={{ borderTop: `1px solid ${chrome.border}` }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: chrome.textMuted }}>Share</span>
            {[Twitter, Linkedin, Link2, Bookmark].map((Icon, i) => (
              <span key={i} className="w-8 h-8 flex items-center justify-center cursor-pointer" style={{ background: chrome.surfaceMuted, color: p, borderRadius: rx(radii.sm) }}><Icon size={15} /></span>
            ))}
            <span className="ml-auto flex items-center gap-1.5"><Heart size={15} style={{ color: colors.danger.hex }} /><span className="text-xs font-semibold" style={{ color: chrome.textMuted }}>247</span></span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5 max-md:hidden">
          <div className="p-5" style={card}>
            <div className="flex items-center gap-2 mb-3"><List size={16} style={{ color: p }} /><span className="font-bold text-sm" style={{ color: chrome.text, ...H }}>Contents</span></div>
            <div className="flex flex-col gap-1">
              {toc.map((item) => (
                <div key={item.label} className="relative flex items-center gap-2 px-2.5 py-1.5 text-xs cursor-pointer" style={{ color: item.active ? p : chrome.textMuted, background: item.active ? `${p}12` : 'transparent', borderRadius: rx(radii.sm), fontWeight: item.active ? 600 : 400, ...B }}>
                  {item.active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-[3px] rounded-full" style={{ background: p }} />}
                  <Hash size={10} className="shrink-0" /> {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 text-center" style={card}>
            <span className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3" style={{ background: p, color: textOn(p) }}>AC</span>
            <div className="font-bold text-sm" style={{ color: chrome.text, ...H }}>Alex Chen</div>
            <div className="text-xs mt-0.5 mb-2" style={{ color: chrome.textMuted }}>Senior Designer</div>
            <p className="text-xs leading-relaxed mb-3" style={{ color: chrome.textMuted }}>Writing about color theory and accessible design systems.</p>
            <span className="inline-block px-4 py-1.5 text-xs font-semibold cursor-pointer" style={{ background: p, color: textOn(p), borderRadius: rx(radii.md) }}>Follow</span>
          </div>

          <div className="p-5" style={{ background: `${p}12`, border: `1px solid ${p}22`, borderRadius: rx(radii.lg) }}>
            <div className="font-bold text-sm mb-1" style={{ color: p, ...H }}>Newsletter</div>
            <div className="text-xs mb-3" style={{ color: chrome.textMuted }}>Design tips, weekly.</div>
            <div className="relative mb-2">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: chrome.textMuted }} />
              <input readOnly placeholder="you@email.com" className="w-full pl-8 pr-3 py-2 text-xs outline-none" style={{ background: chrome.surface, border: `1px solid ${chrome.border}`, color: chrome.text, borderRadius: rx(radii.md), ...B }} />
            </div>
            <span className="block w-full text-center px-4 py-1.5 text-xs font-semibold cursor-pointer" style={{ background: p, color: textOn(p), borderRadius: rx(radii.md) }}>Subscribe</span>
          </div>

          <div className="p-5" style={card}>
            <div className="font-bold text-sm mb-3" style={{ color: chrome.text, ...H }}>Related posts</div>
            <div className="flex flex-col gap-3">
              {related.map((post) => (
                <div key={post.title} className="flex items-center gap-2 cursor-pointer group">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: post.color }} />
                  <span className="text-sm flex-1 group-hover:underline" style={{ color: chrome.text }}>{post.title}</span>
                  <span className="flex items-center gap-1 text-[10px] shrink-0" style={{ color: chrome.textMuted }}><Clock size={10} /> {post.readTime}</span>
                  <ChevronRight size={13} style={{ color: chrome.textMuted }} className="shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
