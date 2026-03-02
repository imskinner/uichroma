# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (Vite dev server on 5173 + Express on 3000, concurrent)
npm run dev

# Start production server only (serves client/dist)
npm start

# Build React frontend
npm run build

# Install Firebase Functions dependencies separately
npm --prefix functions install
```

No test suite is configured.

## Architecture

UI Chroma is an AI-powered color palette generator. Users enter a prompt, GPT-4 returns a structured 8-color UI palette (primary, secondary, accent, warning, danger, success, info + derived neutral), which is stored in Firestore and displayed as a shareable permalink.

### Frontend (React + Vite + TypeScript)

The frontend lives in `client/` and uses React 19, React Router v7, Tailwind CSS v4, and shadcn/ui.

```
client/
  src/
    main.tsx                      # Entry point
    App.tsx                       # React Router: / and /palette/:permalink
    index.css                     # Tailwind + shadcn tokens + glassmorphism CSS
    lib/
      utils.ts                    # shadcn cn() helper
      color-utils.ts              # hexToHSL, hslToHex, generateTonesForColor, textOn
      palette-utils.ts            # normalizePaletteColors, PALETTE_KEYS, types
      export-utils.ts             # CSS/SCSS/Tailwind/JSON generators
      api.ts                      # fetch wrappers for API endpoints
    hooks/
      use-palette.ts              # Palette context + useReducer for state management
    components/
      ui/                         # shadcn/ui: Button, Tabs, Popover, Tooltip, Badge
      layout/                     # BackgroundEllipses, GlassCard, TopBar
      palette/                    # ColorBox, ColorGrid, ColorPicker, PermalinkBar
      shades/                     # ShadesView, ShadeCard
      demo/                       # DemoView + 5 sub-views (Components, Landing, Dashboard, Mobile, Blog)
      export/                     # ExportSection with 4-format tabs
    pages/
      HomePage.tsx                # Prompt textarea + generate button
      PalettePage.tsx             # Full palette viewer with tabs
```

**Key libraries:**
- `react-colorful` for color picking (in shadcn Popover)
- `react-router-dom` for client-side routing
- `tailwindcss` + `@tailwindcss/vite` for styling

### Dual Deployment Modes

1. **Local / Vercel** (`server.js`): Express server using Firebase Admin SDK. Serves `client/dist/` as static files with SPA catch-all. OpenAI key from `process.env.API_KEY`.

2. **Firebase Hosting + Cloud Functions** (`functions/index.js`): Same Express app as a Cloud Function. `firebase.json` rewrites API routes to the function; `client/dist/` is the hosting public directory with SPA catch-all (`** → /index.html`).

### API Routes (both deployments)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/generatePalette` | Calls OpenAI, saves to Firestore, returns `permalink + colors` |
| GET | `/palette/:permalink/data` | Fetches palette JSON from Firestore |
| POST | `/api/getPalette` | Figma plugin endpoint — fetches palette by permalink |
| POST | `/api/updatePalette` | Saves edited palette colors back to Firestore |

### Dev Workflow

- `npm run dev` starts both Vite (port 5173) and Express (port 3000) concurrently
- Vite proxies `/generatePalette`, `/api/*`, and `/palette/*/data` to Express
- Production: `npm run build` → `client/dist/`, then `npm start` serves everything on port 3000

### Color Model

Palettes are stored as structured objects with keys `primary`, `secondary`, `accent`, `warning`, `danger`, `success`, `info`, `neutral`. Each color has `{ hex, description, h, s, l, tones[] }`. Rules applied on every palette:

- **Neutral** is derived from the primary hue: `hslToHex(primary.h, 10, 10)` — a near-black.
- **Warning / danger / success / info** are validated against semantic hue ranges server-side.
- **Tones** are 10 lightness steps (L=10 to L=95) at the same hue/saturation, generated client-side.

### Figma Plugins

- `figma-plugin/palett.ai/` — earlier POC plugin
- `figma-plugin-v2/UI Chroma/` — current plugin; connects to the web app via `/api/getPalette`, then creates Figma Paint Styles (tonal scale per color) and a Button component with variants on a new page

### Environment Variables (`.env` for local dev)

```
API_KEY=           # OpenAI API key
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
```

For Firebase Functions deployment, the OpenAI key is set separately:
```bash
firebase functions:config:set openai.key="YOUR_KEY"
```
