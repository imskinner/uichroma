import { Moon, Sun, Type } from 'lucide-react';
import { useDemoSettings } from '@/hooks/use-demo-settings.tsx';
import { GOOGLE_FONTS, loadGoogleFont } from '@/lib/google-fonts.ts';

export function DemoToolbar() {
  const { headingFont, bodyFont, isDark, setHeadingFont, setBodyFont, setIsDark } = useDemoSettings();

  const handleHeadingChange = (family: string) => {
    loadGoogleFont(family);
    setHeadingFont(family);
  };

  const handleBodyChange = (family: string) => {
    loadGoogleFont(family);
    setBodyFont(family);
  };

  return (
    <div className="flex items-center gap-4 flex-wrap mb-4 pb-4 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <Type size={16} className="text-gray-500" />
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Heading</label>
        <select
          value={headingFont}
          onChange={e => handleHeadingChange(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white outline-none cursor-pointer"
          style={{ fontFamily: headingFont }}
        >
          {GOOGLE_FONTS.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Type size={16} className="text-gray-500" />
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Body</label>
        <select
          value={bodyFont}
          onChange={e => handleBodyChange(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white outline-none cursor-pointer"
          style={{ fontFamily: bodyFont }}
        >
          {GOOGLE_FONTS.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <button
        onClick={() => setIsDark(!isDark)}
        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border cursor-pointer transition-colors"
        style={{
          background: isDark ? '#1a1a1a' : '#fff',
          color: isDark ? '#e5e5e5' : '#374151',
          borderColor: isDark ? '#333' : '#d1d5db',
        }}
      >
        {isDark ? <Sun size={14} /> : <Moon size={14} />}
        {isDark ? 'Light' : 'Dark'}
      </button>
    </div>
  );
}
