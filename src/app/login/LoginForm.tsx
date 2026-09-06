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
        className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-5xl">📬</div>
        <h1 className="mt-4 text-2xl font-extrabold text-neutral-900">Controlla la tua posta</h1>
        <p className="mt-2 text-neutral-600">
          Ti abbiamo mandato un link a <strong>{email}</strong>. Clicca su quello e sei dentro.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 text-sm font-semibold text-rose-500"
        >
          Usa un&apos;altra email
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-5xl">💌</div>
      <h1 className="mt-4 text-2xl font-extrabold text-neutral-900">Accedi a DateQuiz</h1>
      <p className="mt-2 text-neutral-600">
        Niente password: ti mandiamo un link, clicchi ed entri.
      </p>

      <input
        autoFocus
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tuo@email.com"
        className="mt-6 w-full rounded-xl border-2 border-neutral-200 px-4 py-3 text-lg outline-none focus:border-rose-400"
      />

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <button
        type="button"
        disabled={!email.trim() || loading}
        onClick={sendMagicLink}
        className="mt-4 w-full rounded-full bg-rose-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-rose-200 transition-transform active:scale-95 disabled:opacity-40"
      >
        {loading ? "Un attimo…" : "Invia magic link →"}
      </button>
    </motion.div>
  );
}
