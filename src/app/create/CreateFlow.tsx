"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getUpcomingDayOptions } from "@/lib/dates";
import { useAnonymousSession } from "@/lib/useAnonymousSession";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Paywall } from "@/components/Paywall";
import { canonicalSiteUrl } from "@/lib/siteUrl";
import { DEFAULT_MODE, MODE_CARDS } from "@/config/modes";
import {
  clearCreateDraft,
  loadCreateDraft,
  saveCreateDraft,
  type CreateDraft,
} from "@/lib/createDraft";
import type { LinkMode } from "@/types/flow";

type Step =
  | "name"
  | "days"
  | "mode"
  | "about"
  | "generating"
  | "result"
  | "paywall"
  | "awaitingCredits";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CreateFlow() {
  const { userId, isAnonymous, loading: sessionLoading } = useAnonymousSession();

  const [step, setStep] = useState<Step>("name");
  const [matchName, setMatchName] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [senderName, setSenderName] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [mode, setMode] = useState<LinkMode>(DEFAULT_MODE);
  const [confirmationSent, setConfirmationSent] = useState(true);
  const [slug, setSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dayOptions = useMemo(() => getUpcomingDayOptions(14), []);
  const fullLink = slug ? `${canonicalSiteUrl()}/d/${slug}` : "";

  /**
   * Picks the form back up after the trip to Stripe.
   *
   * Read from `window.location` rather than useSearchParams so this page
   * doesn't need a Suspense boundary just to look at one query param.
   */
  useEffect(() => {
    const checkout = new URLSearchParams(window.location.search).get("checkout");
    if (!checkout) return;

    // Drop the param so a refresh doesn't replay the return.
    window.history.replaceState({}, "", "/create");

    const draft = loadCreateDraft();
    if (!draft) return;

    setMatchName(draft.matchName);
    setPersonalNote(draft.personalNote);
    setSelectedDays(draft.selectedDays);
    setMode(draft.mode);
    setSenderName(draft.senderName);
    setInstagramHandle(draft.instagramHandle);
    setNotifyEmail(draft.notifyEmail);

    if (checkout === "success") {
      // He paid — finish the job for him rather than showing the form
      // again with everything already filled in.
      void generateLink(draft, { waitForCredits: true });
    } else {
      // Cancelled: nothing is lost, he lands back on the last step with
      // his answers intact.
      setStep("about");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleDay(day: string) {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  function currentDraft(): CreateDraft {
    return {
      matchName: matchName.trim(),
      personalNote: personalNote.trim(),
      selectedDays,
      mode,
      senderName: senderName.trim(),
      instagramHandle: instagramHandle.trim(),
      notifyEmail: notifyEmail.trim(),
    };
  }

  /**
   * `draft` is passed explicitly rather than read from state because the
   * post-payment path restores and submits in the same tick, when the
   * state updates haven't been applied yet.
   *
   * `waitForCredits` is only set on that path: a 402 normally means "show
   * the paywall", but for someone who has just paid it usually means the
   * Stripe webhook is still in flight, and bouncing them back to the
   * packages they already bought would be indefensible.
   */
  async function generateLink(
    draft: CreateDraft = currentDraft(),
    { waitForCredits = false, attempt = 0 } = {}
  ) {
    setStep("generating");
    setError(null);

    try {
      // Attach the email to the anonymous session so the account can be
      // claimed later. This must never block link creation — but it must
      // not be swallowed either: supabase-js returns the failure instead
      // of throwing, so the old catch block never even saw it, and a user
      // whose confirmation email was never sent was told it had been.
      try {
        const supabase = createSupabaseBrowserClient();
        const { error: upgradeError } = await supabase.auth.updateUser({
          email: draft.notifyEmail,
        });
        setConfirmationSent(!upgradeError);
      } catch {
        setConfirmationSent(false);
      }

      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          match_name: draft.matchName,
          available_days: draft.selectedDays,
          notify_email: draft.notifyEmail,
          instagram_handle: draft.instagramHandle,
          sender_name: draft.senderName,
          personal_note: draft.personalNote,
          mode: draft.mode,
        }),
      });

      if (res.status === 402) {
        if (waitForCredits && attempt < 4) {
          await new Promise((r) => window.setTimeout(r, 2000 + attempt * 1000));
          return generateLink(draft, { waitForCredits, attempt: attempt + 1 });
        }
        setStep(waitForCredits ? "awaitingCredits" : "paywall");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setError(
          res.status === 429
            ? "You're creating links faster than we allow right now. Give it a bit and try again."
            : data.error ?? "Something went wrong, please try again."
        );
        setStep("about");
        return;
      }

      // The link exists now, so the parked copy has done its job.
      clearCreateDraft();
      setSlug(data.slug);
      setStep("result");
    } catch {
      setError("Something went wrong, please try again.");
      setStep("about");
    }
  }

  function reset() {
    setMatchName("");
    setSelectedDays([]);
    setNotifyEmail("");
    setInstagramHandle("");
    setSenderName("");
    setPersonalNote("");
    setSlug(null);
    setError(null);
    setStep("name");
  }

  // Long enough to rule out "hey", short enough not to be a chore.
  const canContinueFromName = matchName.trim().length > 0 && personalNote.trim().length >= 10;
  const canGenerate = selectedDays.length > 0 && EMAIL_RE.test(notifyEmail.trim()) && !sessionLoading;

  // Whatever he already told us goes into the message, so what lands in her
  // chat reads like him rather than a bare URL.
  const shareMessage = [
    senderName.trim() ? `Hey ${matchName}, it's ${senderName.trim()}!` : `Hey ${matchName}!`,
    personalNote.trim(),
    `I've got a question for you 👀 ${fullLink}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
      <AnimatePresence mode="wait">
        {step === "name" && (
          <StepCard key="name">
            <h1 className="text-3xl font-extrabold">Who's the lucky one? 😏</h1>
            <p className="mt-2 text-neutral-600">
              A quick invite: you ask her out, she picks what to do and when.
            </p>
            <label className="mt-8 block text-sm font-black text-ink">
              What's her name?
            </label>
            <input
              autoFocus
              value={matchName}
              onChange={(e) => setMatchName(e.target.value)}
              placeholder="e.g. Emma"
              className="mt-2 w-full rounded-xl border-[3px] border-ink bg-white px-4 py-3 text-lg text-ink outline-none placeholder:text-neutral-400 focus:border-brand"
            />

            <label className="mt-6 block text-sm font-black text-ink">
              Say something only she'd get
            </label>
            <textarea
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value.slice(0, 180))}
              rows={3}
              placeholder="Still thinking about your take on pineapple pizza. Settle this in person?"
              className="mt-2 w-full resize-none rounded-xl border-[3px] border-ink bg-white px-4 py-3 text-base text-ink outline-none placeholder:text-neutral-400 focus:border-brand"
            />
            <div className="mt-2 flex items-start justify-between gap-3">
              <p className="text-xs text-neutral-500">
                Pull one thing from your actual conversation. It's the difference between a link
                that reads as you and one that reads as spam — so we don't let you skip it.
              </p>
              <span className="shrink-0 text-xs text-neutral-600">{personalNote.length}/180</span>
            </div>

            <button
              type="button"
              disabled={!canContinueFromName}
              onClick={() => setStep("days")}
              className="mt-6 w-full rounded-full border-[3px] border-ink bg-brand px-8 py-4 text-lg font-black text-ink shadow-[5px_5px_0_0_#1a1a1f] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-40 disabled:shadow-none"
            >
              Continue →
            </button>
          </StepCard>
        )}

        {step === "days" && (
          <StepCard key="days">
            <h1 className="text-2xl font-extrabold">When are you free?</h1>
            <p className="mt-2 text-neutral-600">
              Pick the days to offer her: she'll choose one of these.
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
                        ? "border-ink bg-brand text-ink"
                        : "border-ink/20 bg-white text-neutral-600"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={selectedDays.length === 0}
              onClick={() => setStep("mode")}
              className="mt-6 w-full rounded-full border-[3px] border-ink bg-brand px-8 py-4 text-lg font-black text-ink shadow-[5px_5px_0_0_#1a1a1f] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-40 disabled:shadow-none"
            >
              Continue →
            </button>
          </StepCard>
        )}

        {step === "mode" && (
          <StepCard key="mode">
            <h1 className="text-2xl font-extrabold">Pick her experience 🎛️</h1>
            <p className="mt-2 text-neutral-600">
              Three flavours. We&apos;re not telling you what they do.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              {MODE_CARDS.map((card) => {
                const active = mode === card.id;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setMode(card.id)}
                    className={`flex items-center gap-4 rounded-2xl border-[3px] px-5 py-5 text-left transition-transform active:scale-[0.98] ${
                      active
                        ? "border-brand-dark shadow-[5px_5px_0_0_#16a34a]"
                        : "border-ink shadow-[5px_5px_0_0_#1a1a1f]"
                    } ${card.tint}`}
                  >
                    <span className="text-4xl">{card.emoji}</span>
                    <span className="text-xl font-black text-ink">{card.label}</span>
                    {active && <span className="ml-auto text-2xl">✅</span>}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setStep("about")}
              className="mt-6 w-full rounded-full border-[3px] border-ink bg-brand px-8 py-4 text-lg font-black text-ink shadow-[5px_5px_0_0_#1a1a1f] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
              Continue →
            </button>
          </StepCard>
        )}

        {step === "about" && (
          <StepCard key="about">
            <h1 className="text-2xl font-extrabold">Who's asking? 👋</h1>
            <p className="mt-2 text-neutral-600">
              So she knows the link is really from you — and so you hear back the second she answers.
            </p>

            <label className="mt-8 block text-sm font-black text-ink">
              Your first name
            </label>
            <input
              autoFocus
              value={senderName}
              onChange={(e) => setSenderName(e.target.value.slice(0, 40))}
              placeholder="e.g. Marco"
              className="mt-2 w-full rounded-xl border-[3px] border-ink bg-white px-4 py-3 text-lg text-ink outline-none placeholder:text-neutral-400 focus:border-brand"
            />

            <label className="mt-6 block text-sm font-black text-ink">
              Your Instagram
            </label>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-neutral-500">
                @
              </span>
              <input
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                placeholder="yourhandle"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="w-full rounded-xl border-[3px] border-ink bg-white py-3 pl-9 pr-4 text-lg text-ink outline-none placeholder:text-neutral-400 focus:border-brand"
              />
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              She'll see "sent by @{instagramHandle.trim().replace(/^@/, "") || "yourhandle"}" and can
              tap through to your profile. Optional, but it's what makes the link look real instead of
              like spam.
            </p>

            <label className="mt-6 block text-sm font-black text-ink">
              Your email
            </label>
            <input
              type="email"
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              placeholder="you@email.com"
              className="mt-2 w-full rounded-xl border-[3px] border-ink bg-white px-4 py-3 text-lg text-ink outline-none placeholder:text-neutral-400 focus:border-brand"
            />
            <p className="mt-2 text-xs text-neutral-500">
              We email you the second she answers — and this is also your account, so your links
              are still here on any other phone. She never sees it.
            </p>

            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            <button
              type="button"
              disabled={!canGenerate}
              onClick={() => generateLink()}
              className="mt-6 w-full rounded-full border-[3px] border-ink bg-brand px-8 py-4 text-lg font-black text-ink shadow-[5px_5px_0_0_#1a1a1f] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-40 disabled:shadow-none"
            >
              Generate link →
            </button>
          </StepCard>
        )}

        {step === "generating" && (
          <StepCard key="generating">
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="text-5xl">⚡</div>
              <p className="font-semibold text-neutral-600">Generating your link…</p>
            </div>
          </StepCard>
        )}

        {/* Paid, but the webhook still hasn't granted the credit. Never
            send him back to the packages he already bought. */}
        {step === "awaitingCredits" && (
          <StepCard key="awaitingCredits">
            <h1 className="text-2xl font-extrabold">Payment received ✅</h1>
            <p className="mt-2 text-neutral-600">
              We&apos;re still confirming it with the payment provider. Nothing is lost — your
              answers are saved and your link is one tap away.
            </p>

            <button
              type="button"
              onClick={() => generateLink(currentDraft(), { waitForCredits: true })}
              className="mt-6 w-full rounded-full border-[3px] border-ink bg-brand px-8 py-4 text-lg font-black text-ink shadow-[5px_5px_0_0_#1a1a1f] transition-transform active:scale-95"
            >
              Create my link now →
            </button>

            <a
              href="/dashboard"
              className="mt-4 block w-full text-center text-sm font-semibold text-neutral-500"
            >
              Check my credits
            </a>
          </StepCard>
        )}

        {step === "paywall" && userId && (
          <StepCard key="paywall">
            <Paywall
              hasAccount={!isAnonymous}
              defaultEmail={notifyEmail.trim()}
              returnTo="/create"
              onBeforeCheckout={() => saveCreateDraft(currentDraft())}
              onCancel={() => setStep("about")}
            />
          </StepCard>
        )}

        {step === "result" && slug && (
          <StepCard key="result">
            <h1 className="text-2xl font-extrabold">Done. Ball's in her court 🎯</h1>
            <p className="mt-2 text-neutral-600">
              Send this link to {matchName}: she'll see a playful page, then the big question.
            </p>

            <div className="mt-6 rounded-xl border-[3px] border-ink bg-white p-3">
              <p className="break-all text-sm font-mono text-neutral-700">{fullLink}</p>
            </div>

            <div className="mt-4 rounded-xl border border-[3px] border-ink bg-amber-100 p-4 text-sm text-amber-900">
              <p className="font-black text-amber-900">Send it on WhatsApp or IG, not in the app</p>
              <p className="mt-1">
                Dating apps flag links dropped early in a chat as spam, and the preview doesn't
                render there anyway. Wait until you've moved to WhatsApp or Instagram — that's
                where she'll see your handle and the preview card.
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <CopyButton text={fullLink} />
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-brand px-6 py-3 text-center font-black text-ink shadow-[4px_4px_0_0_#1a1a1f] transition-transform active:scale-95"
              >
                Send on WhatsApp
              </a>
              <a
                href={`/r/${slug}`}
                className="rounded-full border-[3px] border-ink bg-white px-6 py-3 text-center font-black text-ink shadow-[4px_4px_0_0_#1a1a1f]"
              >
                Go to the results page
              </a>
            </div>

            {/* Not a wall — the free link is already done. Just the one
                moment he's most receptive to being told his account is
                half-finished, instead of finding out at the paywall. */}
            {isAnonymous && (
              <div className="mt-6 rounded-2xl border-[3px] border-ink bg-white p-4 shadow-[4px_4px_0_0_#1a1a1f]">
                <p className="font-black text-ink">Keep this link on your account</p>
                <p className="mt-1 text-sm text-neutral-600">
                  {confirmationSent ? (
                    <>
                      We sent a confirmation to{" "}
                      <strong className="text-ink">{notifyEmail.trim()}</strong>. Confirm it and
                      your links follow you to any phone.
                    </>
                  ) : (
                    <>
                      We couldn&apos;t send the confirmation email just now. Your link is safe —
                      claim your account here when you&apos;re ready.
                    </>
                  )}
                </p>
                <a
                  href="/account"
                  className="mt-3 inline-block rounded-full border-[3px] border-ink bg-brand px-5 py-2.5 text-sm font-black text-ink shadow-[3px_3px_0_0_#1a1a1f]"
                >
                  Confirm my email →
                </a>
              </div>
            )}

            <button type="button" onClick={reset} className="mt-6 w-full text-sm font-semibold text-brand">
              + Create another link
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
      className="rounded-3xl border-[3px] border-ink bg-white p-6 shadow-[8px_8px_0_0_#1a1a1f] sm:p-8"
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
      className="rounded-full border-[3px] border-ink bg-white px-6 py-3 font-black text-ink shadow-[4px_4px_0_0_#1a1a1f] transition-transform active:scale-95"
    >
      {copied ? "Copied ✅" : "Copy link"}
    </button>
  );
}
