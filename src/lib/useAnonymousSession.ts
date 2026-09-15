"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface AnonymousSessionState {
  userId: string | null;
  /** False once the session is a confirmed account rather than a cookie. */
  isAnonymous: boolean;
  loading: boolean;
  error: string | null;
}

const ATTRIBUTION_CLAIMED_KEY = "yeslink:attr-claimed";

/**
 * Tells the server to stamp the campaign cookie onto this session.
 *
 * The cookie is httpOnly and deliberately unreadable here, so the browser can
 * only ask. Waiting until a link was created meant everyone who arrived from
 * an ad and stopped short counted as no campaign at all.
 *
 * Once per tab, and never allowed to fail loudly: this is bookkeeping and
 * must not disturb someone trying to write an invite.
 */
async function claimAttribution(): Promise<void> {
  try {
    if (sessionStorage.getItem(ATTRIBUTION_CLAIMED_KEY)) return;
    sessionStorage.setItem(ATTRIBUTION_CLAIMED_KEY, "1");
  } catch {
    // Private mode or blocked storage: worth one extra request, not a crash.
  }

  try {
    await fetch("/api/attribution", { method: "POST", keepalive: true });
  } catch {
    // offline or blocked — the campaign label is not worth an error here
  }
}

/**
 * Garantisce che "lui" abbia una sessione (auth anonima Supabase)
 * prima di generare un link. Nessun form di login: la sessione è
 * creata in automatico e persiste via cookie tra le visite.
 */
export function useAnonymousSession(): AnonymousSessionState {
  const [state, setState] = useState<AnonymousSessionState>({
    userId: null,
    isAnonymous: true,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    const supabase = createSupabaseBrowserClient();

    async function ensureSession() {
      const { data } = await supabase.auth.getSession();
      let user = data.session?.user ?? null;

      if (!user) {
        const { data: signInData, error } = await supabase.auth.signInAnonymously();
        if (error) {
          if (!cancelled)
            setState({ userId: null, isAnonymous: true, loading: false, error: error.message });
          return;
        }
        user = signInData.user ?? null;
      }

      if (!cancelled)
        setState({
          userId: user?.id ?? null,
          isAnonymous: user?.is_anonymous !== false,
          loading: false,
          error: null,
        });

      if (user) void claimAttribution();
    }

    ensureSession();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
