-- Optional Instagram handle of the sender, shown to her (hero, link
-- preview) so she can tell who sent the link instead of assuming spam.

alter table public.links
  add column if not exists instagram_handle text not null default '';
