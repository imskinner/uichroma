import type { ReactNode } from 'react';

interface TopBarProps {
  actions?: ReactNode;
}

export function TopBar({ actions }: TopBarProps) {
  return (
    <div className="flex items-center justify-between px-15 pt-10 max-md:px-6 max-md:pt-6">
      <a href="/">
        <img src="/img/logo.svg" alt="UI Chroma" className="h-7" />
      </a>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
