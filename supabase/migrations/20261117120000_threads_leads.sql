-- Threads lead finder: drafts from public posts land in the review queue as pending events.
-- Run in the Supabase SQL editor. Safe to re-run.

-- 1. Allow source = 'threads'.
-- First check what the current rule allows, and keep every value it already has:
--   select pg_get_constraintdef(oid) from pg_constraint where conname = 'events_source_check';
-- If it lists values besides 'user', add them to the list below before running.
alter table public.events drop constraint if exists events_source_check;
alter table public.events add constraint events_source_check
  check (source in ('user', 'threads'));

-- 2. Who posted the lead (their public handle), for the reviewer
alter table public.events add column if not exists source_author text;

-- 3. One draft per Threads post. Partial, so two user submissions may still share a link
-- (e.g. the same ticket page).
create unique index if not exists events_threads_source_url_key
  on public.events (source_url) where source = 'threads' and source_url is not null;

-- 4. Posts already sent to the model, so later runs skip them.
-- Server-only: RLS on and no policies, so only the service role key can read or write it.
create table if not exists public.lead_seen (
  permalink text primary key,
  is_event  boolean not null,
  seen_at   timestamptz not null default now()
);
alter table public.lead_seen enable row level security;
