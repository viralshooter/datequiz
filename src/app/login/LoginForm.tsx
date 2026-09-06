"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendMagicLink() {
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setLoading(false);
    if (error) {
      setError("Qualcosa è andato storto, riprova.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <motion.div
        className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center bg-ink px-6 text-center text-white"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-5xl">📬</div>
        <h1 className="mt-4 text-2xl font-extrabold">Controlla la tua posta</h1>
        <p className="mt-2 text-neutral-400">
          Ti abbiamo mandato un link a <strong className="text-white">{email}</strong>. Clicca su
          quello e sei dentro.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 text-sm font-semibold text-brand"
        >
          Usa un&apos;altra email
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center bg-ink px-6 text-center text-white"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-2">
        <svg width="28" height="28" viewBox="0 0 32 32">
          <path
            d="M9 17l5 5 9-11"
            stroke="#22c55e"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </span>
      <h1 className="mt-4 text-2xl font-extrabold">Accedi a Yeslink</h1>
      <p className="mt-2 text-neutral-400">Niente password: ti mandiamo un link, clicchi ed entri.</p>

      <input
        autoFocus
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tuo@email.com"
        className="mt-6 w-full rounded-xl border-2 border-white/15 bg-ink-2 px-4 py-3 text-lg text-white outline-none placeholder:text-neutral-500 focus:border-brand"
      />

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      <button
        type="button"
        disabled={!email.trim() || loading}
        onClick={sendMagicLink}
        className="mt-4 w-full rounded-full bg-brand px-8 py-4 text-lg font-bold text-ink shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-transform active:scale-95 disabled:opacity-40"
      >
        {loading ? "Un attimo…" : "Invia magic link →"}
      </button>
    </motion.div>
  );
}
