import { useEffect, useState } from 'react';
import { Users, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { getTeams, shareThemeToTeam, type Team } from '@/lib/api.ts';

export function ShareToTeamButton({ permalink }: { permalink: string }) {
  const { session } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (session) getTeams(session.access_token).then(setTeams).catch(() => {});
  }, [session]);

  if (!session || teams.length === 0) return null;

  const share = async (teamId: string, name: string) => {
    setOpen(false);
    try {
      await shareThemeToTeam(permalink, teamId, session.access_token);
      setMsg(`Shared to ${name}`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed to share');
    }
    setTimeout(() => setMsg(null), 2500);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-[#8b5cf6] rounded-lg bg-transparent text-[#8b5cf6] font-medium text-sm cursor-pointer hover:bg-[#f3f0ff] transition-colors dark:hover:bg-[#8b5cf620]"
      >
        <Users size={18} /> Share to team <ChevronDown size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-52 rounded-lg border border-[#e5e7eb] dark:border-[#333] bg-white dark:bg-[#1a1a1a] shadow-lg py-1 z-50">
            {teams.map((t) => (
              <button
                key={t.id}
                onClick={() => share(t.id, t.name)}
                className="w-full text-left px-3 py-2 text-sm text-[#374151] dark:text-[#e5e5e5] hover:bg-black/5 dark:hover:bg-white/5 truncate"
              >
                {t.name}
              </button>
            ))}
          </div>
        </>
      )}
      {msg && (
        <span className="absolute right-0 top-full mt-1 text-xs whitespace-nowrap text-[#6b7280] dark:text-[#9ca3af]">
          {msg}
        </span>
      )}
    </div>
  );
}
