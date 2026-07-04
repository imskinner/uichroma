import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils.ts';
import type { PaletteColors, PaletteKey } from '@/lib/palette-utils.ts';

export interface StudioSection {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface StudioSidebarProps {
  sections: StudioSection[];
  active: string;
  onSelect: (id: string) => void;
  colors: PaletteColors;
  keywords: string | null;
}

const ROLES: PaletteKey[] = ['primary', 'secondary', 'accent', 'warning', 'danger', 'success', 'info', 'neutral'];

export function StudioSidebar({ sections, active, onSelect, colors, keywords }: StudioSidebarProps) {
  return (
    <aside className="w-[248px] shrink-0 border-r border-black/[0.06] dark:border-white/[0.08] px-5 py-7 flex flex-col gap-7 max-md:w-full max-md:border-r-0 max-md:border-b max-md:py-5">
      {/* Theme identity */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9ca3af] mb-2">
          Theme
        </div>
        <h2 className="font-heading font-bold text-xl leading-[1.15] text-[#1B1A18] dark:text-[#e5e5e5] line-clamp-3">
          {keywords || 'Untitled theme'}
        </h2>
        <div className="flex mt-3.5 h-7 rounded-lg overflow-hidden ring-1 ring-black/[0.06] dark:ring-white/10">
          {ROLES.map((r) => (colors[r] ? <div key={r} className="flex-1" style={{ background: colors[r].hex }} /> : null))}
        </div>
      </div>

      {/* Section nav */}
      <nav className="flex flex-col gap-0.5 max-md:flex-row max-md:overflow-x-auto max-md:gap-1 max-md:-mx-1 max-md:px-1">
        {sections.map((s) => {
          const Icon = s.icon;
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-colors text-left max-md:shrink-0',
                isActive
                  ? 'bg-black/[0.055] dark:bg-white/[0.09] text-[#1B1A18] dark:text-white'
                  : 'text-[#6b7280] dark:text-[#9ca3af] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] hover:text-[#1B1A18] dark:hover:text-[#e5e5e5]',
              )}
            >
              <Icon size={17} className={isActive ? 'text-[#008CF4]' : ''} strokeWidth={2} />
              {s.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
