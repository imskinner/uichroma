# UI Chroma — Pivot Build Plan

_Companion to `STRATEGY.md`. This is the engineering plan: target architecture, refactors,
stack migration, and phased, file-level tasks._

## Guiding principles

1. **Don't rebuild the engine.** The generation + scoring + critique loop in `server.js`
   (lines 319–517) is the asset. Extract it, harden it, reuse it everywhere (web, API, MCP).
2. **One source of truth for color math.** Kill the triplication across `server.js`,
   `functions/index.js`, and `client/src/lib/color-utils.ts`.
3. **Tokens are the product, not colors.** Everything serializes to/from a single canonical
   `Theme` object that can render to DTCG, CSS, SCSS, Tailwind, and an `AGENTS.md` constraint pack.
4. **Ship launch-blockers first** (rate limiting, secret removal) independent of phase order.

---

## Phase 0 — Foundation: refactor, secure, migrate stack

Do this before feature work. It removes liabilities and makes Phases 1–3 cheap.

### 0.1 — Credential loading (DONE 2026-06-14)
- Verified: the service-account key was **never committed** (clean git history) and is gitignored
  via `*-adminsdk-*.json`. **No leak — no key rotation or history purge needed.**
- The real problem was `server.js:13` hard-`require()`ing that gitignored file, which crashes
  startup when it's absent and can't work on Vercel. **Fixed:** credentials now load from
  `FIREBASE_SERVICE_ACCOUNT` (JSON string) → `GOOGLE_APPLICATION_CREDENTIALS` → `applicationDefault()`.
- Added `.env.example` documenting all env vars. `functions/index.js` already used
  `admin.initializeApp()` (ambient creds) and needed no change.

