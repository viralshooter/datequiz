import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

// The whole surface being protected is one shared password with no
// username to separate attempts, so brute-forcing it is a matter of
// trying strings — five attempts per 15 minutes per IP is generous for
// someone who fat-fingered it and hostile to guessing.
const LOGIN_ATTEMPT_LIMIT = 5;
const LOGIN_ATTEMPT_WINDOW_SECONDS = 15 * 60;

export async function POST(request: NextRequest) {
  const admin = createSupabaseAdminClient();
  const ip = getClientIp(request);
  const withinLimit = await checkRateLimit(
    admin,
    `admin:login:${ip}`,
    LOGIN_ATTEMPT_LIMIT,
    LOGIN_ATTEMPT_WINDOW_SECONDS
  );
  if (!withinLimit) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { password } = (await request.json().catch(() => ({}))) as { password?: string };
  const expected = process.env.ADMIN_DASHBOARD_PASSWORD;

  if (!expected || password !== expected) {
    return NextResponse.json({ error: "wrong_password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 60 * 8, // 8 ore
  });
  return response;
}
