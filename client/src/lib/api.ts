import type { PaletteColors } from './palette-utils.ts';
import type { Style } from '@uichroma/core/theme';

function authHeaders(token?: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function generatePalette(
  prompt: string,
  token?: string | null,
): Promise<{ permalink: string; slug?: string; colors: PaletteColors; style?: Style }> {
  const response = await fetch('/generatePalette', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ feelings: prompt }),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText);
  }
  return response.json();
}

export async function getPaletteData(permalink: string): Promise<{
  permalink?: string;
  slug?: string | null;
  colors: Record<string, { hex: string; description?: string }>;
  aiResponse?: string;
  keywords?: string;
  style?: Style | null;
}> {
  const response = await fetch(`/palette/${permalink}/data`);
  if (!response.ok) {
    throw new Error(`Failed to load palette: ${response.status}`);
  }
  return response.json();
}

export async function generateVariation(
  originalPrompt: string,
  token?: string | null,
): Promise<{ permalink: string; slug?: string; colors: PaletteColors; style?: Style }> {
  return generatePalette(originalPrompt, token);
}

export async function updatePalette(
  permalink: string,
  colors: PaletteColors,
  token?: string | null,
): Promise<void> {
  const response = await fetch('/api/updatePalette', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ permalink, colors }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save');
  }
}

export interface MyThemeRow {
  permalink: string;
  slug?: string | null;
  keywords?: string;
  colors: Record<string, { hex: string }>;
  created_at?: string;
}

export async function getMyThemes(token: string): Promise<MyThemeRow[]> {
  const response = await fetch('/api/myThemes', { headers: authHeaders(token) });
  if (!response.ok) {
    throw new Error(`Failed to load your themes: ${response.status}`);
  }
  const data = await response.json();
  return data.themes || [];
}

// --- Teams (Phase 3.2) ---

export interface Team {
  id: string;
  name: string;
  invite_code?: string;
  role?: string;
}

async function jsonError(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => ({}));
  return body.error || fallback;
}

export async function getTeams(token: string): Promise<Team[]> {
  const res = await fetch('/api/teams', { headers: authHeaders(token) });
  if (!res.ok) throw new Error(await jsonError(res, 'Failed to load teams'));
  return (await res.json()).teams || [];
}

export async function createTeam(name: string, token: string): Promise<Team> {
  const res = await fetch('/api/teams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(await jsonError(res, 'Failed to create team'));
  return (await res.json()).team;
}

export async function joinTeam(code: string, token: string): Promise<Team> {
  const res = await fetch('/api/teams/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error(await jsonError(res, 'Failed to join team'));
  return (await res.json()).team;
}

export async function getTeamThemes(teamId: string, token: string): Promise<MyThemeRow[]> {
  const res = await fetch(`/api/teams/${teamId}/themes`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(await jsonError(res, 'Failed to load team themes'));
  return (await res.json()).themes || [];
}

export async function shareThemeToTeam(permalink: string, teamId: string, token: string): Promise<void> {
  const res = await fetch('/api/theme/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ permalink, teamId }),
  });
  if (!res.ok) throw new Error(await jsonError(res, 'Failed to share theme'));
}
