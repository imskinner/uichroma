# TODO

## Bugs (Fix First)

- [x] **Update OpenAI model** — changed to `gpt-4o` in `server.js` and `functions/index.js`.
- [x] **Remove fallback palette silent failure** — `generateColorPalette()` now throws on error; `/generatePalette` returns a 500 with a visible message.
- [x] **Fix `vercel.json`** — removed stale `POSTGRES_URL` env reference.
- [x] **Fix root route in `server.js`** — corrected to `path.join(__dirname, 'public', 'index.html')`.
- [x] **Tighten Firestore security rules** — public writes disabled; writes only via Admin SDK.
- [x] **Fix color picker on palette page** — Pickr CSS and JS now loaded in `index.html` as well.

## Dead Code Cleanup

- [ ] **Remove `exportToFigma()`** from `public/client.js` — references a non-existent `/exportToFigma` route and an undefined `currentPalette` variable.
- [ ] **Remove `getAuthorizationUrl()`** from `public/client.js` — Figma OAuth was never implemented; contains a hardcoded broken redirect URI.
- [ ] **Remove unused server routes** — `POST /api/palettes` and `GET /api/palettes` in `server.js` were stubs for user palette history that was never built.
- [ ] **Delete or archive `createTable.js`** — PostgreSQL schema creation script, no longer relevant.
- [ ] **Delete or archive `migrate-data.js`** — one-time PostgreSQL→Firestore migration script.
- [ ] **Remove commented-out code** in `public/client.js` lines 44–45.
- [ ] **Delete `figma-plugin/`** directory — Plugin v1 has a UI but no `code.js` backend. It cannot function. Either complete it or remove it.
- [ ] **Remove root-level `palette.html`** — duplicate of `public/palette.html` with broken relative paths.

## Wire Up Existing Unconnected Code

- [ ] **Copy permalink to clipboard** — `copyPermalinkToClipboard()` in `client.js` is implemented but never attached to the permalink link. Add `onclick="copyPermalinkToClipboard(event)"` to the generated `<a>` in `updateUI()`.
- [ ] **Copy hex to clipboard** — add a click-to-copy on the `.hex` span inside each `.color-box`. Reuse the clipboard pattern from `copyPermalinkToClipboard()`.

## Figma Plugin v2 (Fix to Make Functional)

- [ ] **Fix `manifest.json` network access** — change `"allowedDomains": ["none"]` to include the production URL (e.g., `"https://www.uichroma.com"`) and `"http://localhost:3000"` for dev.
- [ ] **Add palette fetch to plugin UI** — add a permalink input field to `ui.html` and a "Load Palette" button that sends a `fetch-palette` message.
- [ ] **Implement palette fetch in `code.js`** — handle `fetch-palette` message: call `/api/getPalette`, receive colors, then create Paint Styles from the returned color data (not random hues).
- [ ] **Fix Figma component creation logic** — the Button variant creation clones and removes a base component in a way that leaves orphaned nodes; rewrite using `figma.createComponentSet()` directly.
- [ ] **Use HSL tones from palette** — map the `tones[]` array from the palette response to Figma style lightness stops instead of recomputing them in the plugin.

## Feature: Export Options

- [ ] Add an "Export" dropdown or button section to the palette page.
- [ ] Implement **CSS Variables** export — generate `:root { --color-primary: ...; }` block from palette data, copy-to-clipboard + download as `.css`.
- [ ] Implement **SCSS Variables** export — generate `$color-primary: ...;` block, copy + download as `_palette.scss`.
- [ ] Implement **Tailwind config** export — generate `colors: { primary: { DEFAULT: '...', 10: '...' } }` object, copy + download as `tailwind.palette.js`.
- [ ] Implement **JSON export** — expose raw palette JSON as a downloadable file (already structured correctly in Firestore).

## Feature: Accessibility Checker

- [ ] Implement WCAG relative luminance calculation (already have hex→HSL, just need the formula).
- [ ] For each semantic color (primary, secondary, accent, warning, danger, success, info), calculate contrast ratio against white (`#ffffff`) and neutral.
- [ ] Display AA/AAA pass-fail badge on each color swatch.
- [ ] Add a legend/tooltip explaining what AA and AAA mean.

## Feature: Palette Naming & Better Permalinks

- [ ] Allow user to optionally name their palette after generation (inline editable title on palette page).
- [ ] Generate human-readable slugs from keywords (e.g., `vibrant-ocean-teal`) for permalink URLs. Store as `slug` field in Firestore alongside `permalink` MD5 hash. Fall back to hash if slug collides.
- [ ] Update `GET /palette/:permalink` to resolve both slug and MD5 hash.

## Feature: Save Edited Palette

- [ ] Add a "Save changes" button to the palette page that appears when any color has been modified via Pickr.
- [ ] On save, POST the modified `colors` object (not keywords) to a new endpoint `/savePalette` that writes to Firestore and returns a new permalink.
- [ ] Redirect to the new permalink after save.

## Feature: Regenerate Controls

- [ ] Add a "Regenerate" button on the palette page that re-runs the original keywords and redirects to a new palette.
- [ ] Add a per-swatch "Regenerate this color" button that calls a new endpoint `/regenerateColor` with the role (e.g., `"accent"`) and original keywords, returning a single replacement hex.

## Production Hardening

- [ ] **Add rate limiting** to `POST /generatePalette` — e.g., max 5 requests per IP per 10 minutes. Use `express-rate-limit` package.
- [ ] **Add env var validation** at server startup — check that `API_KEY`, `FIREBASE_PROJECT_ID`, etc. are set; throw a clear error if not.
- [ ] **Add error logging** — integrate Sentry or similar for server-side error tracking.
- [ ] **Update Firebase Functions OpenAI key access** — confirm `functions.config().openai.key` is set; document the setup command in CLAUDE.md.

## UX Polish

- [ ] **Loading message rotation** — during the ~5–10 second OpenAI call, cycle through messages: "Analyzing mood...", "Selecting hues...", "Finalizing palette..." instead of a bare spinner.
- [ ] **Mobile layout** — on screens under 600px, render colors as a vertical list with hex + label inline rather than a grid of small squares.
- [ ] **Palette description section** — display the original keywords used to generate the palette on the palette page (the `keywords` field is already returned by `/palette/:permalink/data`).
- [ ] **Empty state animation** — replace the static blank placeholder boxes with a subtle shimmer/pulse to indicate the tool is ready.
- [ ] **Mood checkbox UX** — show checkboxes in a horizontally scrollable pill row instead of a wrapping vertical list.

## Code Quality

- [ ] **Extract shared color utilities** — `hexToHSL()`, `hslToHex()`, `generateTonesForColor()` are duplicated across `server.js`, `functions/index.js`, and `public/client.js`. Create `utils/colorUtils.js` and import it where needed (or inline in client.js if keeping no-build-step frontend).
- [ ] **Standardize to English** — remove or translate Portuguese comments and `figma.notify()` strings in the plugin (`code.js`).
- [ ] **Split `public/client.js`** — the file handles palette generation, palette display, color normalization, and Pickr wiring. Split into logical sections or separate files once a build step is added.
