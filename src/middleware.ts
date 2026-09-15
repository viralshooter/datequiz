import { NextResponse, type NextRequest, type NextFetchEvent } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { recordAdLanding } from "@/lib/adLanding";
import {
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_MAX_AGE,
  attributionFromUrl,
  serializeAttribution,
  type Attribution,
} from "@/lib/attribution";

/**
 * Rinfresca il cookie di sessione Supabase su ogni richiesta (pattern
 * standard @supabase/ssr). Senza questo, le sessioni create via magic
 * link o updateUser() possono scadere senza rinnovarsi tra una
 * navigazione e l'altra.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

/**
 * Send everything to the brand domain.
 *
 * Vercel keeps answering on its own *.vercel.app hostname, so a link
 * created (or opened) from that address would show it to her instead of
 * yeslink.app. This also rescues links already sent with the old address
 * rather than leaving them off-brand.
 *
 * Trade-off: deployment-specific preview URLs redirect too, so a build
 * has to be inspected through the real domain once it's promoted.
 */
function redirectToCanonicalHost(request: NextRequest): NextResponse | null {
  if (!SITE_URL) return null;

  // Never redirect API routes. They're either called by our own pages with
  // relative URLs — already on the right host — or by an external service
  // registered against a fixed URL. Stripe does not follow redirects when
  // delivering webhooks: it records a 308 as a failed delivery, which
  // silently stops credits from ever being granted after a payment.
  if (request.nextUrl.pathname.startsWith("/api/")) return null;

  const host = request.headers.get("host") ?? "";
  if (!host.endsWith(".vercel.app")) return null;

  const target = new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, SITE_URL);
  return NextResponse.redirect(target, 308);
}

/**
 * Records which campaign sent someone here, first touch wins.
 *
 * Done in middleware rather than in a client component so it survives a
 * visitor who lands and immediately leaves — by the time they come back to
 * actually create a link, the URL no longer carries the tags. First touch
 * because the question is which ad found this person, not which page they
 * happened to reload last.
 */
function setAttributionCookie(response: NextResponse, attribution: Attribution): void {
  response.cookies.set(ATTRIBUTION_COOKIE, serializeAttribution(attribution), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ATTRIBUTION_MAX_AGE,
  });
}

function pendingAttribution(request: NextRequest): Attribution | null {
  if (request.cookies.get(ATTRIBUTION_COOKIE)) return null;
  return attributionFromUrl(request.nextUrl, request.headers.get("referer"));
}

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const canonical = redirectToCanonicalHost(request);
  if (canonical) return canonical;

  // Worked out up front but written at the very end: refreshing the Supabase
  // session replaces `response` wholesale, which would throw away any cookie
  // set on the original object.
  const attribution = pendingAttribution(request);

  // One row per campaign-tagged arrival, counted here because this is the
  // only code that runs for every visitor — the page itself is static and
  // served from the CDN. waitUntil keeps it off the critical path, so the
  // measurement costs the visitor nothing.
  if (attribution?.utm_source) {
    event.waitUntil(
      recordAdLanding(attribution, request.headers.get("user-agent") ?? "")
    );
  }

  let response = NextResponse.next({ request });

  // No auth cookie means there is no session to refresh and nobody to
  // redirect, so skip Supabase entirely. This is the path every visitor
  // arriving from an ad takes, and it's the difference between the landing
  // page being served from the CDN and it waiting on an auth round-trip.
  const hasAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-"));

  if (!hasAuthCookie) {
    if (attribution) setAttributionCookie(response, attribution);
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Someone with a real account has no use for the "first link free" pitch.
  // This used to live in the landing page itself, which meant the page had
  // to be rendered per request just to decide — the redirect happens here so
  // the page can stay static for everyone else.
  if (user?.is_anonymous === false && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (attribution) setAttributionCookie(response, attribution);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
