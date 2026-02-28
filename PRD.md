# PRD — UI Chroma: Improvements & Feature Roadmap

## Overview

UI Chroma is an AI-powered color palette generator. Users enter keywords, select mood traits, and receive an 8-color UI palette (primary, secondary, accent, warning, danger, success, info, neutral) backed by OpenAI and stored in Firestore via a shareable permalink.

The core generation loop works. What's missing is everything around it: Figma integration (the main value-add is broken), export options, user context, and production hardening.

---

## Current State Gaps

### Broken / Incomplete
- **Figma Plugin v2** is non-functional: `manifest.json` sets `allowedDomains: ["none"]`, blocking all network calls. The plugin generates random colors instead of fetching from the web app.
- **Figma Plugin v1** has a UI but no `code.js` backend — it cannot run.
- **Export to Figma** (`exportToFigma()` in `client.js`) is dead code — the backend route doesn't exist.
- **User palettes** (`/api/palettes` routes) are implemented server-side but have no auth, no UI, and are never called.
- **Copy permalink to clipboard** is implemented (`copyPermalinkToClipboard()`) but never wired to any DOM event.

### Bugs
- `gpt-4-turbo-preview` is a deprecated OpenAI model — API calls will fail or fall back silently.
- The fallback palette surfaces to users without any visible error message.
- Firestore security rules allow unrestricted public writes (`allow write: true`).
- `vercel.json` references a PostgreSQL env var (`@postgres_url`) that was replaced by Firestore.
- On the home page, if a palette somehow renders, color boxes have no Pickr library loaded — the picker would silently fail.

---

## Improvement Areas

### 1. Figma Integration (Core Differentiator)

The Figma plugin is the primary feature that differentiates UI Chroma. It should:

- Let users paste a palette permalink into the plugin.
- Fetch that palette's 8 colors from the web app.
- Create Figma Paint Styles for all 8 colors, each with a 10-stop tonal scale (L=10 to L=95).
- Optionally create a base set of UI components (Button, Input, Badge) pre-styled with the palette.

**Requirements:**
- `manifest.json` must declare the web app domain in `allowedDomains`.
- Palette fetch should use the existing `/api/getPalette` endpoint.
- Tonal scale naming convention: `Color/Primary/10`, `Color/Primary/20`, ..., `Color/Primary/95`.
- Neutral scale should include additional stops: 100 (white) through 5 (near-black).
- Plugin should show progress and handle network errors gracefully.

### 2. Export Options

Users want to use generated palettes in their projects immediately. Priority order:

**CSS Variables**
```css
:root {
  --color-primary: #2563eb;
  --color-primary-10: #0d1a3d;
  /* ... */
}
```

**SCSS/Sass Variables**
```scss
$color-primary: #2563eb;
$color-primary-10: #0d1a3d;
```

**Tailwind Config**
```js
// tailwind.config.js colors block
colors: {
  primary: { DEFAULT: '#2563eb', 10: '#0d1a3d', ... }
}
```

**JSON** (already stored in Firestore, just expose it cleanly as a download)

Each format should be copyable to clipboard and downloadable as a file.

### 3. Color Accessibility

Any serious design tool needs to surface accessibility info. For each color pair:

- Calculate WCAG 2.1 contrast ratio (relative luminance formula).
- Show pass/fail badges for AA (4.5:1) and AAA (7:1) on text-on-background combinations.
- At minimum: check Primary on white, neutral (text color) on white, and all semantic colors on white.
- Surface warnings inline on the color swatches (icon badge, not blocking UI).

### 4. Palette Customization & Persistence

After generation, users frequently want to tweak colors. The current flow loses edits on navigation.

- **Save edited palette**: After the user modifies colors via the Pickr picker, allow saving the modified version as a new permalink (POST to `/generatePalette` or a new `/savePalette` endpoint with explicit colors instead of keywords).
- **Palette naming**: Let users optionally give a palette a name. Store it in Firestore alongside the permalink.
- **Regenerate individual colors**: Button per swatch to ask AI to re-suggest just that color role.

### 5. User Accounts & Palette History

Without accounts, users lose their palette history. The server already has stub routes.

- Firebase Authentication (Google sign-in is lowest friction).
- Attach `userId` to Firestore palette documents on generation.
- "My Palettes" page listing the user's saved palettes with thumbnails.
- Option to delete or favorite palettes.

This also enables Firestore security rules to restrict writes to authenticated users.

### 6. Palette Discovery & Inspiration

- **Public gallery**: Opt-in public listing of generated palettes, browsable by mood/keyword.
- **Trending palettes**: Surface popular or recently created palettes on the home page.
- **Similar palettes**: After generation, show 3–4 palettes with a similar hue profile from the Firestore collection.

### 7. UX Polish

**Landing page:**
- Replace the static placeholder color boxes with animated gradient preview that hints at what a palette looks like.
- Add character limit indicator on the keywords input.
- Show a loading message that changes every 2–3 seconds during generation ("Analyzing mood...", "Selecting hues...", "Finalizing palette...").

**Palette page:**
- Show hex values on color boxes by default; show HSL on hover or toggle.
- One-click copy for individual hex values with toast confirmation.
- Palette title/metadata section showing the original keywords used.
- "Regenerate" button to re-run the same keywords for a different result.

**Permalink:**
- Make the permalink human-readable (e.g., `/palette/vibrant-ocean-teal`) using a slug derived from keywords, falling back to the MD5 hash for collisions.

### 8. Production Hardening

- **Rate limiting**: Limit `/generatePalette` to N requests per IP per hour (e.g., using an in-memory store or Firebase rate limiter) to prevent OpenAI cost abuse.
- **Environment validation**: Check all required env vars at startup and fail fast with a clear error message.
- **Firestore security rules**: Lock down to authenticated reads/writes; allow public read of palette documents only.
- **OpenAI model**: Update to `gpt-4o` or `gpt-4o-mini` for better reliability and cost efficiency.
- **Error visibility**: Log errors to a service (e.g., Sentry) rather than only `console.error`.

### 9. Mobile Experience

The current layout degrades on small screens. Color boxes become too small to read hex values or interact with.

- On mobile: stack colors vertically as full-width rows showing hex + label + description inline.
- Touch-friendly color picker (Pickr is usable on mobile but positioning needs adjustment).
- Test and fix the color picker viewport boundary detection on mobile.

---

## Non-Goals (Explicit Scope Boundaries)

- **No AI chat interface** — the keyword prompt is intentional; keep it simple.
- **No custom AI models** — continue using OpenAI function calling.
- **No real-time collaboration** — sharing via permalink is sufficient for now.
- **No white-label or team plans** — single-user scope for this phase.
