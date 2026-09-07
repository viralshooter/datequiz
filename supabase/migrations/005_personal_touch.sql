-- The page she opens was fully templated apart from her name, which is
-- exactly what makes a link read as spam. These two let the sender put
-- something only he could have written on it.

alter table public.links
  add column if not exists sender_name text not null default '',
  add column if not exists personal_note text not null default '';
