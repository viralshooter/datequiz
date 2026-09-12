import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe";
import { getPackageById } from "@/config/pricing";
import { PAYMENTS_ENABLED } from "@/lib/flags";
import { attributionCookieValue, persistAttribution } from "@/lib/attributionServer";

const RETURN_DESTINATIONS = new Set(["/dashboard", "/create"]);

export async function POST(request: NextRequest) {
  if (!PAYMENTS_ENABLED) {
    return NextResponse.json({ error: "payments_disabled" }, { status: 400 });
  }

  let body: { package?: string; return_to?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const pkg = body.package ? getPackageById(body.package) : undefined;
  if (!pkg) {
    return NextResponse.json({ error: "invalid_package" }, { status: 400 });
  }

  const priceId = process.env[pkg.stripePriceEnv];
  if (!priceId) {
    return NextResponse.json({ error: "package_not_configured" }, { status: 500 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  // An anonymous session lives only in this browser's cookie. Credits
  // bought onto one become unreachable the moment the cookie goes —
  // different phone, cleared data, private window — and the money is
  // already taken. Nothing is sold until the account is real.
  if (user.is_anonymous !== false) {
    return NextResponse.json({ error: "account_required" }, { status: 403 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
  // Allowlisted rather than taken as given: this value is pasted straight
  // into the URL Stripe sends the customer back to, so an arbitrary one
  // would be an open redirect off the back of a payment.
  const returnTo = RETURN_DESTINATIONS.has(body.return_to ?? "")
    ? (body.return_to as string)
    : "/dashboard";
  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    // Land them somewhere that can actually confirm the purchase. This
    // used to return to the marketing page, banner and all, which read as
    // "nothing happened" right after paying. Someone who was midway
    // through writing a link goes back there instead, so their draft can
    // be picked up rather than retyped.
    success_url: `${siteUrl}${returnTo}?checkout=success`,
    cancel_url: `${siteUrl}${returnTo}?checkout=cancel`,
    metadata: {
      user_id: user.id,
      package: pkg.id,
      credits: String(pkg.credits),
    },
  });

  const admin = createSupabaseAdminClient();
  await persistAttribution(admin, user.id, attributionCookieValue(request.cookies));

  await admin.from("purchases").insert({
    user_id: user.id,
    package: pkg.id,
    stripe_session_id: session.id,
    status: "pending",
    credits_granted: pkg.credits,
    // Recorded from what we charged today, not looked up later: revenue
    // reports must not change retroactively when a price does.
    amount_cents: pkg.priceCents,
    currency: "usd",
  });

  return NextResponse.json({ url: session.url });
}
