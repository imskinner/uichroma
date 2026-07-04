import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, LogOut, ChevronDown, Users } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { AuthModal } from './AuthModal.tsx';

export function AuthButton() {
  const { user, authConfigured, loading, signOut } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!authConfigured || loading) return null;

  if (user) {
    const label = user.email ?? 'Account';
    return (
      <div className="relative">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium border-[#d1d5db] dark:border-[#444] text-[#374151] dark:text-[#e5e5e5] hover:bg-black/5 dark:hover:bg-white/5 transition-colors max-w-[200px]"
        >
          <span className="truncate">{label}</span>
          <ChevronDown size={14} />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-44 rounded-lg border border-[#e5e7eb] dark:border-[#333] bg-white dark:bg-[#1a1a1a] shadow-lg py-1 z-50">
              <Link
                to="/my-themes"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[#374151] dark:text-[#e5e5e5] hover:bg-black/5 dark:hover:bg-white/5"
              >
                <LayoutGrid size={15} /> My Themes
              </Link>
              <Link
                to="/teams"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[#374151] dark:text-[#e5e5e5] hover:bg-black/5 dark:hover:bg-white/5"
              >
                <Users size={15} /> Teams
              </Link>
              <button
                onClick={() => {
                  signOut();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-[#374151] dark:text-[#e5e5e5] hover:bg-black/5 dark:hover:bg-white/5"
              >
                <LogOut size={15} /> Sign out
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 rounded-lg bg-[#1B1A18] dark:bg-[#e5e5e5] text-white dark:text-[#1a1a1a] font-medium text-sm hover:opacity-90 transition-opacity"
      >
        Sign in
      </button>
      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  );
}
