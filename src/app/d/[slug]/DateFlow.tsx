"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EvasiveAskOut } from "@/components/quiz/EvasiveAskOut";
import { CelebrationScreen } from "@/components/quiz/CelebrationScreen";
import { ActivityGrid } from "@/components/quiz/ActivityGrid";
import { DayPicker } from "@/components/quiz/DayPicker";
import { ConfirmSummary } from "@/components/quiz/ConfirmSummary";
import { DoneScreen } from "@/components/quiz/DoneScreen";
import { trackEvent } from "@/lib/events";
import { instagramProfileUrl } from "@/lib/instagram";
import type { ActivityId } from "@/types/content";

type Step = "hero" | "askOut" | "celebration" | "activities" | "days" | "confirm" | "done";

const STEP_ORDER: Step[] = ["hero", "askOut", "celebration", "activities", "days", "confirm", "done"];

interface DateFlowProps {
  slug: string;
  matchName: string;
  availableDays: string[];
  instagramHandle: string;
  senderName: string;
  personalNote: string;
  alreadyAnswered: boolean;
}

export function DateFlow({
  slug,
  matchName,
  availableDays,
  instagramHandle,
  senderName,
  personalNote,
  alreadyAnswered,
}: DateFlowProps) {
  const [step, setStep] = useState<Step>(alreadyAnswered ? "done" : "hero");
  const [selectedActivities, setSelectedActivities] = useState<ActivityId[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function handleYes() {
    trackEvent("answered_yes", slug);
    setStep("celebration");
  }

  useEffect(() => {
    if (step === "celebration") {
      const timeout = window.setTimeout(() => setStep("activities"), 1800);
      return () => window.clearTimeout(timeout);
    }
  }, [step]);

  function handleActivitiesConfirm(activities: ActivityId[]) {
    trackEvent("activities_selected", slug, { activities });
    setSelectedActivities(activities);
    setStep("days");
  }

  function handleDaysContinue(days: string[]) {
    setSelectedDays(days);
    setStep("confirm");
  }

  const submitAnswer = useCallback(async () => {
    setSubmitting(true);
    try {
      await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          selected_activities: selectedActivities,
          selected_days: selectedDays,
        }),
      });
    } finally {
      setSubmitting(false);
    }
  }, [slug, selectedActivities, selectedDays]);

  async function handleFinalConfirm() {
    await submitAnswer();
    setStep("done");
  }

  const progress = STEP_ORDER.indexOf(step) / (STEP_ORDER.length - 1);

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-gradient-to-b from-cream via-white to-white">
      <FloatingBackground />

      <div className="sticky top-0 z-20 h-1.5 w-full bg-black/5" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <motion.div
          className="h-full bg-brand-dark"
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>

      <div
        className="relative z-10 flex flex-1 flex-col"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <AnimatePresence mode="wait">
          {step === "hero" && (
            <StepTransition key="hero">
              <Hero
                matchName={matchName}
                instagramHandle={instagramHandle}
                senderName={senderName}
                personalNote={personalNote}
                onStart={() => setStep("askOut")}
              />
            </StepTransition>
          )}

          {step === "askOut" && (
            <StepTransition key="askOut">
              <EvasiveAskOut matchName={matchName} onYes={handleYes} />
            </StepTransition>
          )}

          {step === "celebration" && (
            <StepTransition key="celebration">
              <CelebrationScreen />
            </StepTransition>
          )}

          {step === "activities" && (
            <StepTransition key="activities">
              <ActivityGrid onConfirm={handleActivitiesConfirm} />
            </StepTransition>
          )}

          {step === "days" && (
            <StepTransition key="days">
              <DayPicker availableDays={availableDays} onContinue={handleDaysContinue} />
            </StepTransition>
          )}

          {step === "confirm" && (
            <StepTransition key="confirm">
              <ConfirmSummary
                activities={selectedActivities}
                days={selectedDays}
                submitting={submitting}
                onConfirm={handleFinalConfirm}
              />
            </StepTransition>
          )}

          {step === "done" && (
            <StepTransition key="done">
              <DoneScreen />
            </StepTransition>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="flex min-h-0 w-full flex-1 flex-col"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}

/** Blob morbide e sfocate che fluttuano piano sullo sfondo: danno vita
 * a una UI altrimenti statica senza distrarre dal contenuto. */
function FloatingBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-brand/20 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/3 top-1/2 h-48 w-48 rounded-full bg-brand/10 blur-3xl"
        animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function Hero({
  matchName,
  instagramHandle,
  senderName,
  personalNote,
  onStart,
}: {
  matchName: string;
  instagramHandle: string;
  senderName: string;
  personalNote: string;
  onStart: () => void;
}) {
  return (
    <motion.div
      className="flex w-full flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {instagramHandle && (
        <motion.a
          href={instagramProfileUrl(instagramHandle)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white/70 px-4 py-2 text-sm font-semibold text-neutral-600 shadow-sm backdrop-blur"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="text-neutral-400">sent by</span>
          <span className="text-neutral-900">@{instagramHandle}</span>
          <span aria-hidden>↗</span>
        </motion.a>
      )}

      <motion.div
        className="text-7xl"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0, y: [0, -10, 0] }}
        transition={{
          scale: { type: "spring", stiffness: 260, damping: 14 },
          rotate: { type: "spring", stiffness: 260, damping: 14 },
          y: { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
        }}
      >
        💌
      </motion.div>

      <motion.h1
        className="text-3xl font-extrabold leading-tight text-neutral-900"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        Hey {matchName} 👋
        {senderName && (
          <span className="mt-1 block text-xl font-bold text-neutral-500">
            it's {senderName}
          </span>
        )}
      </motion.h1>

      {personalNote && (
        <motion.div
          className="relative max-w-xs rounded-2xl rounded-bl-sm border border-neutral-200 bg-white px-5 py-4 text-left text-[15px] leading-relaxed text-neutral-700 shadow-sm"
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
        >
          {personalNote}
        </motion.div>
      )}

      <motion.p
        className="max-w-xs text-neutral-600"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        I've got a quick question for you. 30 seconds, promise.
      </motion.p>

      <motion.button
        type="button"
        onClick={onStart}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0, boxShadow: ["0 10px 30px rgba(22,163,74,0.25)", "0 10px 40px rgba(22,163,74,0.45)", "0 10px 30px rgba(22,163,74,0.25)"] }}
        transition={{
          opacity: { delay: 0.35 },
          y: { delay: 0.35 },
          boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        }}
        whileTap={{ scale: 0.95 }}
        className="mt-4 w-full max-w-xs rounded-full bg-brand-dark px-8 py-4 text-lg font-bold text-white"
      >
        Let's go →
      </motion.button>
    </motion.div>
  );
}
