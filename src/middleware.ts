import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

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

export async function middleware(request: NextRequest) {
  const canonical = redirectToCanonicalHost(request);
  if (canonical) return canonical;

  let response = NextResponse.next({ request });

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

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
