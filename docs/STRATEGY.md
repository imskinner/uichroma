# UI Chroma — Pivot Strategy

_Last updated: 2026-06-14_

## TL;DR

UI Chroma today is a high-quality **AI color-palette generator**. That category is
commoditized (Coolors, Khroma, Huemint, Adobe Color) and has near-zero willingness to pay.
But the same engine — vibe → validated, semantic, structured, exportable token system — is
80% of the way to solving a **large, unmet, growing pain**: AI-generated UIs ("vibe coding"
with v0, Lovable, Bolt, Figma Make, Stitch) all look **identical** (shadcn defaults, Inter,
blue→purple gradients). The market consensus is that the cure is **stronger constraints and
token-driven design systems fed to the AI up front**.

> **New positioning:** UI Chroma is the **brand/theme constraint layer for vibe coding** —
> describe your brand once and get a complete, accessible, AI-ready design-token system that
> makes v0 / Lovable / Cursor / Claude Code generate **your** UI instead of everyone else's.

We are not pivoting the engine. We are repackaging it as an **MCP-delivered, DTCG-formatted,
full-theme constraint pack**, plus the accounts / rate-limiting / persistence hygiene needed
to be a real product.

---

## 1. Where we are (product audit)

**Strong:**
- Two-stage generation: GPT-4o produces an 8-role semantic palette (primary, secondary,
  accent, warning, danger, success, info, derived neutral); a deterministic `scorePalette()`
  flags violations (hue separation, saturation, accent red-zone, lightness spread); a GPT-4o
  **critique call** repairs only flagged colors and is accepted **only if it scores higher**.
  This self-correcting loop is the real moat — most palette tools have nothing like it.
- Output is already developer-shaped: CSS vars, SCSS, Tailwind config, JSON, each with 10-step
  tonal ramps. Figma plugin v2 turns a permalink into Paint Styles + component variants.

**Gaps (operational, not conceptual):**
- No auth / accounts / saved themes — palettes vanish on navigation.
- **No rate limiting** on `/generatePalette` → uncapped OpenAI spend (critique doubles cost).
- **Hard-coded credential file** (`server.js:13` `require()`d a `*-adminsdk-*.json`). Git history is clean and the file is gitignored — _not_ leaked — but the hard require crashes startup when the file is absent and can't work on Vercel (you can't ship a gitignored file). _Fixed 2026-06-14: now loads from `FIREBASE_SERVICE_ACCOUNT` / `applicationDefault()`._
- Core color math triplicated across `server.js`, `functions/index.js`, `client/src/lib/color-utils.ts`.
- MD5 permalinks (not human/SEO-friendly); single-shot palettes only; light mode only; no WCAG checking.

**Maturity: ~70% of a polished _niche_ tool — for the wrong niche.**

## 2. Market (mid-2026)

**Commodity we should exit competing in:** raw palette generation. Incumbents own the "I need
a palette" moment and charge ~nothing.

**Opportunity we should enter:** the vibe-coding differentiation gap.
- v0, Lovable, Bolt, Figma Make, Stitch turn prompts into working UIs in minutes — and they all
  converge on the same generic aesthetic. "Nobody is impressed by 'I made a prototype with AI'
  anymore."
- The fix the market is converging on: **design tokens + constraints fed to the agent**, in
  portable formats (DTCG / W3C / Style Dictionary), delivered over **MCP** — now the de-facto
  transport (17k+ servers, Figma↔Claude/Cursor token bridges already shipping).

**Sources:** see the analysis thread / `docs/` market notes (EPAM, NxCode, Muzli, The Crit,
MindStudio, Boldare, Vibehackers, Design Bootcamp).

## 3. The wedge

Our real asset is not the colors — it's that we produce a **validated, semantic, structured,
multi-format token system from one sentence**. That is exactly the input the vibe-coding
ecosystem is starving for, and no palette incumbent is positioned to deliver it (they output
swatches, not agent-consumable systems).

**Differentiators we can defend:**
1. **Tool-agnostic** brand layer that feeds _all_ codegen tools (vs. Figma/v0 locking you in).
2. **Scored + critiqued** generation quality (our existing loop), extended to full token sets.
3. **Accessibility as a generation constraint** (WCAG AA/AAA), not an afterthought.

## 4. Strategy in three phases

| Phase | Theme | Outcome |
|-------|-------|---------|
| **1** | Become consumable by AI agents | MCP server + DTCG export + `AGENTS.md`/skill generator. Meet vibe coders inside their tools. |
| **2** | Palette → theme system | Add type scale, spacing, radii, shadows, light+dark, WCAG. Become a _design-system_ generator. |
| **3** | Productize & defend | Auth + saved/team themes, rate limiting (urgent), human-readable permalinks, billing. |

Sequencing rationale: Phase 1 converts the existing engine into a vibe-coding tool with minimal
new ML work and unlocks distribution. Phase 2 deepens the artifact so it actually de-generic-ifies
a UI (color alone doesn't). Phase 3 captures value and removes liabilities. **Rate limiting and
the committed-key fix jump the queue — they are launch-blockers regardless of phase.**

## 5. Recommended stack change (optional but advised)

Migrate off the dual Firebase deployment (Express `server.js` **and** duplicated
`functions/index.js`) to **Vercel + Supabase**:
- **Vercel** is where the vibe-coding audience lives (v0 is Vercel); great DX, serverless/edge,
  natural SSR home for SEO-friendly permalink pages.
- **Supabase** (Postgres + Auth + Row-Level-Security + storage) cleanly solves the accounts gap,
  suits relational theme/token/team data, and removes the committed-service-account-key liability.
- Collapses the duplicated server/function code into one API surface.

Lower-churn alternative if we want to defer: keep the Vite SPA, deploy to Vercel as static +
Vercel Functions, migrate only the DB to Supabase. See `PIVOT-PLAN.md §0`.

## 6. Business model (where value is captured)

- **Free:** generate a theme, export, share permalink.
- **Pro (subscription):** save your brand, regenerate, full token system, MCP access to _your_
  saved themes, private themes.
- **Team:** shared brand library, seats, governance.
- MCP "pull my brand at generation time" is the natural paid hook — it's recurring and sticky.

## 7. Risks

- **Platform absorption** (Figma Make / v0 add native theming). Defense: tool-agnostic + generation quality.
- **MCP-as-distribution is early.** Pair it with at least one "works today" web surface.
- **Don't over-build ML.** Extend the existing scoring loop; don't rebuild it.
- **Biggest near-term risk is operational:** uncapped OpenAI spend + leaked key. Fix first.

## 8. Success metrics

- Phase 1: MCP server installed in N projects; themes pulled via MCP/week.
- Phase 2: % of generated themes exported in DTCG; light+dark + WCAG pass rate.
- Phase 3: signups → saved themes → Pro conversion; weekly active brands.
