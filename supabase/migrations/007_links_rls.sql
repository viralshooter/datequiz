-- 007 — close public enumeration of the links table
--
-- "links public read" was `using (true)`, written so the recipient page
-- could load a link by slug without a login. But a permissive SELECT
-- policy doesn't restrict the query to one slug: with the anon key —
-- which is public and ships inside the browser bundle — anyone could run
--
--     select slug, match_name, personal_note, notify_email from links
--
-- and walk the whole table. That is every invitee's name, every private
-- line someone wrote to them, and every sender's email address.
--
-- Nothing actually depended on it. The pages that serve strangers
-- (/d/[slug], its OG image, /r/[slug]) all read through the service role,
-- which bypasses RLS entirely. Only the owner's own dashboard and account
-- pages read as the user, so that is all the policy needs to permit.

drop policy if exists "links public read" on public.links;

create policy "links select own" on public.links
  for select using (auth.uid() = creator_id);
