import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { trackEventServer } from "@/lib/events";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    const packageId = session.metadata?.package;
    const credits = Number(session.metadata?.credits ?? 0);

    if (userId && packageId) {
      const admin = createSupabaseAdminClient();

      await admin
        .from("purchases")
        .update({ status: "completed" })
        .eq("stripe_session_id", session.id);

      if (packageId === "remove_watermark") {
        await admin.from("users").update({ remove_watermark: true }).eq("id", userId);
      } else if (credits > 0) {
        const { data: profile } = await admin
          .from("users")
          .select("credits")
          .eq("id", userId)
          .maybeSingle();
        await admin
          .from("users")
          .update({ credits: (profile?.credits ?? 0) + credits })
          .eq("id", userId);
      }

      await trackEventServer(admin, "purchase_completed", undefined, {
        user_id: userId,
        package: packageId,
      });
    }
  }

  return NextResponse.json({ received: true });
}
