import type { SupabaseClient } from "@supabase/supabase-js";
import { ATTRIBUTION_COOKIE, parseAttribution, type Attribution } from "./attribution";

/**
 * Copies the campaign cookie onto the user row, once.
 *
 * Kept out of `attribution.ts` so the middleware — which runs on every
 * request — doesn't pull a database client into its bundle.
 *
 * Best-effort by design: losing a campaign label must never be the reason a
 * link fails to be created or a checkout can't start.
 */
export async function persistAttribution(
  admin: SupabaseClient,
  userId: string,
  cookieValue: string | undefined
): Promise<void> {
  const attribution = parseAttribution(cookieValue);
  if (!attribution) return;

  try {
    const { data: existing } = await admin
      .from("users")
      .select("attributed_at")
      .eq("id", userId)
      .maybeSingle();

    // First touch wins. A customer has one origin; overwriting it on a later
    // visit would quietly credit whichever campaign they saw most recently.
    if (existing?.attributed_at) return;

    await admin
      .from("users")
      .update({
        utm_source: attribution.utm_source ?? null,
        utm_medium: attribution.utm_medium ?? null,
        utm_campaign: attribution.utm_campaign ?? null,
        utm_content: attribution.utm_content ?? null,
        utm_term: attribution.utm_term ?? null,
        referrer: attribution.referrer ?? null,
        landing_path: attribution.landing_path ?? null,
        attributed_at: new Date().toISOString(),
      })
      .eq("id", userId);
  } catch (error) {
    console.error("could not persist attribution", error);
  }
}

/** Convenience for route handlers that already have the request's cookies. */
export function attributionCookieValue(
  cookies: { get(name: string): { value: string } | undefined }
): string | undefined {
  return cookies.get(ATTRIBUTION_COOKIE)?.value;
}

export type { Attribution };
