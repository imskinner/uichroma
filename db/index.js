// Supabase data layer — the single home for theme persistence. Replaces the Firestore calls
// that were inlined in server.js / functions/index.js. Server-side only: it uses the
// service-role key (which bypasses Row-Level Security), so this module must never ship to the
// client. The client uses the anon key against the public-read RLS policy (Phase 3).
const { createClient } = require('@supabase/supabase-js');

const TABLE = 'themes';

let client = null;

/** Lazily create the service-role Supabase client so importing this module never throws. */
function getSupabase() {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Supabase is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    );
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

/** Fetch a theme by its permalink. Returns { colors, ai_response, keywords, style } or null. */
async function getThemeByPermalink(permalink) {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .select('colors, ai_response, keywords, style')
    .eq('permalink', permalink)
    .maybeSingle();
  if (error) throw error;
  return data; // null when not found
}

/** Insert a freshly generated theme. Returns the new row id. */
async function insertTheme({ permalink, keywords, colors, aiResponse, style }) {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .insert({ permalink, keywords, colors, ai_response: aiResponse, style: style ?? null })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

/** Update a theme's colors by permalink. Returns the updated row id, or null if not found. */
async function updateThemeColors(permalink, colors) {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .update({ colors, updated_at: new Date().toISOString() })
    .eq('permalink', permalink)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  return data; // null when no row matched
}

module.exports = {
  TABLE,
  getSupabase,
  getThemeByPermalink,
  insertTheme,
  updateThemeColors,
};
