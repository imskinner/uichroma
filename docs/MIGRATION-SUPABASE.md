# Runbook — Migrate to Supabase + Vercel

The code is done (Express keeps its routes; only the data layer changed Firestore → Supabase, and
the repo is now an npm-workspaces monorepo that builds on Vercel). These are the steps **you** run,
since they need a Supabase project and live credentials.

## 1. Create the Supabase project
1. Create a project at <https://supabase.com>.
2. From **Project Settings → API**, copy:
   - Project URL → `SUPABASE_URL`
   - `anon` `public` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**secret — server-side only**)

## 2. Create the schema
In the Supabase **SQL editor**, paste and run [`supabase/schema.sql`](../supabase/schema.sql).
This creates the `themes` table (with the existing `permalink` preserved) + the public-read RLS policy.

## 3. Configure env
Local — add to `.env` (see `.env.example`):
```
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
SUPABASE_ANON_KEY=<anon key>
```
Production — set the same three in **Vercel → Project → Settings → Environment Variables**
(plus the existing `API_KEY` for OpenAI). Use the service-role key only as a server env var.

## 4. Migrate existing data (Firestore → Supabase)
Needs Firestore read creds **and** the Supabase service-role key in your env:
```
# Firestore read (one of):
GOOGLE_APPLICATION_CREDENTIALS=./ui-chroma-app-firebase-adminsdk-*.json
# or FIREBASE_SERVICE_ACCOUNT=<the JSON as one line>

npm run migrate          # upserts every palette into Supabase; safe to re-run
```

## 5. Verify locally
```
npm run dev              # Express :3000 + Vite :5173
```
- Generate a new palette (writes to Supabase).
- Open an existing permalink (reads from Supabase — confirms the migration worked).
- Edit + save a color (updates Supabase).

## 6. Deploy to Vercel
- Push to `main` (the linked `ui-chroma` Vercel project builds automatically), or `vercel --prod`.
- **Verify the preview build first** — `vercel.json` was modernized (SPA served from `client/dist`,
  API routed to the `/api` Express function). The routing rewrites are the part most worth checking
  on a preview URL before promoting to production.

## 7. Decommission Firebase (only after parity is confirmed)
Once production runs on Supabase and reads/writes check out, remove the legacy bits:
`functions/`, `firebase.json`, `firestore.rules`, `firestore.indexes.json`, the `firebase-admin`
dependency, and the migration script. (Left in place now as a safety net.)

## Rollback
Nothing is deleted yet, so reverting this branch restores the Firestore-backed Express app.
