import type { SupabaseClient } from "@supabase/supabase-js";

export type EventType =
  | "link_created"
  | "link_opened"
  | "answered_yes"
  | "activities_selected"
  | "badge_clicked"
  | "checkout_started"
  | "purchase_completed";

/** Ordine canonico del funnel, usato per calcolare i tassi di conversione in /admin. */
export const EVENT_FUNNEL_ORDER: EventType[] = [
  "link_created",
  "link_opened",
  "answered_yes",
  "activities_selected",
  "badge_clicked",
  "checkout_started",
  "purchase_completed",
];

/** Da usare nei componenti client: fire-and-forget, non blocca la UI. */
export function trackEvent(
  eventType: EventType,
  slug?: string,
  metadata?: Record<string, unknown>
) {
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event_type: eventType, slug, metadata }),
    keepalive: true,
  }).catch(() => {
    // il tracking non deve mai rompere l'esperienza utente
  });
}

/** Da usare in route handler / webhook già in possesso di un client admin. */
export async function trackEventServer(
  admin: SupabaseClient,
  eventType: EventType,
  slug?: string,
  metadata?: Record<string, unknown>
) {
  await admin.from("events").insert({
    event_type: eventType,
    slug: slug ?? null,
    metadata: metadata ?? {},
  });
}
