import type { PaletteColors } from './palette-utils.ts';
import type { Style } from '@uichroma/core/theme';

function authHeaders(token?: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function generatePalette(
  prompt: string,
  token?: string | null,
): Promise<{ permalink: string; colors: PaletteColors; style?: Style }> {
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
): Promise<{ permalink: string; colors: PaletteColors; style?: Style }> {
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
