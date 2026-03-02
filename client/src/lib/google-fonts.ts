export const GOOGLE_FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Raleway',
  'Nunito',
  'Source Sans 3',
  'Work Sans',
  'DM Sans',
  'Space Grotesk',
  'Outfit',
  'Plus Jakarta Sans',
  'Manrope',
  'Playfair Display',
  'Merriweather',
  'Lora',
  'Libre Baskerville',
  'Crimson Text',
  'EB Garamond',
  'Cormorant Garamond',
  'Fira Code',
  'JetBrains Mono',
  'IBM Plex Mono',
  'Oswald',
  'Bebas Neue',
  'Anton',
  'Archivo Black',
  'Cabin',
] as const;

const loadedFonts = new Set<string>();

export function loadGoogleFont(family: string): void {
  if (loadedFonts.has(family)) return;
  loadedFonts.add(family);

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
}
