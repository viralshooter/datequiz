import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendAnswerNotification } from "@/lib/email";
import { ACTIVITIES } from "@/config/content";
import { COUNTER_CONDITIONS } from "@/config/twists";
import type { ActivityId } from "@/types/content";
import type { EndingType } from "@/types/flow";

interface AnswerBody {
  slug?: string;
  selected_activities?: ActivityId[];
  selected_days?: string[];
  activity_ranking?: ActivityId[];
  counter_condition?: string;
  ending_type?: string;
  vetoed_activity?: string;
  reveal_activities?: boolean;
}

const VALID_ACTIVITIES = new Set<string>(ACTIVITIES.map((a) => a.id));
const VALID_ENDINGS = new Set<string>(["classic", "blind", "rare"]);
// She only ever picks from a fixed pool, so anything else is treated as
// absent rather than stored — this text is rendered straight back to him.
const VALID_CONDITIONS = new Set(COUNTER_CONDITIONS);

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

  // The twist deck is only ever allowed to be additive, so the invariant
  // holds regardless of the path she took: he gets at least one activity
  // and at least one day, or the answer isn't valid.
  if (cleanedDays.length === 0 || cleanedActivities.length === 0) {
    return NextResponse.json({ error: "invalid_selection" }, { status: 400 });
  }

  const ranking = (body.activity_ranking ?? cleanedActivities).filter((a) =>
    VALID_ACTIVITIES.has(a)
  );
  const endingType: EndingType = VALID_ENDINGS.has(body.ending_type ?? "")
    ? (body.ending_type as EndingType)
    : "classic";
  const counterCondition = VALID_CONDITIONS.has(body.counter_condition ?? "")
    ? (body.counter_condition as string)
    : "";
  const vetoedActivity = VALID_ACTIVITIES.has(body.vetoed_activity ?? "")
    ? (body.vetoed_activity as string)
    : "";

  const { error: insertError } = await admin.from("answers").insert({
    link_id: link.id,
    selected_activities: cleanedActivities,
    selected_days: cleanedDays,
    activity_ranking: ranking,
    counter_condition: counterCondition,
    ending_type: endingType,
    vetoed_activity: vetoedActivity,
    // The blind ending is the only thing that withholds anything, and it
    // withholds it from him, never from the record.
    reveal_activities: endingType !== "blind",
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
