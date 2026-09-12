export const ATTRIBUTION_COOKIE = "yeslink_attr";

/** 90 days: long enough to cover someone who sees an ad, leaves, and comes
 *  back to actually send a link days later. */
export const ATTRIBUTION_MAX_AGE = 60 * 60 * 24 * 90;

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  landing_path?: string;
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

/** Values land in a cookie and then in the database; a campaign name is a
 *  short label, and anything longer is either a mistake or someone probing. */
function clean(value: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().slice(0, 120);
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Reads the campaign parameters off an incoming URL.
 *
 * Returns null when there's nothing worth recording, so the caller can tell
 * "no campaign here" apart from "campaign with empty fields" and leave an
 * existing first-touch cookie alone.
 */
export function attributionFromUrl(url: URL, referrer: string | null): Attribution | null {
  const attribution: Attribution = {};

  for (const key of UTM_KEYS) {
    const value = clean(url.searchParams.get(key));
    if (value) attribution[key] = value;
  }

  const hasCampaign = Object.keys(attribution).length > 0;

  // An external referrer is worth keeping even with no UTM tags on the URL:
  // it's the only way organic and word-of-mouth traffic shows up as anything
  // other than "direct". Same-origin referrers say nothing and are dropped.
  if (referrer) {
    try {
      const referrerHost = new URL(referrer).host;
      if (referrerHost && referrerHost !== url.host) {
        attribution.referrer = clean(referrer);
      }
    } catch {
      // unparseable Referer header — nothing to record
    }
  }

  if (!hasCampaign && !attribution.referrer) return null;

  attribution.landing_path = url.pathname.slice(0, 120);
  return attribution;
}

export function serializeAttribution(attribution: Attribution): string {
  return JSON.stringify(attribution);
}

export function parseAttribution(raw: string | undefined): Attribution | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as Attribution;
  } catch {
    return null;
  }
}