### 0.2 — Extract a shared core package (DONE 2026-06-28)
Created `packages/core/` — framework-free TypeScript, **dual CJS+ESM build** (`tsc` →
`dist/cjs` for Node `require`, `dist/esm` for the bundler's `import`), now the single home for:
- ✅ `hexToHSL`, `hslToHex`, `generateTonesForColor`, `textOn`, `hueDist`, `nudgeHue`, `hueInRange`
- ✅ `SEMANTIC_HUE_RANGES`, `validatePalette`, `scorePalette`, `deriveNeutral`
- ✅ the generation engine: `PALETTE_SYSTEM_PROMPT`, `CRITIQUE_SYSTEM_PROMPT`,
  `generateColorPalette`, `critiquePalette`, and `runPalettePipeline` (generate → score →
  critique-if-needed → derive neutral) — the reusable asset for the API **and** the MCP server.
- ✅ canonical `HSL` / `Tone` / `Color` / `Palette` types.

`server.js` and `functions/index.js` now `require('@uichroma/core')` (the whole duplicated
engine deleted from both); the web app's `client/src/lib/color-utils.ts` is a thin re-export of
the browser-safe `@uichroma/core/color` subpath, so no other client file changed. The root
`predev`/`prestart`/`build` scripts build core first.

**Still pending here (deferred to §1.1):** canonical `Theme`/`Token` types beyond the 8 colors.
The DTCG serializer now lives in core (§1.2, done); the CSS/SCSS/Tailwind serializers still live
in `client/src/lib/export-utils.ts` and can follow when there's a non-web consumer for them.
**Deploy caveat:** the Firebase function consumes core via a `file:../packages/core` dep that
points outside `functions/`; `firebase deploy` may need a pack/bundle step (moot once `functions/`
is retired in the migration).

### 0.3 — Stack migration (recommended: Vercel + Supabase)

**STATUS (2026-06-28): DONE — live on Vercel + Supabase.** Approach: kept the Express app as one
Vercel function and swapped only its data layer (lower-churn path below), not the per-route
serverless split. Shipped: npm-workspaces monorepo (fixes the Vercel build), `db/index.js` Supabase
data layer, `server.js` ported off Firestore (exports the app + listens only when run directly),
`api/index.js` Vercel entry, `supabase/schema.sql`, `scripts/migrate-firestore-to-supabase.js`
(`npm run migrate`), modernized `vercel.json`, `.env.example`. **Cutover done:** Supabase project
provisioned, schema applied (via the IPv4 pooler — the direct host is IPv6-only), **757 palettes
migrated** (0 failed), Vercel env vars set, deployed to production. Verified live at
**https://www.uichroma.com** — reads, generate→persist→read-back, and the SPA all work.
**Remaining:** rotate the OpenAI key that was exposed in the committed `.env` (now untracked);
decommission Firebase/`functions/` once you're comfortable (kept as a safety net). Runbook:
[`MIGRATION-SUPABASE.md`](./MIGRATION-SUPABASE.md).

**Target architecture:**
```
uichroma/ (monorepo)
  packages/
    core/                 # shared color/token engine (TS, no framework)
  apps/
    web/                  # the React app (Vite SPA now; optional Next.js later for SSR/SEO)
      api/                # Vercel Serverless Functions (replaces server.js + functions/index.js)
        generate.ts       #   POST /api/generate     (was /generatePalette)
        theme/[id].ts     #   GET  /api/theme/:id     (was /palette/:permalink/data)
        theme/update.ts   #   POST /api/theme/update  (was /api/updatePalette)
        getPalette.ts     #   POST /api/getPalette    (Figma plugin compat shim)
    mcp/                  # MCP server (Phase 1) — also deployable to Vercel
  docs/
```

**Migration steps:**
1. Stand up a Supabase project. Schema in §3.2. Enable Auth (email + GitHub OAuth — the
   vibe-coding crowd lives on GitHub) and Row-Level Security.
2. Port the three Firestore handlers in `server.js` to Vercel functions backed by Supabase
   (`@supabase/supabase-js` with the service-role key, server-side only).
3. One-time data migration: export the `palettes` Firestore collection → insert into the
   `themes` table (keep `permalink` as a column so existing links keep working).
4. Point `vercel.json` rewrites + the Vite proxy at `/api/*`. Delete `firebase.json`,
   `functions/`, and `firestore.*` once parity is confirmed.
5. Keep the OpenAI key in Vercel env (`OPENAI_API_KEY`); never ship it to the client.

**Lower-churn alternative (defer migration):** keep Firebase/Firestore, just (a) do 0.1 + 0.2,
(b) add rate limiting (§3.4), (c) collapse `server.js`/`functions/index.js` onto the shared core.
Migrate later when auth (Phase 3) forces the issue. This is valid if bandwidth is tight — but
auth + team brands are much cheaper on Supabase, so migrating now pays off.

**Effort:** ~3–5 days for the Vercel+Supabase migration incl. data port and parity testing.

---

## Phase 1 — Become consumable by AI agents (highest leverage)

Goal: a vibe coder in Cursor/Claude Code/Windsurf types one sentence and their generated UI
uses _our_ theme. This is the distribution unlock.

### 1.1 — Canonical Theme model (in `packages/core`)
Extend beyond the 8 colors to a serializable theme. Even in Phase 1, define the shape so
Phase 2 just fills it in:
```ts
type Theme = {
  id: string; slug: string; vibe: string;
  colors: Record<ColorRole, Color>;        // existing 8 roles
  // Phase 2 fills these; Phase 1 may emit sensible defaults:
  typography?: { scale: number[]; families: {...} };
  spacing?: number[]; radii?: number[]; shadows?: string[];
  modes: { light: TokenSet; dark?: TokenSet };
  meta: { wcag: WcagReport };
};
```

### 1.2 — DTCG / Style Dictionary export (DONE 2026-06-28)
Added `toDTCG` / `toDTCGObject` to `packages/core` (`src/tokens.ts`), exposed via a browser-safe
`@uichroma/core/tokens` subpath so the web app gets it without bundling the generation engine. It
emits **W3C DTCG** token JSON (`$type`, `$value`): each of the 8 roles becomes a group with a
`DEFAULT` token, an optional `$description`, and the 10-step tonal scale. Pre-computed `tones` are
passed through when present (so the DTCG scale keys match the CSS/SCSS/Tailwind ramps) and derived
via `generateTonesForColor` otherwise. Surfaced as the 5th **DTCG Tokens** tab in
`client/src/components/export/ExportSection.tsx` (downloads `tokens.dtcg.json`).

### 1.3 — `AGENTS.md` / skill constraint-pack generator (DONE 2026-06-28)
Added `packages/core/src/constraints.ts` (browser-safe `@uichroma/core/constraints` subpath):
`generateAgentsMd`, `generateClaudeSkill`, `generateCursorRules` — three flavors over one shared
body (token table + the 8 semantic role usages + 6 hard rules + the model's per-role "brand
intent" + a permalink provenance line):
- `AGENTS.md` (generic, read by most agents)
- a Claude Code **skill** with `name`/`description` frontmatter (pairs with the DTCG json)
- a Cursor `.mdc` rule with `description`/`globs`/`alwaysApply` frontmatter
Surfaced as a new **AI Constraint Pack** section (`ConstraintPackSection.tsx`) below the export
tabs on the palette page, each flavor with copy + download + a placement hint. The brand title
defaults to a title-cased form of the vibe when no explicit name is given.

### 1.4 — MCP server (`apps/mcp`) (DONE 2026-06-28)
Built `apps/mcp` — an ESM stdio MCP server (`@modelcontextprotocol/sdk` 1.29), a thin transport
over `@uichroma/core`:
- ✅ `generate_theme(vibe)` → `runPalettePipeline` in-process, returns the `AGENTS.md` pack + DTCG tokens
- ✅ `get_theme(permalink)` → fetches a saved theme from the read API (`UICHROMA_API_BASE`), same output
- ✅ `theme://{permalink}` **resource** → DTCG tokens (JSON) + `AGENTS.md` (markdown)
- ⬜ `list_my_themes()` — deferred to Phase 3 (needs auth)

Generation runs in-process (OpenAI key via `OPENAI_API_KEY`); reads proxy the existing
`/palette/:permalink/data` endpoint, so the MCP server stays stateless (no Firestore coupling).
Install docs for Claude Code / Cursor / Windsurf are in `apps/mcp/README.md`. Verified end-to-end
via a stdio JSON-RPC handshake (initialize + tools/list + resources/templates/list).
**Still to do:** publish to npm (so install is `npx @uichroma/mcp`) and list on the MCP registries.

This required making the core **ESM build Node-correct** (the build now rewrites the `dist/esm`
relative specifiers to include `.js`, which the bundler tolerated but Node's ESM loader rejects).

**Phase 1 deliverables:** DTCG export ✅, constraint-pack generator ✅, working MCP server ✅,
install docs ✅. _(Remaining: npm publish + registry listing for distribution.)_

---

## Phase 2 — Palette → full theme system

Color alone doesn't de-generic-ify a UI (Inter + default spacing/radii do half the damage).
Expand the artifact and the generation.

### 2.1 — Light + dark generated together (DONE 2026-06-28, Phase 2A)
Done deterministically (no extra model call): `packages/core/theme.ts` `deriveModes(colors)` builds
light + dark chrome token sets (`background`/`surface`/`surfaceMuted`/`text`/`textMuted`/`border`)
from the neutral hue. `buildTheme(colors)` assembles the canonical `Theme` (colors + modes + wcag);
DTCG emits `light`/`dark` groups and the AGENTS.md packs document both modes. Works on all 757
existing palettes. _(Pending in 2C: wire the Demo sub-views to the generated dark tokens instead of
their ad-hoc neutral-derived dark mode.)_

### 2.2 — Non-color tokens (DONE 2026-06-28, Phase 2B)
The model returns a compact `style` object in the **same** call as the palette (no extra cost):
`headingFont`/`bodyFont`/`monoFont` (real Google Fonts, steered away from Inter-by-default),
`typeScaleRatio`, `radius`, `density`, `elevation`. `theme.ts` `deriveStyleTokens(style)` derives the
full scales (type scale, spacing, radii, neutral-tinted shadow ramp); `normalizeStyle` clamps junk.
Persisted in a new nullable Supabase `style jsonb` column (legacy 757 rows → `DEFAULT_STYLE`). DTCG
emits `font`/`fontSize`/`spacing`/`radius`/`shadow` groups; AGENTS.md gains a "Typography & tokens"
section; a new **Tokens** tab renders the scales (loads the chosen Google Fonts so the type scale
shows in them). Verified: "bold editorial fashion magazine" → Playfair Display + Lora, ratio 1.5,
sharp corners.

### 2.3 — WCAG as a first-class constraint (DONE 2026-06-28, Phase 2A)
- ✅ Proper `contrastRatio` (relative luminance) + `computeWcag` give AA/AAA/AA-large for every
  fg/bg pair, per mode (`theme.ts`).
- ✅ Surfaced in a new **Accessibility** tab (`AccessibilityPanel`) with per-pair ratios + badges;
  also written into the AGENTS.md "Accessibility (WCAG)" section.
- ✅ `scoreTheme` folds primary/accent CTA-contrast failures into the **critique loop**, so
  generation self-corrects legibility, not just hue separation.

### 2.4 — Demo views as live theme proof (CORE DONE 2026-06-28)
The Demo now reflects the generated theme: `DemoView` builds the theme and feeds it to
`DemoSettingsProvider`, which **defaults the demo typography to the brand's generated fonts**
(loaded from Google Fonts, user-overridable) — so all 5 sub-views render in the brand's actual
type — and the dark-mode frame uses the **generated dark chrome** (brand-hue-tinted) instead of a
hardcoded grey. The toolbar surfaces the brand fonts as the selected options.
**Radii done (2026-06-28):** a scoped, unlayered CSS rule (`.demo-themed .rounded-*` → theme radii
CSS vars set in `DemoView`) remaps the demo's roundness to the generated `radii` across all 5
sub-views at once — so sharp↔pill corners visibly change per theme (circles/avatars left round).
**Remaining:** density-driven spacing (lower value, far higher churn — deferred).

---

## Phase 3 — Productize & defend

### 3.1 — Auth + saved themes (Supabase Auth) (CORE DONE 2026-06-28)
- ✅ **Email/password auth** (works out of the box) + a **GitHub button** (inert until the GitHub
  provider is enabled in Supabase). Client: `lib/supabase.ts` (anon client, degrades gracefully if
  env absent), `use-auth.tsx` context, `AuthModal`/`AuthButton` in the TopBar.
- ✅ **Ownership:** `/generatePalette` stamps `themes.user_id` when the caller is signed in (JWT in
  the `Authorization` header, verified server-side via `getUserId`); `/api/updatePalette` is
  owner-only once a theme is claimed (legacy/anon themes stay editable); new `GET /api/myThemes`.
- ✅ **My Themes** page (`/my-themes`) lists the user's saved themes. RLS policies added
  (public-read + owners read/update own). Verified end-to-end (admin-created user → JWT →
  myThemes → 403/200 ownership).
- ✅ Env: `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (public) wired local + Vercel.
- **Pending:** you enable the GitHub OAuth provider in Supabase to light up the GitHub button.
- ✅ **Human-readable slugs (DONE 2026-06-29):** generation derives `slug = <kebab vibe>-<10 hex>`
  (stored in `themes.slug`); every lookup (read/owner/update) resolves by **permalink OR slug**
  (`db/index.js` `identClause` + `.or(...)`). New themes route as `/palette/<slug>`; the palette
  page canonicalizes legacy MD5 URLs to the slug (`navigate(..., {replace:true})`). Old MD5 links
  + the Figma plugin keep working (legacy rows have `slug=null`).

### 3.2 — Team brand library
- `teams`, `team_members`, `themes.team_id`. Shared brand the whole team (and their agents via
  MCP) pulls from. This is the sticky, paid, defensible layer.

### 3.3 — Billing
- Stripe. Free / Pro / Team tiers (see `STRATEGY.md §6`). Gate: saved themes count, private
  themes, MCP access to saved brands, team seats.

### 3.4 — Rate limiting & cost control (stopgap DONE 2026-06-14; durable version pending)
- **Done:** in-memory per-IP fixed-window limiter on `/generatePalette` in `server.js`
  (`RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX`, defaults 60s / 10). Protects the single-process
  Express deploy today.
- **Pending (during migration):** swap to an Upstash/Redis-backed limiter that shares state
  across serverless instances; add per-user limits + free-tier daily caps once auth lands.
- **Pending:** log token usage per generation; add a hard monthly OpenAI budget alarm.

### 3.5 — Observability
- Error tracking (Sentry), structured logs, basic analytics (generations, exports, MCP pulls).

---

## 3. Reference details

### 3.1 — API surface (after migration)
| New | Replaces | Notes |
|-----|----------|-------|
| `POST /api/generate` | `POST /generatePalette` | body `{ vibe }`; returns Theme + DTCG |
| `GET /api/theme/:slug` | `GET /palette/:permalink/data` | slug or legacy MD5 |
| `POST /api/theme/update` | `POST /api/updatePalette` | auth-gated (Phase 3) |
| `POST /api/getPalette` | same | Figma-plugin compat shim (keep) |
| MCP `generate_theme` / `get_theme` | — | new (Phase 1) |

Keep `/api/getPalette` and the old data route working so **Figma plugin v2 and existing
permalinks don't break**.

### 3.2 — Supabase schema (sketch)
```sql
themes (
  id uuid pk default gen_random_uuid(),
  slug text unique,
  legacy_permalink text unique,         -- old MD5, nullable
  user_id uuid references auth.users,   -- nullable until Phase 3
  team_id uuid references teams,        -- nullable
  vibe text,
  theme jsonb,                          -- canonical Theme object (colors + tokens + modes)
  wcag jsonb,
  is_public boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz
)
teams (id uuid pk, name text, created_at timestamptz)
team_members (team_id uuid, user_id uuid, role text, primary key (team_id,user_id))
-- RLS: public read where is_public; write only own/team rows.
```

### 3.3 — Files to change / create (high level)
- **Create:** `packages/core/*`, `apps/mcp/*`, `apps/web/api/*`, `vercel.json`,
  `docs/` market notes, DTCG + AGENTS.md serializers.
- **Modify:** `client/src/lib/{color-utils,export-utils,palette-utils,api}.ts` → import from core;
  `ExportSection.tsx` (+DTCG, +constraint pack tabs); generation prompt/schema for non-color tokens.
- **Delete (after parity):** committed service-account JSON, `functions/`, `firebase.json`,
  `firestore.*`, duplicated color math in `server.js`.

### 3.4 — Generation engine changes
- Rename `scorePalette` → `scoreTheme`; add non-color + WCAG checks.
- Reuse the **accept-only-if-score-improves** critique guard for the expanded checks.
- Move `PALETTE_SYSTEM_PROMPT` into core; extend schema with typography/spacing/radii (Phase 2).
- Consider `gpt-4o` → newer model eval; keep function-calling structure.

---

## Suggested sequencing & rough effort

| Order | Work | Effort | Why now |
|-------|------|--------|---------|
| 1 | 0.1 secret removal + key rotation | 0.5 d | Active liability |
| 2 | 3.4 rate limiting | 0.5–1 d | Cost liability before any traffic |
| 3 | 0.2 shared core extraction | ✅ done | Unblocks everything |
| 4 | 0.3 Vercel+Supabase migration | ✅ done (live) | Removes dual-deploy + enables auth |
| 5 | 1.2 DTCG export + 1.3 AGENTS.md | ✅ done | First "vibe-coding" value, low ML |
| 6 | 1.4 MCP server | ✅ done | Distribution unlock (pending npm publish) |
| 7 | 2.1–2.3 full tokens + dark + WCAG | ✅ done (2A modes+WCAG, 2B non-color tokens); 2.4 demo wiring left | The actual de-generic-ifier |
| 8 | 3.1–3.3 auth + teams + billing | 2–3 wk | Value capture |

> If bandwidth is tight, the **minimum viable pivot** is steps 1–3 + 5–6: secure it, share the
> engine, ship DTCG export + an MCP server. That alone repositions UI Chroma from "palette tool"
> to "vibe-coding theme layer" without the full migration — though the migration is what makes
> Phase 3 cheap.

## Open decisions (need a call before building)
1. **Migrate to Vercel+Supabase now, or defer** (keep Firebase + just secure/rate-limit)?
2. **Vite SPA vs. Next.js** for the web app — SSR helps SEO permalinks but is a bigger rewrite.
3. **Monorepo tooling** — pnpm workspaces vs. Turborepo.
4. **MCP-first vs. web-first launch** ordering for marketing.
