import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ALL_EVENT_TYPES, type EventType } from "@/lib/events";

// Not the funnel order — that's only the conversion steps, and validating
// against it silently rejected every diagnostic event the client sends.
const VALID_EVENTS = new Set<EventType>(ALL_EVENT_TYPES);

export async function POST(request: NextRequest) {
  let body: { event_type?: string; slug?: string; metadata?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { event_type, slug, metadata } = body;
  if (!event_type || !VALID_EVENTS.has(event_type as EventType)) {
    return NextResponse.json({ error: "invalid_event_type" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("events").insert({
    event_type,
    slug: slug ?? null,
    metadata: metadata ?? {},
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
