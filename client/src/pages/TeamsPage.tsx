import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, Plus, Users } from 'lucide-react';
import { BackgroundEllipses } from '@/components/layout/BackgroundEllipses.tsx';
import { GlassCard } from '@/components/layout/GlassCard.tsx';
import { TopBar } from '@/components/layout/TopBar.tsx';
import { useAuth } from '@/hooks/use-auth.tsx';
import { getTeams, createTeam, joinTeam, getTeamThemes, type Team, type MyThemeRow } from '@/lib/api.ts';

const ROLES = ['primary', 'secondary', 'accent', 'warning', 'danger', 'success', 'info', 'neutral'];

function ThemeGrid({ themes }: { themes: MyThemeRow[] }) {
  if (themes.length === 0) {
    return <p className="text-sm text-[#6b7280] dark:text-[#9ca3af]">No shared themes yet.</p>;
  }
  return (
    <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
      {themes.map((t) => (
        <Link
          key={t.permalink}
          to={`/palette/${t.slug || t.permalink}`}
          className="rounded-xl border border-[#e5e7eb] dark:border-[#333] overflow-hidden hover:-translate-y-1 transition-transform bg-white dark:bg-[#1a1a1a]"
        >
          <div className="flex h-16">
            {ROLES.map((r) => (t.colors[r] ? <div key={r} className="flex-1" style={{ background: t.colors[r].hex }} /> : null))}
          </div>
          <div className="p-3">
            <div className="text-sm font-medium truncate text-[#1B1A18] dark:text-[#e5e5e5]">
              {t.keywords || 'Untitled theme'}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function TeamsPage() {
  const { user, session, loading } = useAuth();
  const token = session?.access_token;
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [themes, setThemes] = useState<MyThemeRow[] | null>(null);
  const [newName, setNewName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (token) getTeams(token).then(setTeams).catch((e) => setError(e.message));
  }, [token]);

  useEffect(() => {
    if (loading) return;
    if (token) refresh();
    else setTeams([]);
  }, [loading, token, refresh]);

  useEffect(() => {
    if (selected && token) getTeamThemes(selected, token).then(setThemes).catch(() => setThemes([]));
    else setThemes(null);
  }, [selected, token]);

  const handleCreate = async () => {
    if (!newName.trim() || !token) return;
    setError(null);
    try {
      const t = await createTeam(newName.trim(), token);
      setNewName('');
      refresh();
      setSelected(t.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create team');
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim() || !token) return;
    setError(null);
    try {
      await joinTeam(joinCode.trim(), token);
      setJoinCode('');
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to join team');
    }
  };

  const copyInvite = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${code}`);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const inputClass =
    'rounded-lg border px-3 py-2 text-sm outline-none border-[#d1d5db] dark:border-[#444] bg-white dark:bg-[#222] text-[#1B1A18] dark:text-[#e5e5e5] focus:border-[#008CF4]';
  const muted = 'text-[#6b7280] dark:text-[#9ca3af]';

  return (
    <div className="landing-bg min-h-screen flex items-start justify-center p-10 max-md:p-4 overflow-auto">
      <BackgroundEllipses />
      <GlassCard>
        <TopBar />
        <div className="px-15 py-10 max-md:px-6">
          <h1 className="font-heading font-bold text-4xl mb-6 text-[#1B1A18] dark:text-[#e5e5e5]">Teams</h1>

          {!loading && !user && <p className={`text-base ${muted}`}>Sign in to create and join teams.</p>}

          {user && (
            <>
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-end gap-2">
                  <div className="flex flex-col gap-1">
                    <label className={`text-xs font-semibold uppercase tracking-wider ${muted}`}>New team</label>
                    <input className={inputClass} placeholder="Team name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                  </div>
                  <button onClick={handleCreate} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#008CF4] text-white font-medium text-sm hover:bg-[#0072C6]">
                    <Plus size={16} /> Create
                  </button>
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex flex-col gap-1">
                    <label className={`text-xs font-semibold uppercase tracking-wider ${muted}`}>Join with code</label>
                    <input className={inputClass} placeholder="Invite code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
                  </div>
                  <button onClick={handleJoin} className="px-4 py-2 rounded-lg border-2 border-[#8b5cf6] text-[#8b5cf6] font-medium text-sm hover:bg-[#f3f0ff] dark:hover:bg-[#8b5cf620]">
                    Join
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

              {teams === null && <div className="loader" />}

              {teams && teams.length === 0 && (
                <p className={`text-base ${muted}`}>You're not in any teams yet. Create one above, or join with an invite code.</p>
              )}

              {teams && teams.length > 0 && (
                <div className="flex flex-col gap-2 mb-8">
                  {teams.map((t) => (
                    <div
                      key={t.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selected === t.id ? 'border-[#008CF4] bg-[#008CF4]/5' : 'border-[#e5e7eb] dark:border-[#333]'}`}
                      onClick={() => setSelected(selected === t.id ? null : t.id)}
                    >
                      <Users size={18} className="text-[#8b5cf6] shrink-0" />
                      <span className="font-medium text-[#1B1A18] dark:text-[#e5e5e5]">{t.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 ${muted}`}>{t.role}</span>
                      <div className="flex-1" />
                      {t.invite_code && (
                        <button
                          onClick={(e) => { e.stopPropagation(); copyInvite(t.invite_code as string); }}
                          className={`inline-flex items-center gap-1 text-xs ${muted} hover:text-[#008CF4]`}
                        >
                          {copied === t.invite_code ? <Check size={13} /> : <Copy size={13} />}
                          {copied === t.invite_code ? 'Copied!' : 'Copy invite link'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selected && (
                <div>
                  <h2 className="font-heading font-bold text-xl mb-3 text-[#1B1A18] dark:text-[#e5e5e5]">Shared themes</h2>
                  {themes === null ? <div className="loader" /> : <ThemeGrid themes={themes} />}
                </div>
              )}
            </>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
