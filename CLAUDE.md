# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (runs nodemon + sass --watch concurrently)
npm run dev

# Start server only
npm start

# Compile SCSS only (watches src/scss → public/css)
npm run sass

# Install Firebase Functions dependencies separately
npm --prefix functions install
```

No test suite is configured.

## Architecture

UI Chroma is an AI-powered color palette generator. Users enter keywords, GPT-4 returns a structured 8-color UI palette (primary, secondary, accent, warning, danger, success, info + derived neutral), which is stored in Firestore and displayed as a shareable permalink.

### Dual Deployment Modes

The app can run in two ways:

1. **Local / Vercel** (`server.js`): Express server using the Firebase client SDK and `dotenv` for config. OpenAI key read from `process.env.API_KEY`. All routes served by this single file.

2. **Firebase Hosting + Cloud Functions** (`functions/index.js`): Same Express app but as a Firebase Cloud Function using the Admin SDK. OpenAI key stored via `firebase functions:config:set openai.key=YOUR_KEY` and read via `functions.config().openai.key`.

`firebase.json` rewrites route `/generatePalette`, `/api/**`, and `/palette/**/data` to the Cloud Function; everything else falls through to static files in `public/`.

### API Routes (both deployments)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/generatePalette` | Calls OpenAI, saves to Firestore, returns `permalink + colors` |
| GET | `/palette/:permalink/data` | Fetches palette JSON from Firestore |
| GET | `/palette/:permalink` | Serves `palette.html` (SPA-style) |
| POST | `/api/getPalette` | Figma plugin endpoint — fetches palette by permalink |

### Frontend (Vanilla JS / No Framework)

- `public/index.html` — landing page with keyword input and mood checkboxes
- `public/palette.html` — palette viewer for shareable links
- `public/client.js` — shared by both HTML files; detects route via `window.location.pathname` to decide whether to show the generator or load an existing palette
- `public/css/style.scss` — SCSS source; compiled output committed to `public/css/style.css`
- Color picker uses `@simonwep/pickr` loaded from CDN (only on `palette.html`)

### Color Model

Palettes are stored as structured objects with keys `primary`, `secondary`, `accent`, `warning`, `danger`, `success`, `info`, `neutral`. Each color has `{ hex, description, h, s, l, tones[] }`. Rules applied on every palette:

- **Neutral** is derived from the primary hue: `hslToHex(primary.h, 10, 10)` — a near-black.
- **Warning / danger / success / info** are normalized to `L=50` in HSL (for consistent vibrancy).
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
