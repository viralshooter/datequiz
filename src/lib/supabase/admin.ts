import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase con service role key: bypassa RLS.
 * SOLO server-side (route handlers, webhook Stripe). Mai importarlo
 * in un componente client o esporne la chiave al browser.
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
