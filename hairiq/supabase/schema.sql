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

-- ---------------------------------------------------------------------------
-- Paid $1.99 Blueprint purchases (rev 14). One row per successful payment.
-- Stripe stays the money system of record; this is the readable customer
-- ledger that sits next to hairiq_subscribers so nothing is scattered.
--   stripe_session_id — unique; also the idempotency key for the receipt email
--   email             — buyer's email (from Stripe checkout)
--   fingerprint       — hash of the exact quiz answers this payment unlocked
--   answers           — the quiz answers themselves, for support/insight
--   amount_cents      — what they actually paid (199)
--   paid_at           — when the payment completed
-- ---------------------------------------------------------------------------
create table if not exists public.hairiq_purchases (
  id bigint generated always as identity primary key,
  stripe_session_id text unique not null,
  email text not null,
  fingerprint text,
  answers jsonb,
  amount_cents integer,
  currency text default 'usd',
  livemode boolean default false,
  receipt_sent boolean default false,
  paid_at timestamptz not null default now()
);

create index if not exists hairiq_purchases_email_idx on public.hairiq_purchases (email);

alter table public.hairiq_purchases enable row level security;
