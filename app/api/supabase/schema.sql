-- Run this SQL in your Supabase project's SQL editor

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Users table
create table if not exists public.users (
  id text primary key,
  email text unique,
  display_name text,
  photo_url text,
  email_verified boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  last_login_at timestamptz
);

-- Tests table
create table if not exists public.tests (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  wpm integer not null,
  raw_wpm integer,
  accuracy numeric,
  consistency numeric,
  characters integer,
  errors integer,
  duration integer not null,
  test_type text,
  test_mode text,
  time_seconds integer,
  text_content text,
  created_at timestamptz not null default now()
);

-- Optional: leaderboard view (best per user per mode in last 24h) or top recent
create or replace view public.tests_view_leaderboard as
select 
  t.id,
  t.user_id,
  coalesce(u.display_name, split_part(u.email, '@', 1)) as username,
  u.display_name,
  t.wpm,
  t.accuracy,
  t.characters,
  t.errors,
  t.test_type,
  t.test_mode,
  t.time_seconds,
  t.created_at
from public.tests t
join public.users u on u.id = t.user_id
where t.created_at >= now() - interval '7 days';

-- Indexes for performance
create index if not exists idx_tests_user_id_created_at on public.tests(user_id, created_at desc);
create index if not exists idx_tests_mode_wpm on public.tests(test_mode, time_seconds, wpm desc);

-- RLS policies
alter table public.users enable row level security;
alter table public.tests enable row level security;

-- Users: owner can select/update their row
create policy if not exists users_owner_select on public.users
  for select using (auth.uid()::text = id);
create policy if not exists users_owner_upsert on public.users
  for insert with check (auth.uid()::text = id);
create policy if not exists users_owner_update on public.users
  for update using (auth.uid()::text = id);
create policy if not exists users_owner_delete on public.users
  for delete using (auth.uid()::text = id);

-- Tests: owner can insert/select own; public read for leaderboard (select only)
create policy if not exists tests_owner_insert on public.tests
  for insert with check (auth.uid()::text = user_id);
create policy if not exists tests_owner_select on public.tests
  for select using (auth.uid()::text = user_id);
create policy if not exists tests_public_select on public.tests
  for select using (true);


