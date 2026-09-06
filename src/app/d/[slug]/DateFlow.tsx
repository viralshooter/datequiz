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
import type { ActivityId } from "@/types/content";

type Step = "hero" | "askOut" | "celebration" | "activities" | "days" | "confirm" | "done";

interface DateFlowProps {
  slug: string;
  matchName: string;
  availableDays: string[];
  alreadyAnswered: boolean;
}

export function DateFlow({ slug, matchName, availableDays, alreadyAnswered }: DateFlowProps) {
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

  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col bg-gradient-to-b from-cream via-white to-white">
      {step === "hero" && <Hero matchName={matchName} onStart={() => setStep("askOut")} />}

      {step === "askOut" && <EvasiveAskOut matchName={matchName} onYes={handleYes} />}

      {step === "celebration" && <CelebrationScreen />}

      {step === "activities" && <ActivityGrid onConfirm={handleActivitiesConfirm} />}

      {step === "days" && (
        <DayPicker availableDays={availableDays} onContinue={handleDaysContinue} />
      )}

      {step === "confirm" && (
        <ConfirmSummary
          activities={selectedActivities}
          days={selectedDays}
          submitting={submitting}
          onConfirm={handleFinalConfirm}
        />
      )}

      {step === "done" && <DoneScreen />}
    </div>
  );
}

function Hero({ matchName, onStart }: { matchName: string; onStart: () => void }) {
  return (
    <motion.div
      className="flex h-full w-full flex-col items-center justify-center gap-6 px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <AnimatePresence>
        <motion.div
          className="text-6xl"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 14 }}
        >
          💌
        </motion.div>
      </AnimatePresence>

      <h1 className="text-3xl font-extrabold leading-tight text-neutral-900">
        Ehi {matchName} 👋
      </h1>
      <p className="max-w-xs text-neutral-600">
        Ho una domanda veloce per te. Ci metti 30 secondi, promesso.
      </p>

      <button
        type="button"
        onClick={onStart}
        className="mt-4 w-full max-w-xs rounded-full bg-brand-dark px-8 py-4 text-lg font-bold text-white shadow-lg shadow-brand/30 transition-transform active:scale-95"
      >
        Dai, vai →
      </button>
    </motion.div>
  );
}
