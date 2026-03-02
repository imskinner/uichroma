import { Type } from 'lucide-react';
import { useDemoSettings } from '@/hooks/use-demo-settings.tsx';
import { GOOGLE_FONTS, loadGoogleFont } from '@/lib/google-fonts.ts';

export function DemoToolbar() {
  const { headingFont, bodyFont, isDark, setHeadingFont, setBodyFont } = useDemoSettings();

  const handleHeadingChange = (family: string) => {
    loadGoogleFont(family);
    setHeadingFont(family);
  };

  const handleBodyChange = (family: string) => {
    loadGoogleFont(family);
    setBodyFont(family);
  };

  const selectStyle = {
    background: isDark ? '#1a1a1a' : '#fff',
    color: isDark ? '#e5e5e5' : '#374151',
    borderColor: isDark ? '#333' : '#d1d5db',
  };

  return (
    <div
      className="flex items-center gap-4 flex-wrap mb-4 pb-4 border-b"
      style={{ borderColor: isDark ? '#333' : '#e5e7eb' }}
    >
      <div className="flex items-center gap-2">
        <Type size={16} style={{ color: isDark ? '#9ca3af' : '#6b7280' }} />
        <label className="text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Heading</label>
        <select
          value={headingFont}
          onChange={e => handleHeadingChange(e.target.value)}
          className="text-sm border rounded-lg px-2 py-1.5 outline-none cursor-pointer"
          style={{ fontFamily: headingFont, ...selectStyle }}
        >
          {GOOGLE_FONTS.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Type size={16} style={{ color: isDark ? '#9ca3af' : '#6b7280' }} />
        <label className="text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Body</label>
        <select
          value={bodyFont}
          onChange={e => handleBodyChange(e.target.value)}
          className="text-sm border rounded-lg px-2 py-1.5 outline-none cursor-pointer"
          style={{ fontFamily: bodyFont, ...selectStyle }}
        >
          {GOOGLE_FONTS.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
