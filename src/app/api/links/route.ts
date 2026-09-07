import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { trackEventServer } from "@/lib/events";
import { generateSlug } from "@/lib/slug";
import { normalizeInstagramHandle } from "@/lib/instagram";
import { PAYMENTS_ENABLED } from "@/lib/flags";

const LinkBodySchema = z.object({
  match_name: z.string().trim().min(1),
  available_days: z.array(z.string()).min(1),
  notify_email: z.string().trim().email(),
  instagram_handle: z.string().trim().optional(),
  sender_name: z.string().trim().max(40).optional(),
  personal_note: z.string().trim().max(180).optional(),
});

export async function POST(request: NextRequest) {
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
  const { match_name, available_days, notify_email } = parsed.data;
  const sender_name = parsed.data.sender_name ?? "";
  const personal_note = parsed.data.personal_note ?? "";
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

  const admin = createSupabaseAdminClient();
  await trackEventServer(admin, "link_created", slug, { match_name });

  return NextResponse.json({ slug });
}
