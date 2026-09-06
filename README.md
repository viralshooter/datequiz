# Yeslink

Un ragazzo genera un link personalizzato per un match; lei apre il link,
le viene chiesto "Esci con me?" (il NO scappa dal cursore/dito, l'unica
via avanti è il SÌ), poi sceglie cosa le va di fare e quando.

Stack: **Next.js 15 (App Router) + TypeScript + Tailwind + Supabase
(Postgres + auth anonima)**, deploy su **Vercel**.

## Struttura del prodotto

- **Flusso A** (`/`, lui) — inserisce il nome, sceglie i giorni
  disponibili, genera il link.
- **Flusso B** (`/d/[slug]`, lei) — hero giocosa → "Esci con me?" a
  schermo intero (il NO evade al mouse/tocco, il SÌ cresce ad ogni fuga,
  non esiste ramo "no") → celebrazione → griglia di 6 attività
  (selezione multipla) → selezione giorni → riepilogo e conferma finale.
- **Flusso C** (`/r/[slug]`, lui, privato) — attività scelte + giorni in
  comune.
- **Admin** (`/admin`) — dashboard minimale con i tassi di conversione del
  funnel, protetta da password.

## File da editare per cambiare il contenuto

- `src/config/content.ts` — le 6 attività (`cena`, `drink`, `sport`,
  `esperienza`, `cultura`, `outdoor`), i messaggi di celebrazione dopo il
  SÌ, e il tuning del bottone SÌ/NO (crescita del SÌ, raggio di fuga del
  NO).
- `src/config/pricing.ts` — i pacchetti in vendita quando i pagamenti sono
  attivi.

## Setup

### 1. Supabase

1. Crea un progetto su [supabase.com](https://supabase.com).
2. **Authentication → Providers → Anonymous sign-ins**: abilitalo (serve
   per dare a "lui" un'identità stabile senza login, per i crediti).
3. **SQL Editor**: esegui il contenuto di `supabase/schema.sql`. Crea le
   tabelle `users`, `links`, `answers`, `events`, `purchases`, il trigger
   che popola `public.users` alla creazione di ogni sessione (anche
   anonima), e le policy RLS minime. Se hai già un progetto con lo schema
   precedente (quiz a domande), esegui invece
   `supabase/migrations/001_remove_quiz_add_activities.sql`.
4. Copia `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e
   `SUPABASE_SERVICE_ROLE_KEY` da Project Settings → API.

### 2. Variabili d'ambiente

Copia `.env.local.example` in `.env.local` e compila i valori. Con
`NEXT_PUBLIC_PAYMENTS_ENABLED=false` l'app è gratuita e illimitata: puoi
saltare la configurazione Stripe in fase di validazione.

### 3. Avvio locale

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

### 4. Stripe (solo se `PAYMENTS_ENABLED=true`)

1. Crea 3 prezzi in Stripe (pagamento singolo, non ricorrente): 3 link
   €4,99, 10 link €9,99, rimozione watermark €2,99. Metti i loro Price ID
   in `STRIPE_PRICE_PACK_3`, `STRIPE_PRICE_PACK_10`,
   `STRIPE_PRICE_REMOVE_WATERMARK`.
2. Configura un webhook verso `/api/stripe/webhook` sull'evento
   `checkout.session.completed`, e metti il signing secret in
   `STRIPE_WEBHOOK_SECRET`. In locale usa `stripe listen --forward-to
   localhost:3000/api/stripe/webhook`.
3. Alla conferma del pagamento, il webhook accredita i crediti (o rimuove
   il watermark) sull'utente Supabase associato alla sessione di checkout.

### 5. Deploy su Vercel

Importa la repo, imposta le stesse variabili d'ambiente in Project
Settings → Environment Variables, e imposta `NEXT_PUBLIC_SITE_URL` con il
dominio di produzione (serve per i link generati e le OG image).

## Monetizzazione

Il feature flag `NEXT_PUBLIC_PAYMENTS_ENABLED` governa tutto:

- `false` (default, fase di validazione): crediti ignorati, nessun
  paywall, link illimitati.
- `true`: ogni link creato scala 1 credito da `public.users.credits`
  (default 1, cioè il primo link è gratis); a 0 crediti compare la
  paywall con i pacchetti Stripe Checkout.

Il badge virale "creato con DateQuiz" compare sulla pagina di risposta di
lei finché `links.watermark_enabled` è true (diventa false quando lui
acquista la rimozione watermark). Il click sul badge e la CTA "vuoi farlo
al tuo prossimo match?" portano alla home con UTM di provenienza, per
misurare il loop di acquisizione lato femminile.

## Tracking

Ogni step del funnel scrive una riga in `public.events` (vedi
`src/lib/events.ts` per l'elenco completo). `/admin` mostra i conteggi e
i tassi di conversione tra uno step e il successivo; il login è protetto
da `ADMIN_DASHBOARD_PASSWORD`.

Deploy automatico attivo tramite GitHub + Vercel.
