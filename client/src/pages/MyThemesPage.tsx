import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BackgroundEllipses } from '@/components/layout/BackgroundEllipses.tsx';
import { GlassCard } from '@/components/layout/GlassCard.tsx';
import { TopBar } from '@/components/layout/TopBar.tsx';
import { useAuth } from '@/hooks/use-auth.tsx';
import { getMyThemes, type MyThemeRow } from '@/lib/api.ts';

const ROLES = ['primary', 'secondary', 'accent', 'warning', 'danger', 'success', 'info', 'neutral'];

export function MyThemesPage() {
  const { user, session, loading: authLoading } = useAuth();
  const [themes, setThemes] = useState<MyThemeRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      setThemes([]);
      return;
    }
    getMyThemes(session.access_token)
      .then(setThemes)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load.'));
  }, [authLoading, session]);

  const muted = 'text-[#6b7280] dark:text-[#9ca3af]';

  return (
    <div className="landing-bg min-h-screen flex items-start justify-center p-10 max-md:p-4 overflow-auto">
      <BackgroundEllipses />
      <GlassCard>
        <TopBar />
        <div className="px-15 py-10 max-md:px-6">
          <h1 className="font-heading font-bold text-4xl mb-6 text-[#1B1A18] dark:text-[#e5e5e5]">
            My Themes
          </h1>

          {!authLoading && !user && (
            <p className={`text-base ${muted}`}>Sign in to see your saved themes.</p>
          )}

          {error && <p className="text-base text-red-600">{error}</p>}

          {user && themes === null && !error && <div className="loader" />}

          {user && themes && themes.length === 0 && (
            <p className={`text-base ${muted}`}>
              No saved themes yet. Generate one while signed in and it'll show up here.
            </p>
          )}

          {themes && themes.length > 0 && (
            <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
              {themes.map((t) => (
                <Link
                  key={t.permalink}
                  to={`/palette/${t.slug || t.permalink}`}
                  className="rounded-xl border border-[#e5e7eb] dark:border-[#333] overflow-hidden hover:-translate-y-1 transition-transform bg-white dark:bg-[#1a1a1a]"
                >
                  <div className="flex h-16">
                    {ROLES.map((r) =>
                      t.colors[r] ? (
                        <div key={r} className="flex-1" style={{ background: t.colors[r].hex }} />
                      ) : null,
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-medium truncate text-[#1B1A18] dark:text-[#e5e5e5]">
                      {t.keywords || 'Untitled theme'}
                    </div>
                    <div className={`text-xs ${muted}`}>
                      {t.created_at ? new Date(t.created_at).toLocaleDateString() : ''}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
