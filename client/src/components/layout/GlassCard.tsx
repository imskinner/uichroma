import type { ReactNode } from 'react';
import { cn } from '@/lib/utils.ts';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative w-full max-w-[1360px] bg-white/90 backdrop-blur-[60px] border border-white/80 rounded-[40px] flex flex-col overflow-hidden",
        "dark:bg-[#1a1a1e]/95 dark:border-white/10",
        "max-md:rounded-3xl",
        className
      )}
    >
      {children}
    </div>
  );
}
