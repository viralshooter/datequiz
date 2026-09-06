-- Aggiunge l'email di "lui" catturata in fase di creazione del link,
-- usata per la notifica quando lei risponde (vedi src/lib/email.ts).

alter table public.links
  add column if not exists notify_email text not null default '';
