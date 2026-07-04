import { useState, useRef, useEffect, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe, Sparkles, ArrowRight, Wand2, Palette, Layers, ShieldCheck,
  FileJson, Plug2, FileCode2, Check, MessageSquare, Plus, X,
} from 'lucide-react';
import { BackgroundEllipses } from '@/components/layout/BackgroundEllipses.tsx';
import { GlassCard } from '@/components/layout/GlassCard.tsx';
import { TopBar } from '@/components/layout/TopBar.tsx';
import { generatePalette, suggestMoods } from '@/lib/api.ts';
import { useAuth } from '@/hooks/use-auth.tsx';

const CHIPS = [
  { label: 'Trustworthy fintech', prompt: 'A fintech app that feels trustworthy and modern, with a bold accent for CTAs' },
  { label: 'Zen tea house', prompt: 'A serene zen tea house — soft sage greens, warm beige, calm and minimal' },
  { label: 'Cyberpunk arcade', prompt: 'A neon cyberpunk arcade at night — electric magenta, cyan and deep indigo' },
  { label: 'Organic skincare', prompt: 'A warm, organic skincare brand — earthy, natural and premium' },
];

const VALUE = [
  { Icon: Palette, title: 'Semantic, scored palette', desc: 'Eight roles — primary, accent, semantics — generated, then critiqued and repaired until it scores. Not random swatches.', color: '#008CF4' },
  { Icon: Layers, title: 'A full theme, not just color', desc: 'Type scale, spacing, radii, shadows and light + dark modes — the whole system that actually de-generic-ifies a UI.', color: '#8b5cf6' },
  { Icon: ShieldCheck, title: 'Accessible by construction', desc: 'WCAG AA/AAA contrast is a generation constraint, checked on every pair — not an afterthought you audit later.', color: '#16a34a' },
  { Icon: FileJson, title: 'Portable design tokens', desc: 'Export DTCG / Style Dictionary, CSS variables, SCSS, Tailwind config and JSON — with 10-step tonal ramps.', color: '#ea580c' },
  { Icon: Plug2, title: 'Delivered over MCP', desc: 'Point Claude Code, Cursor or any MCP client at your brand and pull the live token system at generation time.', color: '#0891b2' },
  { Icon: FileCode2, title: 'AGENTS.md & Figma', desc: 'Generate an AGENTS.md constraint pack for your repo, plus a Figma plugin that builds styles and components.', color: '#db2777' },
];

const STEPS = [
  { Icon: MessageSquare, title: 'Describe your brand', desc: 'One sentence — a mood, an industry, a feeling. That’s the whole input.' },
  { Icon: Wand2, title: 'Get a validated system', desc: 'A scored, accessible, semantic token system with palette, type, spacing and modes.' },
  { Icon: Plug2, title: 'Feed it to your AI tools', desc: 'Via MCP or a token export, so every screen your agent builds looks like yours.' },
];

const EXAMPLES = [
  { label: 'Zen tea house', prompt: 'A serene zen tea house — soft sage greens, warm beige, calm and minimal', swatches: ['#3C4A40', '#8AA083', '#C9B79C', '#B07D56', '#E8E2D5'] },
  { label: 'Cyberpunk arcade', prompt: 'A neon cyberpunk arcade at night — electric magenta, cyan and deep indigo', swatches: ['#0B0F2A', '#FF2E97', '#00E5FF', '#8A5CFF', '#F5D90A'] },
  { label: 'Trustworthy fintech', prompt: 'A fintech app that feels trustworthy and modern, with a bold accent for CTAs', swatches: ['#0A2540', '#1B6EF3', '#00C08B', '#F5A623', '#E8EDF5'] },
];

// Sparkle positions spread around the input's perimeter; the delay (∝ position) makes the
// twinkles chase around the box like a wave.
const SPARKLES = Array.from({ length: 20 }, (_, i) => {
  const t = i / 20;
  let left = 0;
  let top = 0;
  if (t < 0.25) { left = (t / 0.25) * 100; top = 0; }
  else if (t < 0.5) { left = 100; top = ((t - 0.25) / 0.25) * 100; }
  else if (t < 0.75) { left = 100 - ((t - 0.5) / 0.25) * 100; top = 100; }
  else { left = 0; top = 100 - ((t - 0.75) / 0.25) * 100; }
  return {
    left: `${left}%`,
    top: `${top}%`,
    size: `${5 + (i % 3) * 2}px`,
    delay: `${(t * 1.8).toFixed(2)}s`,
  };
});

