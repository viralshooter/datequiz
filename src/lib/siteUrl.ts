/**
 * The address the product actually lives at.
 *
 * Anything user-facing — the link he sends her, the magic-link redirect —
 * has to be built from this rather than from `window.location.origin`.
 * The app answers on more than one hostname (the brand domain plus the
 * vercel.app one Vercel assigns), and whichever one he happened to open
 * would otherwise end up baked into the link she receives.
 */
export function canonicalSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");

  if (typeof window === "undefined") return configured ?? "";

  // Local development wins over the configured value: the dev server
  // picks whatever port is free, and generated links have to point at the
  // instance actually being tested rather than at production.
  const origin = window.location.origin;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return origin;

  return configured || origin;
}
