-- Indexes for the queries that run on every visit rather than every report.
--
-- These lookups are all "find the row matching this id", which Postgres has
-- been answering with a full table scan. Invisible at a few dozen rows and
-- a real problem at fifty thousand, so they go in before paid traffic
-- arrives rather than after something gets slow.

-- Checked on every single recipient page load, to decide whether she has
-- already answered.
create index if not exists answers_link_id_idx on public.answers (link_id);

-- Every Stripe webhook looks a purchase up by its session id to mark it
-- paid. A scan here delays granting credits after a payment.
create index if not exists purchases_session_idx on public.purchases (stripe_session_id);

-- The dashboard lists a user's own links and purchases; campaign_report
-- joins both back to users.
create index if not exists links_creator_idx on public.links (creator_id);
create index if not exists purchases_user_idx on public.purchases (user_id);

-- Resolving /d/[slug] and /r/[slug]. Usually already covered by the unique
-- constraint on slug, but stated explicitly so it can't be missing.
create index if not exists links_slug_idx on public.links (slug);
