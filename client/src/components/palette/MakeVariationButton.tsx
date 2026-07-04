import { useEffect, useState } from 'react';
import { Shuffle, ChevronDown, Plus, X, Sparkles } from 'lucide-react';
import { suggestMoods } from '@/lib/api.ts';

interface MakeVariationButtonProps {
  keywords: string;
  loading: boolean;
  /** Generate a variation from the given prompt (parent handles the API + navigation). */
  onGenerate: (prompt: string) => void;
}

/**
 * Split button: the main part fires an instant variation from the original brief; the chevron
 * opens a panel where you can tweak the brief and add AI-suggested "moods" to steer the next
 * palette — the same guidance as the home-page prompt box, for iterating.
 */
export function MakeVariationButton({ keywords, loading, onGenerate }: MakeVariationButtonProps) {
  const [open, setOpen] = useState(false);
  const [brief, setBrief] = useState(keywords || '');
  const [moods, setMoods] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [moodsLoading, setMoodsLoading] = useState(false);

  // Reset the panel state when the underlying theme changes (navigation to a new palette).
  useEffect(() => {
    setBrief(keywords || '');
    setSelectedMoods([]);
  }, [keywords]);

  // Fetch moods only while the panel is open (debounced + abortable on brief edits).
  useEffect(() => {
    if (!open) return;
    const text = brief.trim();
    if (text.length < 4) { setMoods([]); setMoodsLoading(false); return; }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setMoodsLoading(true);
      try {
        setMoods(await suggestMoods(text, controller.signal));
      } catch {
        if (!controller.signal.aborted) setMoods([]);
      } finally {
        if (!controller.signal.aborted) setMoodsLoading(false);
      }
    }, 500);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [brief, open]);

  const suggestions = moods.filter(m => !selectedMoods.includes(m));

  const submitGuided = () => {
    const base = brief.trim();
    if (!base) return;
    const composed = selectedMoods.length ? `${base} — mood: ${selectedMoods.join(', ')}` : base;
    setOpen(false);
    onGenerate(composed);
  };

  const btn = 'border-2 border-[#8b5cf6] bg-transparent text-[#8b5cf6] font-medium text-sm cursor-pointer hover:bg-[#f3f0ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-[#8b5cf620]';

  return (
    <div className="relative inline-flex">
      {loading ? (
        <span className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg ${btn}`}>
          <Shuffle size={18} className="animate-spin" /> Generating…
        </span>
      ) : (
        <div className="inline-flex">
          <button
            onClick={() => onGenerate(keywords || '')}
            className={`inline-flex items-center gap-2 pl-4 pr-3 py-2.5 rounded-l-lg border-r-0 ${btn}`}
            title="Instant variation from the original brief"
          >
            <Shuffle size={18} /> Make Variation
          </button>
          <button
            onClick={() => setOpen(o => !o)}
            className={`inline-flex items-center px-2 py-2.5 rounded-r-lg ${btn}`}
            title="Steer with a brief and moods"
            aria-label="Steer the variation"
          >
            <ChevronDown size={16} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
        </div>
      )}

      {open && !loading && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-[#e5e7eb] dark:border-[#333] bg-white dark:bg-[#1a1a1a] shadow-xl p-4 z-50">
            <div className="text-sm font-semibold text-[#1B1A18] dark:text-[#ECEAE7] mb-1">Steer the variation</div>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mb-3">Tweak the brief or add a mood to guide the next palette.</p>
            <textarea
              value={brief}
              onChange={e => setBrief(e.target.value)}
              rows={2}
              placeholder="Describe the vibe…"
              className="w-full text-sm rounded-lg border border-[#DADADA] dark:border-white/15 bg-white dark:bg-white/5 p-2.5 outline-none resize-y focus:border-[#8b5cf6] text-[#1B1A18] dark:text-[#ECEAE7] placeholder:text-[#85807A]"
            />

            {(selectedMoods.length > 0 || suggestions.length > 0 || moodsLoading) && (
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold mr-0.5 text-[#6b7280] dark:text-[#9ca3af]">
                  <Sparkles size={12} className="text-[#8b5cf6]" /> Moods
                </span>
                {selectedMoods.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMoods(prev => prev.filter(x => x !== m))}
                    className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-[#8b5cf6] text-white hover:bg-[#7c3aed] transition-colors"
                  >
                    {m} <X size={12} />
                  </button>
                ))}
                {suggestions.length > 0
                  ? suggestions.map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMoods(prev => [...prev, m])}
                        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border border-[#e6ddf9] dark:border-white/15 text-[#7c3aed] dark:text-[#c4b5fd] bg-[#8b5cf6]/[0.06] hover:bg-[#8b5cf6]/[0.14] transition-colors"
                      >
                        <Plus size={11} /> {m}
                      </button>
                    ))
                  : moodsLoading
                    ? [56, 44, 64].map((w, i) => (
                        <span key={i} className="h-[26px] rounded-full bg-black/[0.06] dark:bg-white/10 animate-pulse" style={{ width: w }} />
                      ))
                    : null}
              </div>
            )}

            <button
              onClick={submitGuided}
              disabled={!brief.trim()}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#8b5cf6] text-white font-semibold text-sm hover:bg-[#7c3aed] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Shuffle size={16} /> Generate variation
            </button>
          </div>
        </>
      )}
    </div>
  );
}
