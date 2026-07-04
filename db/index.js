// Supabase data layer — the single home for theme persistence. Replaces the Firestore calls
// that were inlined in server.js / functions/index.js. Server-side only: it uses the
// service-role key (which bypasses Row-Level Security), so this module must never ship to the
// client. The client uses the anon key against the public-read RLS policy (Phase 3).
const { createClient } = require('@supabase/supabase-js');

const TABLE = 'themes';

let client = null;

// A theme is addressable by its legacy MD5 `permalink` or its human-readable `slug`.
// Sanitize the identifier (slugs/permalinks are [a-z0-9-] only) before building the OR filter.
function identClause(ident) {
  const safe = String(ident).replace(/[^a-zA-Z0-9-]/g, '');
  return `permalink.eq.${safe},slug.eq.${safe}`;
}

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

/** Fetch a theme by permalink OR slug. Returns { permalink, slug, colors, ai_response, keywords, style } or null. */
async function getThemeByPermalink(ident) {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .select('permalink, slug, colors, ai_response, keywords, style')
    .or(identClause(ident))
    .maybeSingle();
  if (error) throw error;
  return data; // null when not found
}

/** Insert a freshly generated theme. Returns the new row id. `userId` attributes ownership. */
async function insertTheme({ permalink, slug, keywords, colors, aiResponse, style, userId }) {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .insert({
      permalink,
      slug: slug ?? null,
      keywords,
      colors,
      ai_response: aiResponse,
      style: style ?? null,
      user_id: userId ?? null,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

/** Verify a Supabase access token and return the user id, or null if invalid/absent. */
async function getUserId(accessToken) {
  if (!accessToken) return null;
  try {
    const { data, error } = await getSupabase().auth.getUser(accessToken);
    if (error || !data?.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

/** The owner (user_id) of a theme (by permalink or slug): a uuid, null (unowned), or undefined (not found). */
async function getThemeOwner(ident) {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .select('user_id')
    .or(identClause(ident))
    .maybeSingle();
  if (error) throw error;
  return data ? data.user_id : undefined;
}

/** List a user's saved themes, newest first. */
async function getThemesByUser(userId) {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .select('permalink, slug, keywords, colors, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/** Update a theme's colors by permalink or slug. Returns the updated row id, or null if not found. */
async function updateThemeColors(ident, colors) {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .update({ colors, updated_at: new Date().toISOString() })
    .or(identClause(ident))
    .select('id')
    .maybeSingle();
  if (error) throw error;
  return data; // null when no row matched
}

// --- Teams (Phase 3.2) ---

/** Create a team and add the owner as its first member. Returns { id, name, invite_code }. */
async function createTeam({ name, ownerId, inviteCode }) {
  const sb = getSupabase();
  const { data: team, error } = await sb
    .from('teams')
    .insert({ name, owner_id: ownerId, invite_code: inviteCode })
    .select('id, name, invite_code')
    .single();
  if (error) throw error;
  const { error: mErr } = await sb
    .from('team_members')
    .insert({ team_id: team.id, user_id: ownerId, role: 'owner' });
  if (mErr) throw mErr;
  return team;
}

/** Teams the user belongs to: [{ id, name, invite_code, role }], newest membership first. */
async function getTeamsForUser(userId) {
  const { data, error } = await getSupabase()
    .from('team_members')
    .select('role, created_at, teams(id, name, invite_code, owner_id)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || [])
    .filter((m) => m.teams)
    .map((m) => ({ id: m.teams.id, name: m.teams.name, invite_code: m.teams.invite_code, role: m.role }));
}

/** Look up a team by its invite code, or null. */
async function getTeamByInviteCode(code) {
  const { data, error } = await getSupabase()
    .from('teams')
    .select('id, name, invite_code')
    .eq('invite_code', code)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Add a member (no-op if already a member — keeps their existing role). */
async function addTeamMember(teamId, userId, role = 'member') {
  const { error } = await getSupabase()
    .from('team_members')
    .upsert({ team_id: teamId, user_id: userId, role }, { onConflict: 'team_id,user_id', ignoreDuplicates: true });
  if (error) throw error;
}

/** The user's role in a team ('owner' | 'member'), or null if not a member. */
async function getTeamRole(teamId, userId) {
  const { data, error } = await getSupabase()
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? data.role : null;
}

/** A team's shared themes, newest first. */
async function getTeamThemes(teamId) {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .select('permalink, slug, keywords, colors, created_at')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/** Set a theme's team_id (share to team). Returns the row id, or null if not found. */
async function shareThemeToTeam(ident, teamId) {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .update({ team_id: teamId, updated_at: new Date().toISOString() })
    .or(identClause(ident))
    .select('id')
    .maybeSingle();
  if (error) throw error;
  return data;
}

module.exports = {
  TABLE,
  getSupabase,
  getThemeByPermalink,
  insertTheme,
  updateThemeColors,
  getUserId,
  getThemeOwner,
  getThemesByUser,
  createTeam,
  getTeamsForUser,
  getTeamByInviteCode,
  addTeamMember,
  getTeamRole,
  getTeamThemes,
  shareThemeToTeam,
};
