"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Phase = "email" | "code";

/**
 * Supabase's emailed code isn't always six digits — the email-change flow
 * on this project sends eight. Clamping the field to six silently ate the
 * last two and made every verification fail, so accept the range instead
 * of assuming a length.
 */
const MIN_CODE_LENGTH = 6;
const MAX_CODE_LENGTH = 8;

/**
 * Turns the anonymous session into a real account without leaving the page.
 *
 * This runs at the moment of purchase, so sending someone off to their
 * inbox and hoping they come back is the worst possible ask. They get a
 * code and type it here instead.
 *
 * Two paths, because the address may or may not already be an account:
 *  - new address  -> updateUser() upgrades the *current* anonymous user,
 *                    which keeps the same id, so the free link and any
 *                    credits they already have stay attached.
 *  - known address -> fall back to a plain sign-in, landing them in the
 *                    account that already holds their history.
 */
export function AccountGate({
  defaultEmail = "",
  onVerified,
}: {
  defaultEmail?: string;
  onVerified: () => void;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<Phase>("email");
  // Which verification the code has to be checked against.
  const [flow, setFlow] = useState<"upgrade" | "signin">("upgrade");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode() {
    const address = email.trim();
    if (!address) return;
    setBusy(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: upgradeError } = await supabase.auth.updateUser({ email: address });

    if (upgradeError) {
      // Delivery problems must not fall through to sign-in: that would
      // drop them into a *different* account and orphan the link this
      // anonymous session is holding. Only "already registered" means the
      // account genuinely lives elsewhere.
      const alreadyRegistered = /already|exists|registered/i.test(upgradeError.message);

      if (!alreadyRegistered) {
        setError(
          upgradeError.status === 429
            ? "Too many emails sent from this app right now. Give it a few minutes and try again."
            : "Couldn't send the code. Check the address and try again."
        );
        setBusy(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: address,
        options: { shouldCreateUser: true },
      });
      if (signInError) {
        setError(
          signInError.status === 429
            ? "Too many emails sent from this app right now. Give it a few minutes and try again."
            : "Couldn't send the code. Check the address and try again."
        );
        setBusy(false);
        return;
      }
      setFlow("signin");
    } else {
      setFlow("upgrade");
    }

    setBusy(false);
    setPhase("code");
  }

  async function verify() {
    const token = code.trim();
    if (token.length < MIN_CODE_LENGTH) return;
    setBusy(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token,
      type: flow === "upgrade" ? "email_change" : "email",
    });

    if (verifyError) {
      setError("That code didn't work. Check it, or ask for a new one.");
      setBusy(false);
      return;
    }

    setBusy(false);
    onVerified();
  }

  if (phase === "code") {
    return (
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Check your email 📬</h1>
        <p className="mt-2 text-neutral-600">
          We sent a code to <strong className="text-ink">{email}</strong>. Type it here —
          you don&apos;t have to leave this page.
        </p>

        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, MAX_CODE_LENGTH))}
          placeholder="········"
          className="mt-6 w-full rounded-xl border-[3px] border-ink bg-white px-4 py-3 text-center text-2xl font-black tracking-[0.35em] text-ink outline-none placeholder:text-neutral-300 focus:border-brand"
        />

        {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}

        <button
          type="button"
          disabled={busy || code.length < MIN_CODE_LENGTH}
          onClick={verify}
          className="mt-4 w-full rounded-full border-[3px] border-ink bg-brand px-8 py-4 text-lg font-black text-ink shadow-[5px_5px_0_0_#1a1a1f] transition-transform active:scale-95 disabled:opacity-40 disabled:shadow-none"
        >
          {busy ? "Checking…" : "Confirm my account →"}
        </button>

        <p className="mt-3 text-xs text-neutral-500">
          The email also contains a link — clicking that works just as well.
        </p>

        <button
          type="button"
          onClick={() => {
            setPhase("email");
            setCode("");
            setError(null);
          }}
          className="mt-4 w-full text-sm font-semibold text-neutral-500"
        >
          ← Use a different email
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">First, secure your account 🔐</h1>
      <p className="mt-2 text-neutral-600">
        So the credits you&apos;re about to buy stay yours — reachable from any phone, not just
        this browser.
      </p>

      <label className="mt-6 block text-sm font-black text-ink">Your email</label>
      <input
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="mt-2 w-full rounded-xl border-[3px] border-ink bg-white px-4 py-3 text-lg text-ink outline-none placeholder:text-neutral-400 focus:border-brand"
      />

      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}

      <button
        type="button"
        disabled={busy || !email.trim()}
        onClick={sendCode}
        className="mt-4 w-full rounded-full border-[3px] border-ink bg-brand px-8 py-4 text-lg font-black text-ink shadow-[5px_5px_0_0_#1a1a1f] transition-transform active:scale-95 disabled:opacity-40 disabled:shadow-none"
      >
        {busy ? "Sending…" : "Send me a code →"}
      </button>

      <p className="mt-3 text-xs text-neutral-500">
        Your links and free credit stay attached — this just puts your name on them.
      </p>
    </div>
  );
}
