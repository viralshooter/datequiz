"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/events";

interface AnonymousSessionState {
  userId: string | null;
  /** False once the session is a confirmed account rather than a cookie. */
  isAnonymous: boolean;
  loading: boolean;
  error: string | null;
  /** Loading has gone on long enough that something is probably wrong,
   *  rather than merely slow. See STUCK_AFTER_MS below for why. */
  stuck: boolean;
  /** Re-attempts sign-in. Exposed so a stuck user has a way forward besides
   *  reloading the page and losing whatever they've already typed. */
  retry: () => void;
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

// Sign-in normally resolves in well under a second. This is set high enough
// that a slow mobile network never trips it, and low enough that someone
// stuck on a dead button finds out inside one screen's worth of patience.
const STUCK_AFTER_MS = 7000;

/**
 * Garantisce che "lui" abbia una sessione (auth anonima Supabase)
 * prima di generare un link. Nessun form di login: la sessione è
 * creata in automatico e persiste via cookie tra le visite.
 *
 * Sign-in calls Supabase's own domain, not yeslink.app — a third-party
 * request from the browser's point of view. Some in-app browsers (TikTok,
 * Instagram) are known to block, delay, or silently drop exactly this kind
 * of call, and without the `stuck`/`error` signals here that failure was
 * invisible: the final "Generate link" button just stayed disabled forever,
 * with nothing on screen to say why.
 */
export function useAnonymousSession(): AnonymousSessionState {
  const [state, setState] = useState({
    userId: null as string | null,
    isAnonymous: true,
    loading: true,
    error: null as string | null,
  });
  const [stuck, setStuck] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const reportedStuckRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setStuck(false);
    const stuckTimer = window.setTimeout(() => {
      if (cancelled) return;
      setStuck(true);
      if (!reportedStuckRef.current) {
        reportedStuckRef.current = true;
        trackEvent("anonymous_session_failed", undefined, { reason: "timeout" });
      }
    }, STUCK_AFTER_MS);

    const supabase = createSupabaseBrowserClient();

    // Whatever happens next, the stuck-timeout report is now moot — either
    // this already answers why loading took a while, or it succeeded.
    // Without this an error that arrives just before the timeout still logs
    // a second, redundant "timeout" event on top of the real reason.
    function settled() {
      window.clearTimeout(stuckTimer);
      reportedStuckRef.current = true;
    }

    async function ensureSession() {
      const { data } = await supabase.auth.getSession();
      let user = data.session?.user ?? null;

      if (!user) {
        const { data: signInData, error } = await supabase.auth.signInAnonymously();
        if (error) {
          if (!cancelled) {
            settled();
            setState({ userId: null, isAnonymous: true, loading: false, error: error.message });
            trackEvent("anonymous_session_failed", undefined, { reason: error.message });
          }
          return;
        }
        user = signInData.user ?? null;
      }

      if (!cancelled) {
        settled();
        setState({
          userId: user?.id ?? null,
          isAnonymous: user?.is_anonymous !== false,
          loading: false,
          error: null,
        });
      }

      if (user) void claimAttribution();
    }

    ensureSession().catch((err: unknown) => {
      if (cancelled) return;
      settled();
      const message = err instanceof Error ? err.message : "unknown_error";
      setState({ userId: null, isAnonymous: true, loading: false, error: message });
      trackEvent("anonymous_session_failed", undefined, { reason: message });
    });

    return () => {
      cancelled = true;
      window.clearTimeout(stuckTimer);
    };
    // `attempt` is the retry trigger — bumping it re-runs this effect.
  }, [attempt]);

  const retry = useCallback(() => {
    reportedStuckRef.current = false;
    setState({ userId: null, isAnonymous: true, loading: true, error: null });
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, stuck: stuck && state.loading, retry };
}
