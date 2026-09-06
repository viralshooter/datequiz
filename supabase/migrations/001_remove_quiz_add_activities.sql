-- Migrazione: rimuove il vecchio quiz a 5 domande / verdetto e introduce
-- la selezione di attività. Da eseguire nel SQL editor di un progetto
-- Supabase che ha già applicato lo schema.sql precedente.

alter table public.links
  drop column if exists question_ids;

alter table public.answers
  drop column if exists question_answers,
  drop column if exists verdict_category,
  drop column if exists said_yes,
  drop column if exists no_count,
  add column if not exists selected_activities text[] not null default '{}';
