import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe";
import { getPackageById } from "@/config/pricing";
import { PAYMENTS_ENABLED } from "@/lib/flags";

export async function POST(request: NextRequest) {
  if (!PAYMENTS_ENABLED) {
    return NextResponse.json({ error: "payments_disabled" }, { status: 400 });
  }

  let body: { package?: string };
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
  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    // Land them somewhere that can actually confirm the purchase. This
    // used to return to the marketing page, banner and all, which read as
    // "nothing happened" right after paying.
    success_url: `${siteUrl}/dashboard?checkout=success`,
    cancel_url: `${siteUrl}/dashboard?checkout=cancel`,
    metadata: {
      user_id: user.id,
      package: pkg.id,
      credits: String(pkg.credits),
    },
  });

  const admin = createSupabaseAdminClient();
  await admin.from("purchases").insert({
    user_id: user.id,
    package: pkg.id,
    stripe_session_id: session.id,
    status: "pending",
    credits_granted: pkg.credits,
  });

  return NextResponse.json({ url: session.url });
}
