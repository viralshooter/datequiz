import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { attributionCookieValue, persistAttribution } from "@/lib/attributionServer";

/**
 * Attaches the campaign a visitor arrived from to their session, as soon as
 * the session exists.
 *
 * Attribution used to be written only when someone created a link or started
 * a checkout, so anyone who arrived from an ad, opened /create and stopped
 * there was credited to no campaign at all — which is exactly the drop-off
 * worth measuring. The cookie is httpOnly, so the browser can't do this
 * itself and has to ask.
 *
 * Cheap to call redundantly: with no campaign cookie it returns before
 * touching the database, and first touch still wins.
 */
export async function POST(request: NextRequest) {
  const cookieValue = attributionCookieValue(request.cookies);
  if (!cookieValue) return new NextResponse(null, { status: 204 });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new NextResponse(null, { status: 204 });

  const admin = createSupabaseAdminClient();
  await persistAttribution(admin, user.id, cookieValue);

  return new NextResponse(null, { status: 204 });
}
