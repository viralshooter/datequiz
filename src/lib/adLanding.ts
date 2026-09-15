import type { Attribution } from "./attribution";

/**
 * Records that a campaign-tagged visit actually reached the site.
 *
 * This is the number that was missing. Everything else measures a later or
 * a noisier moment: the ad platform counts a tap (charged whether or not the
 * page ever loads), Vercel's request log counts crawlers alongside people,
 * client analytics needs JavaScript to run, and the users table only fills
 * in once someone reaches /create. None of them answer "how many of the
 * clicks we paid for turned into a real arrival."
 *
 * Written straight over the REST API rather than through supabase-js: this
 * runs in the middleware on every ad click, and the client library is a lot
 * of bundle to drag into the edge for one insert.
 */
export async function recordAdLanding(
  attribution: Attribution,
  userAgent: string
): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;

  try {
    await fetch(`${url}/rest/v1/events`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        event_type: "ad_landing",
        slug: null,
        metadata: {
          utm_source: attribution.utm_source ?? null,
          utm_medium: attribution.utm_medium ?? null,
          utm_campaign: attribution.utm_campaign ?? null,
          utm_content: attribution.utm_content ?? null,
          landing_path: attribution.landing_path ?? null,
          // Kept so crawlers can be told apart from people after the fact.
          // Truncated: a user agent string is not worth unbounded storage.
          ua: userAgent.slice(0, 120),
        },
      }),
    });
  } catch {
    // Measurement must never be the reason a landing page fails to render.
  }
}
