-- DateQuiz — schema Postgres/Supabase
-- Esegui questo file nel SQL editor di Supabase (o via `supabase db push`).

create extension if not exists "pgcrypto";

-- ============================================================
-- users
-- Mirror di auth.users. Una riga viene creata (via trigger) per
-- ogni sessione, inclusa quella anonima creata da supabase-js
-- quando "lui" apre l'app per generare un link.
-- ============================================================
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  credits integer not null default 1,
  remove_watermark boolean not null default false,
  created_at timestamptz not null default now()
);

-- crea automaticamente la riga public.users quando nasce un auth.users
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ============================================================
-- links
-- Un link = un invito generato da "lui" per una persona ("lei").
-- ============================================================
create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  creator_id uuid not null references public.users (id) on delete cascade,
  match_name text not null,
  available_days text[] not null,
  watermark_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists links_creator_id_idx on public.links (creator_id);

-- ============================================================
-- answers
-- Risposta di "lei" a un link. Una sola risposta per link.
-- Si arriva qui solo passando dal SÌ: non esiste un ramo "no".
-- ============================================================
create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null unique references public.links (id) on delete cascade,
  selected_activities text[] not null default '{}', -- cena | drink | sport | esperienza | cultura | outdoor
  selected_days text[] not null default '{}',
  responded_at timestamptz not null default now()
);

-- ============================================================
-- events
-- Tracking funnel: link_created, link_opened, answered_yes,
-- activities_selected, badge_clicked, checkout_started,
-- purchase_completed.
-- ============================================================
create table if not exists public.events (
  id bigint generated always as identity primary key,
  event_type text not null,
  slug text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists events_type_idx on public.events (event_type);
create index if not exists events_slug_idx on public.events (slug);
create index if not exists events_created_at_idx on public.events (created_at);

-- ============================================================
-- purchases
-- Storico ordini Stripe (crediti / rimozione watermark).
-- ============================================================
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  package text not null,                 -- pack_3 | pack_10 | remove_watermark
  stripe_session_id text unique,
  status text not null default 'pending',-- pending | completed
  credits_granted integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists purchases_user_id_idx on public.purchases (user_id);

-- ============================================================
-- Row Level Security
-- Le scritture "sensibili" (answers, events, purchases, credits)
-- passano tutte da route handler server-side con la service role
-- key, quindi qui esponiamo solo le select pubbliche necessarie
-- al rendering (quiz, OG image, pagina risultato) e le policy
-- minime per "lui" autenticato in anonimo.
-- ============================================================
alter table public.users enable row level security;
alter table public.links enable row level security;
alter table public.answers enable row level security;
alter table public.events enable row level security;
alter table public.purchases enable row level security;

create policy "users select own row" on public.users
  for select using (auth.uid() = id);

create policy "users update own row" on public.users
  for update using (auth.uid() = id);

-- i link sono leggibili pubblicamente (lo slug è un token
-- imprevedibile: serve per il quiz di lei, la OG image e la
-- pagina risultato di lui, tutte senza login).
create policy "links public read" on public.links
  for select using (true);

create policy "links insert by owner" on public.links
  for insert with check (auth.uid() = creator_id);

-- answers/events/purchases: nessuna policy anon insert/select ->
-- accesso solo via service role nei route handler (RLS default-deny).
