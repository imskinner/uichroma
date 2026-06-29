import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// The anon key is a public client key (safe to ship in the bundle); it only grants what
// Row-Level Security allows. Auth features degrade gracefully if the env vars are missing.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const authConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = authConfigured
  ? createClient(url as string, anonKey as string)
  : null;
