import { textOn, hslToHex } from '@/lib/color-utils.ts';
import type { PaletteColors } from '@/lib/palette-utils.ts';
import { useDemoSettings } from '@/hooks/use-demo-settings.tsx';
import {
  Sparkles, ArrowRight, Search, Twitter, Linkedin, Link2, Bookmark, Heart,
  Clock, Calendar, Eye, Code2, Hash, List, ChevronRight, Mail, Quote,
} from 'lucide-react';

interface DemoBlogProps {
  colors: PaletteColors;
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export function DemoBlog({ colors }: DemoBlogProps) {
  const { headingFont, bodyFont, chrome, radii } = useDemoSettings();
  const P = colors.primary, S = colors.secondary, A = colors.accent;
  const p = P.hex, s = S.hex, a = A.hex;
  const H = { fontFamily: `'${headingFont}', sans-serif` };
  const B = { fontFamily: `'${bodyFont}', sans-serif` };
  const rx = (n: number) => `${n}px`;
  const tone = (c: { h: number; s: number }, l: number, sAdj = 0) => hslToHex(c.h, clamp(c.s + sAdj), clamp(l));
  const card = { background: chrome.surface, border: `1px solid ${chrome.border}`, borderRadius: rx(radii.lg) };

  // Soft, grounded mesh — blurred blooms over a deep primary base. Reads as designed cover art.
  const mesh = `radial-gradient(at 16% 22%, ${tone(P, clamp(P.l + 8))} 0px, transparent 52%), radial-gradient(at 84% 14%, ${tone(A, clamp(A.l + 4), -6)} 0px, transparent 46%), radial-gradient(at 80% 84%, ${tone(S, S.l, -6)} 0px, transparent 46%), radial-gradient(at 22% 82%, ${tone(P, 30)} 0px, transparent 52%), ${tone(P, 18, -2)}`;

  const tags = [{ label: 'Design', color: p }, { label: 'Color Theory', color: s }, { label: 'UI/UX', color: a }, { label: 'Tutorial', color: colors.info.hex }];
  const toc = [{ label: 'Why color leads', active: true }, { label: 'Building harmony', active: false }, { label: 'A working system', active: false }, { label: 'Implementation', active: false }];
  const related = [{ title: 'Typography that breathes', color: p, readTime: '5 min' }, { title: 'Designing for contrast', color: s, readTime: '7 min' }, { title: 'Motion, used sparingly', color: a, readTime: '6 min' }];

  return (
    <div style={{ background: chrome.background, color: chrome.text, borderRadius: rx(Math.max(radii.lg, 12)), overflow: 'hidden', border: `1px solid ${chrome.border}`, ...B }}>
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-4 sticky top-0 z-30 backdrop-blur" style={{ background: `${chrome.surface}cc`, borderBottom: `1px solid ${chrome.border}` }}>
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 flex items-center justify-center" style={{ background: p, color: textOn(p), borderRadius: rx(radii.md) }}><Sparkles size={16} /></span>
          <span className="font-bold text-[16px]" style={H}>Chroma Journal</span>
        </div>
        <nav className="flex items-center gap-7 text-sm max-md:hidden" style={{ color: chrome.textMuted }}>
          <span>Articles</span><span>Topics</span><span>Guides</span><span>About</span>
        </nav>
        <div className="flex items-center gap-3">
          <Search size={17} style={{ color: chrome.textMuted }} className="max-md:hidden" />
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2" style={{ background: p, color: textOn(p), borderRadius: rx(radii.md) }}>Subscribe</span>
        </div>
      </header>

      {/* Reading progress */}
      <div className="sticky z-20" style={{ top: 57, height: 3, background: chrome.surfaceMuted }}>
        <div className="h-full" style={{ width: '62%', background: p }} />
      </div>

      <article className="px-8 pt-10 pb-4 mx-auto" style={{ maxWidth: 940 }}>
        {/* Editorial header */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block px-3 py-1 text-xs font-semibold" style={{ background: `${a}18`, color: a, borderRadius: 999, ...B }}>Design</span>
            <span className="text-xs" style={{ color: chrome.textMuted }}>Featured</span>
          </div>
          <h1 className="font-bold leading-[1.08] tracking-[-0.02em]" style={{ fontSize: 40, color: chrome.text, ...H }}>
            The quiet art of color in user interfaces
          </h1>
          <p className="text-[18px] leading-relaxed mt-4" style={{ color: chrome.textMuted }}>
            A considered palette does more than decorate — it guides attention, sets a mood, and makes a product feel inevitable. Here's how to build one that lasts.
          </p>
          <div className="flex items-center gap-3 mt-6 text-sm flex-wrap" style={{ color: chrome.textMuted }}>
            <span className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: p, color: textOn(p) }}>AC</span>
            <span style={{ color: chrome.text, fontWeight: 600 }}>Alex Chen</span>
            <span className="w-1 h-1 rounded-full" style={{ background: chrome.border }} />
            <span className="flex items-center gap-1"><Calendar size={13} /> Jul 3, 2026</span>
            <span className="w-1 h-1 rounded-full" style={{ background: chrome.border }} />
            <span className="flex items-center gap-1"><Clock size={13} /> 8 min</span>
            <span className="w-1 h-1 rounded-full" style={{ background: chrome.border }} />
            <span className="flex items-center gap-1"><Eye size={13} /> 2.4k</span>
          </div>
        </div>

        {/* Cover art (mesh) */}
        <div className="relative w-full mt-8 mb-10 overflow-hidden" style={{ height: 320, background: mesh, borderRadius: rx(Math.max(radii.lg, 14)) }}>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 32% 30%, rgba(255,255,255,0.14), transparent 42%)' }} />
          <div className="absolute rounded-full pointer-events-none" style={{ width: 220, height: 220, top: -60, right: 60, border: '1.5px solid rgba(255,255,255,0.18)' }} />
          <div className="absolute rounded-full pointer-events-none" style={{ width: 120, height: 120, bottom: 30, right: 140, border: '1.5px solid rgba(255,255,255,0.14)' }} />
          <div className="absolute left-5 bottom-5 flex items-center gap-2 px-3.5 py-2 backdrop-blur" style={{ background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 999 }}>
            <span className="w-2 h-2 rounded-full" style={{ background: '#fff' }} />
            <span className="text-xs font-semibold" style={{ color: '#fff', ...B }}>Cover · Palette study #12</span>
          </div>
        </div>

