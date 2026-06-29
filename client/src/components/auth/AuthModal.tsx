import { useState, type FormEvent } from 'react';
import { Github, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth.tsx';

const inputClass =
  'rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors w-full ' +
  'border-[#d1d5db] dark:border-[#444] bg-white dark:bg-[#222] text-[#1B1A18] dark:text-[#e5e5e5] ' +
  'focus:border-[#008CF4]';

export function AuthModal({ onClose }: { onClose: () => void }) {
  const { signUp, signIn, signInWithGitHub } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    if (mode === 'signup') {
      const res = await signUp(email, password);
      if (res.error) setError(res.error);
      else if (res.needsConfirmation) setInfo('Check your email to confirm your account, then sign in.');
      else onClose();
    } else {
      const res = await signIn(email, password);
      if (res.error) setError(res.error);
      else onClose();
    }
    setBusy(false);
  };

  const github = async () => {
    setError(null);
    const res = await signInWithGitHub();
    if (res.error) setError(res.error);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1a1a1a] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-bold text-xl text-[#1B1A18] dark:text-[#e5e5e5]">
            {mode === 'signup' ? 'Create your account' : 'Sign in'}
          </h2>
          <button onClick={onClose} aria-label="Close">
            <X size={18} className="text-[#9ca3af] hover:text-[#6b7280]" />
          </button>
        </div>

        <button
          onClick={github}
          className="w-full flex items-center justify-center gap-2 border border-[#d1d5db] dark:border-[#444] rounded-lg py-2.5 text-sm font-medium text-[#1B1A18] dark:text-[#e5e5e5] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <Github size={18} /> Continue with GitHub
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          <span className="text-xs text-[#9ca3af]">or</span>
          <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
          {error && <div className="text-sm text-red-600">{error}</div>}
          {info && <div className="text-sm text-green-700 dark:text-green-400">{info}</div>}
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#008CF4] text-white font-medium text-sm py-2.5 hover:bg-[#0077d4] transition-colors disabled:opacity-60"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            {mode === 'signup' ? 'Sign up' : 'Sign in'}
          </button>
        </form>

        <div className="text-center text-sm mt-4 text-[#6b7280] dark:text-[#9ca3af]">
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setMode(mode === 'signup' ? 'signin' : 'signup');
              setError(null);
              setInfo(null);
            }}
            className="font-semibold text-[#008CF4]"
          >
            {mode === 'signup' ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
}
