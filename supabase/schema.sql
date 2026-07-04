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
  style         jsonb,                           -- non-color style (fonts, type scale, radius, density, elevation); nullable for legacy
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

-- Owners can read their own themes (incl. private ones) and update them. Writes currently go
-- through the Express API with the service-role key (which bypasses RLS); these policies are
-- defense-in-depth + enable future direct-from-client access.
drop policy if exists "owners read their themes" on themes;
create policy "owners read their themes"
  on themes for select
  using (auth.uid() = user_id);

drop policy if exists "owners update their themes" on themes;
create policy "owners update their themes"
  on themes for update
  using (auth.uid() = user_id);

-- --- Teams (Phase 3.2): shared brand library ---
create table if not exists teams (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  owner_id     uuid not null,                 -- references auth.users
  invite_code  text unique not null,          -- shareable join link code
  created_at   timestamptz not null default now()
);

create table if not exists team_members (
  team_id    uuid not null references teams(id) on delete cascade,
  user_id    uuid not null,                   -- references auth.users
  role       text not null default 'member',  -- 'owner' | 'member'
  created_at timestamptz not null default now(),
  primary key (team_id, user_id)
);
create index if not exists team_members_user_idx on team_members (user_id);

alter table themes add column if not exists team_id uuid references teams(id) on delete set null;
create index if not exists themes_team_idx on themes (team_id);

-- RLS on with no permissive policies: teams/team_members are reachable only via the
-- service-role Express API (which bypasses RLS). The API enforces membership in code.
alter table teams enable row level security;
alter table team_members enable row level security;
