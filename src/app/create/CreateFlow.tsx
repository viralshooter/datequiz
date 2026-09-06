"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getUpcomingDayOptions } from "@/lib/dates";
import { useAnonymousSession } from "@/lib/useAnonymousSession";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Paywall } from "@/components/Paywall";

type Step = "name" | "days" | "generating" | "result" | "paywall";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CreateFlow() {
  const { userId, loading: sessionLoading } = useAnonymousSession();

  const [step, setStep] = useState<Step>("name");
  const [matchName, setMatchName] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [slug, setSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dayOptions = useMemo(() => getUpcomingDayOptions(14), []);
  const siteUrl =
    typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const fullLink = slug ? `${siteUrl}/d/${slug}` : "";

  function toggleDay(day: string) {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  async function generateLink() {
    setStep("generating");
    setError(null);

    try {
      // Best-effort: aggancia l'email alla sessione anonima per il login
      // futuro (magic link). Se fallisce (es. email già di un altro
      // account) non deve bloccare la creazione del link.
      try {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.updateUser({ email: notifyEmail.trim() });
      } catch {
        // ignorato volutamente
      }

      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          match_name: matchName.trim(),
          available_days: selectedDays,
          notify_email: notifyEmail.trim(),
        }),
      });

      if (res.status === 402) {
        setStep("paywall");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Qualcosa è andato storto, riprova.");
        setStep("days");
        return;
      }

      setSlug(data.slug);
      setStep("result");
    } catch {
      setError("Qualcosa è andato storto, riprova.");
      setStep("days");
    }
  }

  function reset() {
    setMatchName("");
    setSelectedDays([]);
    setNotifyEmail("");
    setSlug(null);
    setError(null);
    setStep("name");
  }

  const canGenerate = selectedDays.length > 0 && EMAIL_RE.test(notifyEmail.trim()) && !sessionLoading;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-10">
      <AnimatePresence mode="wait">
        {step === "name" && (
          <StepCard key="name">
            <h1 className="text-3xl font-extrabold text-neutral-900">DateQuiz 💌</h1>
            <p className="mt-2 text-neutral-600">
              Crea un invito lampo: le chiedi di uscire, lei sceglie cosa fare e quando.
            </p>
            <label className="mt-8 block text-sm font-semibold text-neutral-700">
              Come si chiama?
            </label>
            <input
              autoFocus
              value={matchName}
              onChange={(e) => setMatchName(e.target.value)}
              placeholder="Es. Giulia"
              className="mt-2 w-full rounded-xl border-2 border-neutral-200 px-4 py-3 text-lg outline-none focus:border-rose-400"
            />
            <button
              type="button"
              disabled={!matchName.trim()}
              onClick={() => setStep("days")}
              className="mt-6 w-full rounded-full bg-rose-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-rose-200 transition-transform active:scale-95 disabled:opacity-40"
            >
              Continua →
            </button>
          </StepCard>
        )}

        {step === "days" && (
          <StepCard key="days">
            <h1 className="text-2xl font-extrabold text-neutral-900">Quando sei libero?</h1>
            <p className="mt-2 text-neutral-600">
              Seleziona i giorni da proporre: lei sceglierà tra questi.
            </p>

            <div className="mt-6 flex max-h-72 flex-wrap gap-2 overflow-y-auto pr-1">
              {dayOptions.map((day) => {
                const active = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors ${
                      active
                        ? "border-rose-500 bg-rose-50 text-rose-600"
                        : "border-neutral-200 bg-white text-neutral-600"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <label className="mt-6 block text-sm font-semibold text-neutral-700">
              La tua email (per avvisarti quando risponde)
            </label>
            <input
              type="email"
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              placeholder="tuo@email.com"
              className="mt-2 w-full rounded-xl border-2 border-neutral-200 px-4 py-3 text-lg outline-none focus:border-rose-400"
            />

            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

            <button
              type="button"
              disabled={!canGenerate}
              onClick={generateLink}
              className="mt-6 w-full rounded-full bg-rose-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-rose-200 transition-transform active:scale-95 disabled:opacity-40"
            >
              Genera link →
            </button>
          </StepCard>
        )}

        {step === "generating" && (
          <StepCard key="generating">
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="text-5xl">✨</div>
              <p className="font-semibold text-neutral-600">Genero il tuo link…</p>
            </div>
          </StepCard>
        )}

        {step === "paywall" && userId && (
          <StepCard key="paywall">
            <Paywall userId={userId} onCancel={() => setStep("days")} />
          </StepCard>
        )}

        {step === "result" && slug && (
          <StepCard key="result">
            <h1 className="text-2xl font-extrabold text-neutral-900">Fatto! 🎉</h1>
            <p className="mt-2 text-neutral-600">
              Manda questo link a {matchName}: vedrà una hero page giocosa, poi la fatidica
              domanda.
            </p>

            <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <p className="break-all text-sm font-mono text-neutral-700">{fullLink}</p>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <CopyButton text={fullLink} />
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Ehi ${matchName}! Ho una domanda per te 💌 ${fullLink}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-green-500 px-6 py-3 text-center font-bold text-white shadow-lg shadow-green-100 transition-transform active:scale-95"
              >
                Invia su WhatsApp
              </a>
              <a
                href={`/r/${slug}`}
                className="rounded-full border-2 border-neutral-200 px-6 py-3 text-center font-semibold text-neutral-600"
              >
                Vai alla pagina risultato
              </a>
            </div>

            <button
              type="button"
              onClick={reset}
              className="mt-6 w-full text-sm font-semibold text-rose-500"
            >
              + Crea un altro link
            </button>
          </StepCard>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded-full border-2 border-neutral-200 px-6 py-3 font-semibold text-neutral-700 transition-transform active:scale-95"
    >
      {copied ? "Copiato ✅" : "Copia link"}
    </button>
  );
}
