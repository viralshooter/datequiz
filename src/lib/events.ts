import type { SupabaseClient } from "@supabase/supabase-js";

export type EventType =
  | "link_created"
  | "link_opened"
  | "answered_yes"
  // 3-act flow. twist_shown/twist_skipped carry the twist id in metadata:
  // the ratio between them is what tells us which twists to prune.
  | "cold_open_variant"
  // Whether she actually completed the hold before the question, or bailed
  // out — a new interaction with no telemetry is an invisible drop-off.
  | "drumroll_completed"
  | "twist_shown"
  | "twist_skipped"
  | "tournament_completed"
  | "jolly_triggered"
  | "counter_condition_chosen"
  | "ending_type"
  // Kept for historical rows written before the tournament replaced the
  // flat multi-select.
  | "activities_selected"
  | "badge_clicked"
  | "checkout_started"
  | "purchase_completed";

/**
 * Every event the client is allowed to record.
 *
 * Kept separate from the funnel order: /api/events validates against this
 * list, and when the funnel was narrowed to just the conversion steps it
 * silently started rejecting all the diagnostic events — the twist
 * shown/skipped counts that exist specifically to decide what to cut.
 */
export const ALL_EVENT_TYPES: EventType[] = [
  "link_created",
  "link_opened",
  "answered_yes",
  "cold_open_variant",
  "drumroll_completed",
  "twist_shown",
  "twist_skipped",
  "tournament_completed",
  "jolly_triggered",
  "counter_condition_chosen",
  "ending_type",
  "activities_selected",
  "badge_clicked",
  "checkout_started",
  "purchase_completed",
];

/** Ordine canonico del funnel, usato per calcolare i tassi di conversione in /admin. */
export const EVENT_FUNNEL_ORDER: EventType[] = [
  "link_created",
  "link_opened",
  "answered_yes",
  "tournament_completed",
  "counter_condition_chosen",
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
