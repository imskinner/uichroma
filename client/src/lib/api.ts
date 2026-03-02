import type { PaletteColors } from './palette-utils.ts';

export async function generatePalette(prompt: string): Promise<{ permalink: string; colors: PaletteColors }> {
  const response = await fetch('/generatePalette', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
}> {
  const response = await fetch(`/palette/${permalink}/data`);
  if (!response.ok) {
    throw new Error(`Failed to load palette: ${response.status}`);
  }
  return response.json();
}

export async function generateVariation(
  originalPrompt: string,
): Promise<{ permalink: string; colors: PaletteColors }> {
  return generatePalette(originalPrompt);
}

export async function updatePalette(permalink: string, colors: PaletteColors): Promise<void> {
  const response = await fetch('/api/updatePalette', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ permalink, colors }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to save');
  }
}
