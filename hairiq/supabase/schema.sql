-- How Is My Hair — newsletter signups (spec §12).
-- Run this ONCE in your Supabase project: Dashboard → SQL Editor → paste → Run.

create table if not exists public.hairiq_subscribers (
  id bigint generated always as identity primary key,
  email text unique not null,
  tiers text[] not null,
  zip text,
  created_at timestamptz not null default now()
);

-- Lock the table down: the app writes with the service-role key (which
-- bypasses RLS); nothing should be readable with the public anon key.
alter table public.hairiq_subscribers enable row level security;
