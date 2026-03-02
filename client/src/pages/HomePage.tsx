import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Sparkles } from 'lucide-react';
import { BackgroundEllipses } from '@/components/layout/BackgroundEllipses.tsx';
import { GlassCard } from '@/components/layout/GlassCard.tsx';
import { TopBar } from '@/components/layout/TopBar.tsx';
import { generatePalette } from '@/lib/api.ts';

export function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    const text = prompt.trim();
    if (!text) return;
    setLoading(true);
    try {
      const data = await generatePalette(text);
      if (!data.permalink) {
        alert('Failed to generate palette. Please try again.');
        return;
      }
      navigate(`/palette/${data.permalink}`);
    } catch (err) {
      console.error(err);
      alert('Error generating palette. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-bg min-h-screen flex items-center justify-center p-10 max-md:p-4">
      <BackgroundEllipses />
      <GlassCard className="min-h-[calc(100vh-80px)] max-md:min-h-[calc(100vh-32px)]">
        <TopBar />
        <div className="flex flex-col items-center max-w-[640px] w-full mx-auto px-6 py-20 flex-grow justify-center max-md:py-10">
          <h1 className="font-heading font-bold text-5xl leading-[56px] text-center text-[#1B1A18] mb-6 mt-0 max-md:text-[32px] max-md:leading-10">
            Generate Inspiring Colors for Your Next Design
          </h1>
          <div className="text-center mb-10">
            <p className="text-base leading-6 text-[#1B1A18] mb-2">
              Describe your project, brand, or mood — our AI will craft a complete color system tailored to your vision.
            </p>
            <p className="text-base leading-6 text-[#1B1A18]">
              Get a palette with primary, secondary, accent, and semantic colors, all harmonized and ready to use.
            </p>
          </div>
          <div className="flex flex-col w-full">
            <label className="font-medium text-sm tracking-wide text-[#0072C6] mb-2">
              Describe your project or the vibe you're going for
            </label>
            <div className="flex flex-row items-start gap-3 border border-[#DADADA] rounded-lg bg-white p-4 transition-colors focus-within:border-[#008CF4] focus-within:outline-2 focus-within:outline-[#008CF4] focus-within:-outline-offset-1">
              <Globe className="shrink-0 mt-1 text-[#7A7A7A]" size={24} />
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={2}
                placeholder="e.g. A fintech app that feels trustworthy and modern, with a bold accent for CTAs..."
                className="flex-1 border-none outline-none text-lg leading-7 text-[#1B1A18] resize-y min-h-14 bg-transparent placeholder:text-[#85807A] font-sans"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center justify-center gap-3 w-full px-8 py-5 mt-6 border-none rounded-lg bg-[#008CF4] text-white font-semibold text-lg leading-6 cursor-pointer transition-colors hover:bg-[#0072C6] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Sparkles size={24} />
              {loading ? 'Generating...' : 'Generate colors'}
            </button>
            {loading && <div className="loader self-center" />}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