const TOOLS = [
  { name: 'v0', file: 'v0' },
  { name: 'Cursor', file: 'cursor' },
  { name: 'Claude Code', file: 'claude' },
  { name: 'Figma Make', file: 'figma' },
  { name: 'Replit', file: 'replit' },
  { name: 'Windsurf', file: 'windsurf' },
];

export function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [moods, setMoods] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [moodsLoading, setMoodsLoading] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Suggest color "moods" from the in-progress description (debounced + abortable).
  useEffect(() => {
    const text = prompt.trim();
    if (text.length < 4) { setMoods([]); setMoodsLoading(false); return; }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setMoodsLoading(true);
      try {
        const result = await suggestMoods(text, controller.signal);
        setMoods(result);
      } catch {
        if (!controller.signal.aborted) setMoods([]);
      } finally {
        if (!controller.signal.aborted) setMoodsLoading(false);
      }
    }, 700);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [prompt]);

  // The prompt actually sent = description + any chosen moods (richer brief → better palette).
  const composePrompt = () => {
    const base = prompt.trim();
    return selectedMoods.length ? `${base} — mood: ${selectedMoods.join(', ')}` : base;
  };
  const addMood = (m: string) => setSelectedMoods(prev => (prev.includes(m) ? prev : [...prev, m]));
  const removeMood = (m: string) => setSelectedMoods(prev => prev.filter(x => x !== m));

  const generate = async (text: string) => {
    const value = text.trim();
    if (!value || loading) return;
    setLoading(true);
    try {
      const data = await generatePalette(value, session?.access_token);
      if (!data.permalink) {
        alert('Failed to generate palette. Please try again.');
        return;
      }
      navigate(`/palette/${data.slug || data.permalink}`);
    } catch (err) {
      console.error(err);
      alert('Error generating palette. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillPrompt = (text: string) => {
    setPrompt(text);
    setSelectedMoods([]);
    textareaRef.current?.focus();
    textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const ink = 'text-[#1B1A18] dark:text-[#ECEAE7]';
  const muted = 'text-[#6b7280] dark:text-[#9ca3af]';
  const suggestions = moods.filter(m => !selectedMoods.includes(m));
  const showTray = prompt.trim().length >= 3 && (selectedMoods.length > 0 || suggestions.length > 0 || moodsLoading);

  return (
    <div className="landing-bg min-h-screen flex items-start justify-center p-10 max-md:p-4 overflow-auto">
      <BackgroundEllipses />
      <GlassCard>
        <TopBar />

        {/* Hero */}
        <section className="px-8 md:px-16 pt-12 pb-14 max-md:pt-8 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 border border-[#008CF4]/25 text-[#0072C6] bg-[#008CF4]/[0.07] dark:text-[#5cb8ff] dark:bg-[#008CF4]/10">
            <Sparkles size={13} /> The brand layer for vibe coding
          </span>
          <h1 className={`font-heading font-bold text-[52px] leading-[1.06] tracking-[-0.02em] max-w-[900px] max-md:text-[32px] ${ink}`}>
            Make AI build <span className="text-[#008CF4]">your</span> UI —
            <br className="max-md:hidden" /> not everyone else’s.
          </h1>
          <p className={`text-[18px] leading-relaxed mt-6 max-w-[620px] max-md:text-base ${muted}`}>
            v0, Lovable and Cursor all ship the same shadcn-blue look. Describe your brand once and UI Chroma
            generates a complete, accessible, AI-ready design-token system your tools actually follow.
          </p>

          {/* Prompt box — the core action */}
          <div className="w-full max-w-[680px] mt-9">
            <div className="prompt-fx">
              <div className="prompt-fx__aura" aria-hidden="true" />
              <div className="prompt-fx__beam" aria-hidden="true" />
              <div className="prompt-fx__sparkles" aria-hidden="true">
                {SPARKLES.map((sp, i) => (
                  <span key={i} style={{ left: sp.left, top: sp.top, animationDelay: sp.delay, '--s': sp.size } as unknown as CSSProperties} />
                ))}
              </div>
              <div className="relative z-[2] flex flex-col border border-[#DADADA] dark:border-white/15 rounded-2xl bg-white dark:bg-white/5 p-4 shadow-[0_10px_40px_-16px_rgba(0,0,0,0.25)] transition-colors focus-within:border-[#008CF4] text-left">
              <div className="flex flex-row items-start gap-3">
                <Globe className="shrink-0 mt-1.5 text-[#7A7A7A]" size={22} />
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate(composePrompt()); }}
                  rows={2}
                  placeholder="e.g. A fintech app that feels trustworthy and modern, with a bold accent for CTAs…"
                  className={`flex-1 border-none outline-none text-[17px] leading-7 resize-y min-h-14 bg-transparent placeholder:text-[#85807A] font-sans ${ink}`}
                />
              </div>

              {/* Mood tray — AI-suggested, tap to add to the brief */}
              {showTray && (
                <div className="flex flex-wrap items-center gap-1.5 mt-3.5 pt-3 border-t border-[#EEEBE6] dark:border-white/10">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold mr-0.5 ${muted}`}>
                    <Sparkles size={12} className="text-[#008CF4]" /> Moods
                  </span>
                  {selectedMoods.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => removeMood(m)}
                      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-[#008CF4] text-white hover:bg-[#0072C6] transition-colors"
                    >
                      {m} <X size={12} />
                    </button>
                  ))}
                  {suggestions.length > 0
                    ? suggestions.map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => addMood(m)}
                          className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border border-[#D8E8F7] dark:border-white/15 text-[#0072C6] dark:text-[#5cb8ff] bg-[#008CF4]/[0.06] hover:bg-[#008CF4]/[0.14] transition-colors"
                        >
                          <Plus size={11} /> {m}
                        </button>
                      ))
                    : moodsLoading
                      ? [64, 52, 72, 58].map((w, i) => (
                          <span key={i} className="h-[26px] rounded-full bg-black/[0.06] dark:bg-white/10 animate-pulse" style={{ width: w }} />
                        ))
                      : null}
                </div>
              )}
              </div>
            </div>
            <button
              onClick={() => generate(composePrompt())}
              disabled={loading}
              className="flex items-center justify-center gap-2.5 w-full px-8 py-4 mt-3.5 border-none rounded-2xl bg-[#008CF4] text-white font-semibold text-[17px] cursor-pointer transition-colors hover:bg-[#0072C6] disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_10px_28px_-10px_rgba(0,140,244,0.8)]"
            >
              <Sparkles size={20} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Generating your theme…' : 'Generate my theme'}
            </button>

            {/* Quick-start chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
              <span className={`text-xs ${muted}`}>Try:</span>
              {CHIPS.map(c => (
                <button
                  key={c.label}
                  onClick={() => fillPrompt(c.prompt)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border border-[#E6E3DF] dark:border-white/10 bg-white/70 dark:bg-white/5 hover:border-[#008CF4] hover:text-[#0072C6] transition-colors ${ink}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className={`flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 mt-8 text-[13px] ${muted}`}>
            {['No signup to try', 'WCAG-checked', 'Exports CSS · Tailwind · DTCG', 'MCP-ready'].map(t => (
              <span key={t} className="inline-flex items-center gap-1.5"><Check size={14} className="text-[#16a34a]" /> {t}</span>
            ))}
          </div>
        </section>

        {/* Tools strip */}
        <div className="px-8 md:px-16 py-7 border-y border-[#EAE7E3] dark:border-white/[0.08]">
          <p className={`text-[11px] uppercase tracking-[0.16em] text-center mb-5 font-semibold ${muted}`}>Feeds the tools you already build in</p>
          <div className={`flex items-center justify-center gap-x-11 gap-y-5 flex-wrap ${ink}`}>
            {TOOLS.map(t => (
              <span
                key={t.name}
                role="img"
                title={t.name}
                aria-label={t.name}
                className="w-8 h-8 opacity-40 hover:opacity-70 transition-opacity"
                style={{
                  backgroundColor: 'currentColor',
                  WebkitMaskImage: `url(/img/logos/${t.file}.svg)`,
                  maskImage: `url(/img/logos/${t.file}.svg)`,
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                }}
              />
            ))}
          </div>
        </div>

        {/* What you get */}
        <section className="px-8 md:px-16 py-16">
          <div className="max-w-[720px] mb-11">
            <h2 className={`font-heading font-bold text-[34px] tracking-[-0.02em] max-md:text-[26px] ${ink}`}>One sentence in. A whole design system out.</h2>
            <p className={`text-base mt-3 ${muted}`}>The same self-correcting engine that made great palettes, repackaged as the constraint layer AI codegen is starving for.</p>
          </div>
          <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
            {VALUE.map(v => (
              <div key={v.title} className="p-6 rounded-2xl border border-[#EAE7E3] dark:border-white/10 bg-white/80 dark:bg-white/5 transition-transform hover:-translate-y-1">
                <span className="w-12 h-12 flex items-center justify-center rounded-xl mb-4" style={{ background: `${v.color}18`, color: v.color }}>
                  <v.Icon size={22} />
                </span>
                <div className={`font-heading font-bold text-[17px] mb-1.5 ${ink}`}>{v.title}</div>
                <div className={`text-sm leading-relaxed ${muted}`}>{v.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="px-8 md:px-16 py-16 bg-[#F7F6F4] dark:bg-white/[0.03] border-y border-[#EAE7E3] dark:border-white/[0.08]">
          <h2 className={`font-heading font-bold text-[34px] tracking-[-0.02em] text-center max-md:text-[26px] ${ink}`}>How it works</h2>
          <div className="grid grid-cols-3 gap-6 mt-11 max-md:grid-cols-1 max-w-[980px] mx-auto">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative flex flex-col items-center text-center">
                <span className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-white/10 border border-[#EAE7E3] dark:border-white/10 text-[#008CF4] mb-4 shadow-sm"><s.Icon size={24} /></span>
                <div className={`text-xs font-bold tracking-wider mb-1 text-[#008CF4]`}>STEP {i + 1}</div>
                <div className={`font-heading font-bold text-lg mb-1.5 ${ink}`}>{s.title}</div>
                <div className={`text-sm leading-relaxed max-w-[260px] ${muted}`}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Showcase */}
        <section className="px-8 md:px-16 py-16">
          <div className="flex items-end justify-between mb-9 gap-4 flex-wrap">
            <div>
              <h2 className={`font-heading font-bold text-[34px] tracking-[-0.02em] max-md:text-[26px] ${ink}`}>A palette that connects to the brief.</h2>
              <p className={`text-base mt-3 max-w-[540px] ${muted}`}>A zen tea house and a cyberpunk arcade should share nothing. Pick one to generate it live.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
            {EXAMPLES.map(ex => (
              <button
                key={ex.label}
                onClick={() => generate(ex.prompt)}
                disabled={loading}
                className="group text-left rounded-2xl border border-[#EAE7E3] dark:border-white/10 bg-white/80 dark:bg-white/5 overflow-hidden transition-transform hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="flex h-28">
                  {ex.swatches.map((c, i) => <div key={i} className="flex-1" style={{ background: c }} />)}
                </div>
                <div className="flex items-center justify-between p-4">
                  <span className={`font-heading font-semibold ${ink}`}>{ex.label}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#008CF4] opacity-0 group-hover:opacity-100 transition-opacity">
                    Generate <ArrowRight size={15} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden px-8 md:px-16 py-16 text-center bg-[#008CF4] text-white">
          <div className="absolute -top-16 right-16 w-64 h-64 rounded-full pointer-events-none" style={{ background: '#fff', opacity: 0.1, filter: 'blur(70px)' }} />
          <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full pointer-events-none" style={{ background: '#8b5cf6', opacity: 0.25, filter: 'blur(80px)' }} />
          <h2 className="relative font-heading font-bold text-[34px] tracking-[-0.02em] max-md:text-[26px]">Stop shipping the default.</h2>
          <p className="relative text-white/90 mt-3 mb-8 text-lg max-md:text-base">Give your AI a brand — and get a UI that’s unmistakably yours.</p>
          <button
            onClick={() => fillPrompt(prompt || CHIPS[0].prompt)}
            className="relative inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white text-[#0072C6] font-semibold text-[16px] cursor-pointer hover:bg-[#f0f7ff] transition-colors shadow-lg"
          >
            <Wand2 size={18} /> Start with a sentence
          </button>
          <div className="relative text-white/75 text-[13px] mt-4">Free to try — no account needed.</div>
        </section>

        {/* Footer */}
        <footer className="px-8 md:px-16 py-8 flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-transparent">
          <div className="flex items-center gap-2.5">
            <img src="/img/logo.svg" alt="UI Chroma" className="h-6 dark:invert" />
          </div>
          <div className={`flex items-center gap-6 text-sm ${muted}`}>
            <span>MCP</span><span>Tokens</span><span>Figma plugin</span><span>Docs</span>
          </div>
          <span className={`text-[13px] ${muted}`}>© 2026 UI Chroma</span>
        </footer>
      </GlassCard>
    </div>
  );
}
