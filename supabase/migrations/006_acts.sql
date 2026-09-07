-- 006 — 3-act recipient flow
--
-- links.seed        drives every random pick on /d/[slug] (see lib/prng.ts),
--                   so a reload replays the same path and rare outcomes
--                   can't be farmed by refreshing.
-- links.mode        soft | chaos | roulette — weights twist selection.
--
-- answers now records the richer output of the new flow: a ranked
-- preference order from the tournament (rather than a flat multi-select),
-- the condition she imposed back on him, and which ending she landed on.

alter table public.links
  add column if not exists seed integer not null default 0,
  add column if not exists mode text not null default 'chaos';

-- Links created before this migration have no seed. Give each one its own
-- so old links don't all replay an identical path.
update public.links set seed = floor(random() * 2147483647)::int where seed = 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'links_mode_check'
  ) then
    alter table public.links
      add constraint links_mode_check check (mode in ('soft', 'chaos', 'roulette'));
  end if;
end $$;

alter table public.answers
  -- Full ranked order from the Act 2 tournament, best first.
  add column if not exists activity_ranking text[] not null default '{}',
  -- The condition she attached to her yes ("fine, but you're paying").
  add column if not exists counter_condition text not null default '',
  -- classic | blind | rare — which final screen she reached.
  add column if not exists ending_type text not null default 'classic',
  -- Set only by the rare "veto" jolly card.
  add column if not exists vetoed_activity text not null default '',
  -- False on the blind ending: he gets the day, not the activity.
  add column if not exists reveal_activities boolean not null default true;
