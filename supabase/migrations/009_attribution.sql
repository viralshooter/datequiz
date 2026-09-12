-- Ad attribution.
--
-- First-touch, stored on the user rather than on every event: the question
-- being answered is "which campaign produced this customer", and a customer
-- has exactly one origin. Links and purchases both carry creator_id/user_id,
-- so cost-per-link and revenue-per-campaign are a join away without
-- duplicating the campaign onto every row.

alter table public.users add column if not exists utm_source text;
alter table public.users add column if not exists utm_medium text;
alter table public.users add column if not exists utm_campaign text;
alter table public.users add column if not exists utm_content text;
alter table public.users add column if not exists utm_term text;
alter table public.users add column if not exists referrer text;
alter table public.users add column if not exists landing_path text;
alter table public.users add column if not exists attributed_at timestamptz;

-- What was actually charged, captured at purchase time. Deriving revenue
-- from the current price list would silently rewrite history the first time
-- a price changes.
alter table public.purchases add column if not exists amount_cents integer;
alter table public.purchases add column if not exists currency text;

-- Backfill the purchases made so far from the prices in effect when they
-- were taken, so revenue totals don't start with a hole.
update public.purchases set amount_cents = 499, currency = 'usd'
  where amount_cents is null and package = 'pack_3';
update public.purchases set amount_cents = 999, currency = 'usd'
  where amount_cents is null and package = 'pack_10';
update public.purchases set amount_cents = 299, currency = 'usd'
  where amount_cents is null and package = 'remove_watermark';

-- The dashboard filters everything by a date window; without these every
-- tile is a sequential scan.
create index if not exists events_created_at_idx on public.events (created_at desc);
create index if not exists events_type_created_idx on public.events (event_type, created_at desc);
create index if not exists links_created_at_idx on public.links (created_at desc);
create index if not exists purchases_created_at_idx on public.purchases (created_at desc);
create index if not exists users_campaign_idx on public.users (utm_campaign);

-- Per-campaign report, aggregated in the database: the dashboard would
-- otherwise have to pull every user row on each load just to group them.
--
-- Cohort semantics — rows are grouped by the campaign that brought the user
-- in, counting people who ARRIVED in the window. Someone who arrived last
-- month and bought today is credited to last month's campaign, which is what
-- makes "what did this campaign earn" answerable at all.
create or replace function public.campaign_report(p_since timestamptz)
returns table (
  campaign text,
  source text,
  signups bigint,
  links bigint,
  purchases bigint,
  revenue_cents bigint
)
language sql
security definer
set search_path = public
as $$
  select
    coalesce(nullif(u.utm_campaign, ''), '(none)') as campaign,
    coalesce(
      nullif(u.utm_source, ''),
      case when u.referrer is not null then 'referral' else 'direct' end
    ) as source,
    count(distinct u.id) as signups,
    count(distinct l.id) as links,
    count(distinct p.id) filter (where p.status = 'completed') as purchases,
    coalesce(sum(p.amount_cents) filter (where p.status = 'completed'), 0) as revenue_cents
  from public.users u
  left join public.links l on l.creator_id = u.id
  left join public.purchases p on p.user_id = u.id
  where u.created_at >= p_since
  group by 1, 2
  order by revenue_cents desc, links desc;
$$;
