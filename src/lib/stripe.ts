import Stripe from "stripe";

let client: Stripe | null = null;

/** Client Stripe lato server. Usato solo quando PAYMENTS_ENABLED=true. */
export function getStripeClient(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY non configurata");
    client = new Stripe(key, { apiVersion: "2026-08-26.dahlia" });
  }
  return client;
}
