-- Google Places terms: cached lat/lng may be kept for at most 30 days.
-- The app already ignores rows older than 30 days; this deletes them daily.
-- Safe to re-run: cron.schedule with an existing job name replaces that job.

create extension if not exists pg_cron with schema pg_catalog;

-- Speeds up both this purge and the app's "fetched_at >= since" cache lookup
create index if not exists places_cache_fetched_at_idx on public.places_cache (fetched_at);

-- 19:00 UTC = 03:00 Malaysia time (quiet hours)
select cron.schedule(
  'purge-places-cache',
  '0 19 * * *',
  $$ delete from public.places_cache where fetched_at < now() - interval '30 days' $$
);
