"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface AnonymousSessionState {
  userId: string | null;
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
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    const supabase = createSupabaseBrowserClient();

    async function ensureSession() {
      const { data } = await supabase.auth.getSession();
      let userId = data.session?.user?.id ?? null;

      if (!userId) {
        const { data: signInData, error } = await supabase.auth.signInAnonymously();
        if (error) {
          if (!cancelled) setState({ userId: null, loading: false, error: error.message });
          return;
        }
        userId = signInData.user?.id ?? null;
      }

      if (!cancelled) setState({ userId, loading: false, error: null });
    }

    ensureSession();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
