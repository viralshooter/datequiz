/**
 * Feature flag monetizzazione.
 * - false (fase di validazione): tutto gratis e illimitato, nessun credito scalato.
 * - true: si applicano i crediti (tabella users.credits) e il paywall Stripe.
 *
 * Letto lato client (NEXT_PUBLIC_*) e lato server allo stesso modo,
 * così UI e API restano sempre coerenti.
 */
export const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";
