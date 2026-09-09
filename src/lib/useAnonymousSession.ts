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
    }

    ensureSession();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
