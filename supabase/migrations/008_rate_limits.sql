-- 008 — rate limiting for link creation and admin login
--
-- Both endpoints run on Vercel's serverless functions, which don't share
-- memory between invocations, so an in-process counter would reset on
-- every cold start and protect nothing. Postgres is the one thing every
-- invocation already talks to, so the counter lives there instead.
--
-- check_rate_limit is a single atomic UPSERT: concurrent callers for the
-- same key serialize on that row's lock rather than racing to read-then-
-- write, so it can't be defeated by firing requests in parallel.

create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 1,
  window_start timestamptz not null default now()
);

alter table public.rate_limits enable row level security;
-- No policies: every access goes through check_rate_limit below (security
-- definer, so it runs with the table owner's privileges regardless of
-- RLS) or the service-role admin client, which bypasses RLS entirely.

create or replace function public.check_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.rate_limits (key, count, window_start)
  values (p_key, 1, now())
  on conflict (key) do update
    set
      count = case
        when public.rate_limits.window_start < now() - (p_window_seconds || ' seconds')::interval
          then 1
        else public.rate_limits.count + 1
      end,
      window_start = case
        when public.rate_limits.window_start < now() - (p_window_seconds || ' seconds')::interval
          then now()
        else public.rate_limits.window_start
      end
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;

-- Old rows never stop accumulating on their own; sweep anything whose
-- window closed over a day ago whenever a check happens to run.
create or replace function public.prune_rate_limits()
returns void
language sql
security definer set search_path = public
as $$
  delete from public.rate_limits where window_start < now() - interval '1 day';
$$;
