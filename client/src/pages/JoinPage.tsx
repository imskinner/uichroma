import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BackgroundEllipses } from '@/components/layout/BackgroundEllipses.tsx';
import { GlassCard } from '@/components/layout/GlassCard.tsx';
import { TopBar } from '@/components/layout/TopBar.tsx';
import { useAuth } from '@/hooks/use-auth.tsx';
import { joinTeam } from '@/lib/api.ts';

export function JoinPage() {
  const { code } = useParams<{ code: string }>();
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'joining' | 'done' | 'error' | 'signin'>('joining');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!session) {
      setStatus('signin');
      return;
    }
    if (!code) {
      setStatus('error');
      setMsg('Invalid invite link.');
      return;
    }
    joinTeam(code, session.access_token)
      .then((t) => {
        setStatus('done');
        setMsg(`You've joined ${t.name}.`);
        setTimeout(() => navigate('/teams'), 1200);
      })
      .catch((e) => {
        setStatus('error');
        setMsg(e instanceof Error ? e.message : 'Failed to join.');
      });
  }, [loading, session, code, navigate]);

  return (
    <div className="landing-bg min-h-screen flex items-center justify-center p-10 max-md:p-4">
      <BackgroundEllipses />
      <GlassCard className="min-h-[calc(100vh-80px)]">
        <TopBar />
        <div className="flex flex-col items-center justify-center flex-grow px-6 py-20 text-center">
          <h1 className="font-heading font-bold text-3xl mb-3 text-[#1B1A18] dark:text-[#e5e5e5]">
            Team invite
          </h1>
          {status === 'joining' && <div className="loader" />}
          {status === 'signin' && (
            <p className="text-base text-[#6b7280] dark:text-[#9ca3af]">
              Sign in (top right) to join this team — you'll be added automatically.
            </p>
          )}
          {status === 'done' && (
            <p className="text-base text-green-700 dark:text-green-400">{msg} Redirecting…</p>
          )}
          {status === 'error' && (
            <div className="text-base text-red-600">
              {msg} <Link to="/teams" className="underline">Go to Teams</Link>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