        {/* Body + sidebar */}
        <div className="grid gap-10 max-md:grid-cols-1" style={{ gridTemplateColumns: '1fr 288px' }}>
          <div className="flex flex-col gap-5 min-w-0">
            <p className="text-[17px] leading-8" style={{ color: chrome.text }}>
              <span className="float-left mr-3 font-bold" style={{ fontSize: 58, lineHeight: '46px', color: p, ...H }}>C</span>
              olor is one of the most powerful tools in a designer's kit. It influences mood, directs the eye, and builds hierarchy long before a single word is read — and yet it's the thing teams reach for last, and least deliberately.
            </p>

            <h2 className="text-2xl font-bold mt-2 tracking-[-0.01em]" style={{ color: chrome.text, ...H }}>Why color leads</h2>
            <p className="text-[17px] leading-8" style={{ color: chrome.textMuted }}>
              Before anyone parses your layout, they've already felt your palette. Warmth or cool, calm or urgent, premium or playful — those judgments land in milliseconds, and they colour everything that follows.
            </p>

            <blockquote className="relative py-5 pl-14 pr-6 my-2" style={{ background: `${a}0e`, borderRadius: rx(radii.lg) }}>
              <Quote size={26} className="absolute left-5 top-5" style={{ color: a }} fill="currentColor" />
              <p className="text-[19px] italic leading-relaxed font-medium" style={{ color: chrome.text, ...H }}>Design is not just what it looks like and feels like. Design is how it works.</p>
              <cite className="text-sm font-semibold not-italic mt-2 block" style={{ color: a }}>— Steve Jobs</cite>
            </blockquote>

            <h2 className="text-2xl font-bold mt-2 tracking-[-0.01em]" style={{ color: chrome.text, ...H }}>A working system</h2>
            <p className="text-[17px] leading-8" style={{ color: chrome.textMuted }}>
              A palette becomes a system the moment it carries meaning: a primary for intent, semantics for success and danger, and a neutral ramp that quietly holds it all together. Encode those roles once and every screen inherits them.
            </p>

