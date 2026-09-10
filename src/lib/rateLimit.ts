import type { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Best-effort client IP. Vercel sets x-forwarded-for; anything behind a
 * shared IP (campus wifi, a VPN exit) shares a bucket, which is an
 * accepted trade-off — there's no session identity to key on instead,
 * since the whole point is that a session is free to spin up.
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Backed by a single atomic Postgres UPSERT (see migration 008) rather
 * than an in-process counter: Vercel's serverless functions don't share
 * memory between invocations, so anything held in a variable resets on
 * every cold start and would rate-limit nothing.
 *
 * Fails open — a rate-limit outage must never be the reason a real user
 * can't create a link.
 */
export async function checkRateLimit(
  admin: SupabaseClient,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  const { data, error } = await admin.rpc("check_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    console.error("rate limit check failed, allowing the request", error);
    return true;
  }

  // Cheap, occasional housekeeping rather than a cron job for a table
  // this small — most calls skip it.
  if (Math.random() < 0.01) {
    void admin.rpc("prune_rate_limits").then(
      () => {},
      () => {}
    );
  }

  return data === true;
}
