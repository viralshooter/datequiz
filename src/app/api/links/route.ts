import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { trackEventServer } from "@/lib/events";
import { generateSlug } from "@/lib/slug";
import { normalizeInstagramHandle } from "@/lib/instagram";
import { PAYMENTS_ENABLED } from "@/lib/flags";
import { randomSeed } from "@/lib/prng";
import { DEFAULT_MODE } from "@/config/modes";
import { LINK_MODES, type LinkMode } from "@/types/flow";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { attributionCookieValue, persistAttribution } from "@/lib/attributionServer";

// Keyed by IP rather than by session: an anonymous session costs nothing
// to create, so limiting per-session would cap nothing — someone abusing
// this just opens a new one. Generous enough for a real person sending
// several invites in a sitting; well below what scripting this at scale
// would need.
const LINK_CREATE_LIMIT = 8;
const LINK_CREATE_WINDOW_SECONDS = 60 * 60;

const LinkBodySchema = z.object({
  match_name: z.string().trim().min(1),
  available_days: z.array(z.string()).min(1),
  notify_email: z.string().trim().email(),
  instagram_handle: z.string().trim().optional(),
  sender_name: z.string().trim().max(40).optional(),
  personal_note: z.string().trim().min(10).max(180),
  mode: z.enum(LINK_MODES as [LinkMode, ...LinkMode[]]).optional(),
});

export async function POST(request: NextRequest) {
  const admin = createSupabaseAdminClient();
  const ip = getClientIp(request);
  const withinLimit = await checkRateLimit(
    admin,
    `links:create:${ip}`,
    LINK_CREATE_LIMIT,
    LINK_CREATE_WINDOW_SECONDS
  );
  if (!withinLimit) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = LinkBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const { match_name, available_days, notify_email, personal_note } = parsed.data;
  const sender_name = parsed.data.sender_name ?? "";
  // Optional: an unparseable handle is dropped rather than rejected, so a
  // typo never blocks link creation.
  const instagram_handle = parsed.data.instagram_handle
    ? normalizeInstagramHandle(parsed.data.instagram_handle) ?? ""
    : "";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("credits, remove_watermark")
    .eq("id", user.id)
    .maybeSingle();

  if (PAYMENTS_ENABLED && (profile?.credits ?? 0) <= 0) {
    return NextResponse.json({ error: "no_credits" }, { status: 402 });
  }

  const mode = parsed.data.mode ?? DEFAULT_MODE;
  // Fixed once, here. Everything the recipient flow randomises derives
  // from it, so her path is reproducible and rare outcomes can't be
  // farmed by reloading /d/[slug].
  const seed = randomSeed();

  let slug = "";
  let inserted = false;
  let attempts = 0;

  while (!inserted && attempts < 5) {
    slug = generateSlug();
    const { error } = await supabase.from("links").insert({
      slug,
      creator_id: user.id,
      match_name,
      available_days,
      notify_email,
      instagram_handle,
      sender_name,
      personal_note,
      seed,
      mode,
      watermark_enabled: !profile?.remove_watermark,
    });

    if (!error) {
      inserted = true;
    } else if (error.code !== "23505") {
      // 23505 = unique_violation su slug: si ritenta con un nuovo slug
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    attempts++;
  }

  if (!inserted) {
    return NextResponse.json({ error: "could_not_generate_slug" }, { status: 500 });
  }

  if (PAYMENTS_ENABLED) {
    await supabase
      .from("users")
      .update({ credits: (profile?.credits ?? 1) - 1 })
      .eq("id", user.id);
  }

  // After the link exists, not before: this is bookkeeping, and it must not
  // sit between the credit check and the insert.
  await persistAttribution(admin, user.id, attributionCookieValue(request.cookies));

  await trackEventServer(admin, "link_created", slug, { match_name, mode });

  return NextResponse.json({ slug });
}
