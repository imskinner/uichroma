-- UI Chroma — Supabase schema. Run this once in the Supabase SQL editor (or via the CLI)
-- against a fresh project, then run `npm run migrate` to import existing Firestore palettes.
--
-- Design notes:
--   * `permalink` preserves the existing MD5 ids so all current /palette/<permalink> links and
--     the Figma plugin keep working after the migration.
--   * `slug` and `user_id` are nullable now and reserved for Phase 3 (human-readable URLs + auth).
--   * Writes happen server-side with the service-role key (which bypasses RLS); the public-read
--     policy below is what the anon key (and Phase 3 direct client reads) will rely on.

create extension if not exists pgcrypto; -- for gen_random_uuid()

create table if not exists themes (
  id            uuid primary key default gen_random_uuid(),
  permalink     text unique not null,           -- existing MD5 id (kept for backwards compat)
  slug          text unique,                     -- human-readable, nullable until Phase 3
  user_id       uuid,                            -- owner, nullable until Phase 3 auth
  keywords      text,                            -- the prompt the theme was generated from
  colors        jsonb not null,                  -- the 8-role palette object
  ai_response   text,                            -- raw model JSON
  is_public     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz
);

create index if not exists themes_permalink_idx on themes (permalink);
create index if not exists themes_slug_idx on themes (slug);

alter table themes enable row level security;

-- Public can read public themes (the anon key relies on this; service-role bypasses RLS).
drop policy if exists "public themes are readable" on themes;
create policy "public themes are readable"
  on themes for select
  using (is_public = true);