            {/* Inline callout */}
            <div className="flex gap-3 p-4 my-1" style={{ background: `${p}0e`, border: `1px solid ${p}22`, borderRadius: rx(radii.lg) }}>
              <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: p, color: textOn(p) }}><Sparkles size={16} /></span>
              <div>
                <div className="font-bold text-sm mb-0.5" style={{ color: chrome.text, ...H }}>Rule of thumb</div>
                <div className="text-sm leading-relaxed" style={{ color: chrome.textMuted }}>One dominant hue, one accent for moments that matter, and semantics reserved for state. Everything else is neutral.</div>
              </div>
            </div>

            {/* Code block */}
            <div className="overflow-hidden my-1" style={{ border: `1px solid ${chrome.border}`, borderRadius: rx(radii.md) }}>
              <div className="flex items-center gap-2 px-4 py-2.5 text-xs" style={{ background: chrome.surfaceMuted, borderBottom: `1px solid ${chrome.border}`, color: chrome.textMuted }}>
                <Code2 size={14} /> <span style={B}>tokens.css</span>
              </div>
              <div className="px-4 py-4 text-[13px] leading-6" style={{ background: chrome.surfaceMuted, fontFamily: 'monospace' }}>
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
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((t) => (
                <span key={t.label} className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold" style={{ background: `${t.color}16`, color: t.color, borderRadius: 999, ...B }}><Hash size={11} /> {t.label}</span>
              ))}
            </div>

            {/* Share */}
            <div className="flex items-center gap-3 pt-5 mt-1" style={{ borderTop: `1px solid ${chrome.border}` }}>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: chrome.textMuted }}>Share</span>
              {[Twitter, Linkedin, Link2, Bookmark].map((Icon, i) => (
                <span key={i} className="w-9 h-9 flex items-center justify-center cursor-pointer" style={{ background: chrome.surfaceMuted, color: p, borderRadius: rx(radii.md) }}><Icon size={15} /></span>
              ))}
              <span className="ml-auto flex items-center gap-1.5"><Heart size={16} style={{ color: colors.danger.hex }} fill="currentColor" /><span className="text-sm font-semibold" style={{ color: chrome.textMuted }}>247</span></span>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-5 max-md:hidden self-start sticky top-24">
            <div className="p-5" style={card}>
              <div className="flex items-center gap-2 mb-3"><List size={16} style={{ color: p }} /><span className="font-bold text-sm" style={{ color: chrome.text, ...H }}>On this page</span></div>
              <div className="flex flex-col gap-0.5">
                {toc.map((item) => (
                  <div key={item.label} className="relative flex items-center gap-2 px-2.5 py-1.5 text-[13px] cursor-pointer" style={{ color: item.active ? p : chrome.textMuted, background: item.active ? `${p}12` : 'transparent', borderRadius: rx(radii.sm), fontWeight: item.active ? 600 : 400, ...B }}>
                    {item.active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-[3px] rounded-full" style={{ background: p }} />}
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5" style={{ background: `${p}0e`, border: `1px solid ${p}22`, borderRadius: rx(radii.lg) }}>
              <div className="font-bold text-sm mb-1" style={{ color: chrome.text, ...H }}>The weekly palette</div>
              <div className="text-xs mb-3 leading-relaxed" style={{ color: chrome.textMuted }}>Color, type & systems — one email, every Friday.</div>
              <div className="relative mb-2">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: chrome.textMuted }} />
                <input readOnly placeholder="you@studio.com" className="w-full pl-8 pr-3 py-2 text-xs outline-none" style={{ background: chrome.surface, border: `1px solid ${chrome.border}`, color: chrome.text, borderRadius: rx(radii.md), ...B }} />
              </div>
              <span className="block w-full text-center px-4 py-2 text-xs font-semibold cursor-pointer" style={{ background: p, color: textOn(p), borderRadius: rx(radii.md) }}>Subscribe</span>
            </div>

            <div className="p-5" style={card}>
              <div className="font-bold text-sm mb-3" style={{ color: chrome.text, ...H }}>Keep reading</div>
              <div className="flex flex-col gap-3.5">
                {related.map((post) => (
                  <div key={post.title} className="flex items-center gap-2.5 cursor-pointer group">
                    <span className="w-8 h-8 rounded-lg shrink-0" style={{ background: `linear-gradient(135deg, ${post.color}, ${post.color}66)` }} />
                    <span className="text-[13px] font-medium flex-1 leading-tight group-hover:underline" style={{ color: chrome.text }}>{post.title}</span>
                    <ChevronRight size={14} style={{ color: chrome.textMuted }} className="shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </article>

      {/* Subscribe CTA band */}
      <section className="relative overflow-hidden px-8 py-12 mt-6 text-center" style={{ background: p, color: textOn(p) }}>
        <div className="absolute -top-16 right-16 w-56 h-56 rounded-full" style={{ background: '#fff', opacity: 0.08, filter: 'blur(60px)' }} />
        <h2 className="font-bold text-[26px] tracking-[-0.02em] relative" style={H}>Never miss an issue</h2>
        <p className="text-sm opacity-90 mt-2 mb-6 relative" style={B}>Join 14,000 designers reading Chroma Journal.</p>
        <div className="flex gap-2 justify-center relative max-w-sm mx-auto">
          <input readOnly placeholder="you@studio.com" className="flex-1 px-4 py-2.5 text-sm outline-none" style={{ background: 'rgba(255,255,255,0.16)', border: `1px solid ${textOn(p)}44`, color: textOn(p), borderRadius: rx(radii.md), ...B }} />
          <span className="inline-flex items-center gap-1.5 px-5 py-2.5 font-semibold text-sm whitespace-nowrap" style={{ background: a, color: textOn(a), borderRadius: rx(radii.md) }}>Subscribe <ArrowRight size={15} /></span>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex items-center justify-between px-8 py-6 text-xs flex-wrap gap-3" style={{ background: chrome.surface, borderTop: `1px solid ${chrome.border}`, color: chrome.textMuted }}>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 flex items-center justify-center" style={{ background: p, color: textOn(p), borderRadius: rx(radii.sm) }}><Sparkles size={12} /></span>
          <span className="font-bold" style={{ color: chrome.text, ...H }}>Chroma Journal</span>
        </div>
        <span>© 2026 Chroma Journal — a UI Chroma publication.</span>
        <div className="flex gap-2">
          {[Twitter, Linkedin, Link2].map((Icon, i) => (
            <span key={i} className="w-8 h-8 flex items-center justify-center" style={{ background: chrome.surfaceMuted, borderRadius: rx(radii.sm) }}><Icon size={13} /></span>
          ))}
        </div>
      </footer>
    </div>
  );
}
