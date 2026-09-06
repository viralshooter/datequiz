import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendAnswerNotification } from "@/lib/email";
import { ACTIVITIES } from "@/config/content";
import type { ActivityId } from "@/types/content";

interface AnswerBody {
  slug?: string;
  selected_activities?: ActivityId[];
  selected_days?: string[];
}

const VALID_ACTIVITIES = new Set(ACTIVITIES.map((a) => a.id));

export async function POST(request: NextRequest) {
  let body: AnswerBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { slug, selected_activities = [], selected_days = [] } = body;

  if (!slug || selected_activities.length === 0 || selected_days.length === 0) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  const { data: link, error: linkError } = await admin
    .from("links")
    .select("id, available_days, match_name, notify_email")
    .eq("slug", slug)
    .maybeSingle();

  if (linkError || !link) {
    return NextResponse.json({ error: "link_not_found" }, { status: 404 });
  }

  const { data: existing } = await admin
    .from("answers")
    .select("id")
    .eq("link_id", link.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "already_answered" }, { status: 409 });
  }

  const validDays = new Set(link.available_days as string[]);
  const cleanedDays = selected_days.filter((d) => validDays.has(d));
  const cleanedActivities = selected_activities.filter((a) => VALID_ACTIVITIES.has(a));

  if (cleanedDays.length === 0 || cleanedActivities.length === 0) {
    return NextResponse.json({ error: "invalid_selection" }, { status: 400 });
  }

  const { error: insertError } = await admin.from("answers").insert({
    link_id: link.id,
    selected_activities: cleanedActivities,
    selected_days: cleanedDays,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  if (link.notify_email) {
    try {
      await sendAnswerNotification({
        to: link.notify_email,
        matchName: link.match_name,
        slug,
      });
    } catch (err) {
      console.error("Failed to send answer notification email", err);
    }
  }

  return NextResponse.json({ ok: true });
}
