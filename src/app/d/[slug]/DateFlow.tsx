"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ColdOpen } from "@/components/quiz/ColdOpen";
import { Drumroll } from "@/components/quiz/Drumroll";
import { EvasiveAskOut } from "@/components/quiz/EvasiveAskOut";
import { CelebrationScreen } from "@/components/quiz/CelebrationScreen";
import { Tournament } from "@/components/quiz/Tournament";
import { DayPicker } from "@/components/quiz/DayPicker";
import { CounterCondition } from "@/components/quiz/CounterCondition";
import { GoldenCard } from "@/components/quiz/GoldenCard";
import { VetoPicker } from "@/components/quiz/VetoPicker";
import { EndingScreen } from "@/components/quiz/EndingScreen";
import { DoneScreen } from "@/components/quiz/DoneScreen";
import { TwistSlot } from "@/components/quiz/twists/TwistSlot";
import { buildFlowPlan, selectTwist } from "@/lib/flowPlan";
import { trackEvent } from "@/lib/events";
import { instagramProfileUrl } from "@/lib/instagram";
import type { ActivityId } from "@/types/content";
import type {
  EndingType,
  EscapePoint,
  LinkMode,
  TournamentResult,
  TwistContext,
  TwistId,
} from "@/types/flow";

type Step =
  | "coldOpen"
  | "hero"
  | "drumroll"
  | "askOut"
  | "celebration"
  | "twist1"
  | "tournament"
  | "jolly"
  | "twist2"
  | "veto"
  | "days"
  | "counter"
  | "ending"
  | "alreadyAnswered";

/** Only used to draw the progress bar; the veto step is optional. */
const STEP_ORDER: Step[] = [
  "coldOpen",
  "hero",
  "drumroll",
  "askOut",
  "celebration",
  "twist1",
  "tournament",
  "jolly",
  "twist2",
  "veto",
  "days",
  "counter",
  "ending",
];

interface DateFlowProps {
  slug: string;
  seed: number;
  mode: LinkMode;
  matchName: string;
  availableDays: string[];
  instagramHandle: string;
  senderName: string;
  personalNote: string;
  alreadyAnswered: boolean;
}

export function DateFlow({
  slug,
  seed,
  mode,
  matchName,
  availableDays,
  instagramHandle,
  senderName,
  personalNote,
  alreadyAnswered,
}: DateFlowProps) {
  const plan = useMemo(() => buildFlowPlan(seed, mode), [seed, mode]);

  const [step, setStep] = useState<Step>(alreadyAnswered ? "alreadyAnswered" : "coldOpen");
  const [escapes, setEscapes] = useState(0);
  const [escapeTrail, setEscapeTrail] = useState<EscapePoint[]>([]);
  const [tournament, setTournament] = useState<TournamentResult | null>(null);
  const [slot1Twist, setSlot1Twist] = useState<TwistId | null>(null);
  const [slot2Twist, setSlot2Twist] = useState<TwistId | null>(null);
  const [vetoed, setVetoed] = useState<ActivityId | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [condition, setCondition] = useState("");

  const endingType: EndingType = plan.jollyHit
    ? plan.jollyKind === "blind"
      ? "blind"
      : "rare"
    : "classic";

  const twistCtx: TwistContext = {
    seed,
    matchName,
    senderName,
    escapes,
    escapeTrail,
  };
  // Read inside timers/callbacks that shouldn't re-subscribe on every escape.
  const twistCtxRef = useRef(twistCtx);
  twistCtxRef.current = twistCtx;

  useEffect(() => {
    if (!alreadyAnswered) {
      trackEvent("cold_open_variant", slug, { variant: plan.coldOpen });
    }
  }, [alreadyAnswered, plan.coldOpen, slug]);

  const handleEscape = useCallback((point: EscapePoint, count: number) => {
    setEscapes(count);
    setEscapeTrail((prev) => [...prev, point]);
  }, []);

  function handleYes() {
    trackEvent("answered_yes", slug, { escapes });
    setStep("celebration");
  }

  // Celebration is a beat, not a screen: it hands off on its own.
  useEffect(() => {
    if (step !== "celebration") return;
    const timeout = window.setTimeout(() => openSlot1(), 1800);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function openSlot1() {
    const id = selectTwist(plan, twistCtxRef.current, []);
    if (!id) {
      setStep("tournament");
      return;
    }
    setSlot1Twist(id);
    trackEvent("twist_shown", slug, { twist: id, slot: 1 });
    setStep("twist1");
  }

  function openSlot2() {
    // The jolly roll is pure seeded chance: it either exists for this
    // link or it never will, however many times she reloads.
    if (plan.jollyHit) {
      trackEvent("jolly_triggered", slug, { kind: plan.jollyKind });
      setStep("jolly");
      return;
    }

    const id = selectTwist(plan, twistCtxRef.current, slot1Twist ? [slot1Twist] : []);
    if (!id) {
      setStep("days");
      return;
    }
    setSlot2Twist(id);
    trackEvent("twist_shown", slug, { twist: id, slot: 2 });
    setStep("twist2");
  }

  function finishTwist(id: TwistId | null, slot: number, skipped: boolean, next: Step) {
    if (skipped && id) trackEvent("twist_skipped", slug, { twist: id, slot });
    setStep(next);
  }

  function handleTournament(result: TournamentResult) {
    setTournament(result);
    trackEvent("tournament_completed", slug, {
      champion: result.champion,
      ranking: result.ranking,
    });
    openSlot2();
  }

  function handleCondition(chosen: string) {
    setCondition(chosen);
    trackEvent("counter_condition_chosen", slug, { condition: chosen });
    trackEvent("ending_type", slug, { ending: endingType });
    // Submit in the background and show the ending regardless: a failed
    // save must never leave her staring at a spinner.
    void submitAnswer(chosen);
    setStep("ending");
  }

  async function submitAnswer(chosenCondition: string) {
    const ranking = (tournament?.ranking ?? []).filter((id) => id !== vetoed);
    const payload = {
      slug,
      selected_activities: ranking.slice(0, 3),
      selected_days: selectedDays,
      activity_ranking: ranking,
      counter_condition: chosenCondition,
      ending_type: endingType,
      vetoed_activity: vetoed ?? "",
      reveal_activities: endingType !== "blind",
    };

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch("/api/answers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        });
        if (res.ok || res.status === 409) return;
      } catch {
        // retried once below, then given up on silently
      }
    }
  }

  const progress = STEP_ORDER.indexOf(step) / (STEP_ORDER.length - 1);

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-gradient-to-b from-cream via-white to-white">
      <FloatingBackground />

      <div
        className="sticky top-0 z-20 h-1.5 w-full bg-black/5"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <motion.div
          className="h-full bg-brand-dark"
          initial={false}
          animate={{ width: `${Math.max(progress, 0) * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>

      <div
        className="relative z-10 flex flex-1 flex-col"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <AnimatePresence mode="wait">
          {step === "coldOpen" && (
            <StepTransition key="coldOpen">
              <ColdOpen
                variant={plan.coldOpen}
                matchName={matchName}
                onDone={() => setStep("hero")}
              />
            </StepTransition>
          )}

          {step === "hero" && (
            <StepTransition key="hero">
              <Hero
                matchName={matchName}
                instagramHandle={instagramHandle}
                senderName={senderName}
                personalNote={personalNote}
                onStart={() => setStep("drumroll")}
              />
            </StepTransition>
          )}

          {step === "drumroll" && (
            <StepTransition key="drumroll">
              <Drumroll
                seed={seed}
                senderName={senderName}
                onDone={(held, ms) => {
                  trackEvent("drumroll_completed", slug, { held, ms });
                  setStep("askOut");
                }}
              />
            </StepTransition>
          )}

          {step === "askOut" && (
            <StepTransition key="askOut">
              <EvasiveAskOut
                matchName={matchName}
                seed={seed}
                onYes={handleYes}
                onEscape={handleEscape}
              />
            </StepTransition>
          )}

          {step === "celebration" && (
            <StepTransition key="celebration">
              <CelebrationScreen />
            </StepTransition>
          )}

          {step === "twist1" && slot1Twist && (
            <StepTransition key="twist1">
              <TwistSlot
                id={slot1Twist}
                ctx={twistCtx}
                onDone={(skipped) => finishTwist(slot1Twist, 1, skipped, "tournament")}
              />
            </StepTransition>
          )}

          {step === "tournament" && (
            <StepTransition key="tournament">
              <Tournament bracket={plan.bracket} onComplete={handleTournament} />
            </StepTransition>
          )}

          {step === "jolly" && (
            <StepTransition key="jolly">
              <GoldenCard
                kind={plan.jollyKind}
                onContinue={() => setStep(plan.jollyKind === "veto" ? "veto" : "days")}
              />
            </StepTransition>
          )}

          {step === "twist2" && slot2Twist && (
            <StepTransition key="twist2">
              <TwistSlot
                id={slot2Twist}
                ctx={twistCtx}
                onDone={(skipped) => finishTwist(slot2Twist, 2, skipped, "days")}
              />
            </StepTransition>
          )}

          {step === "veto" && tournament && (
            <StepTransition key="veto">
              <VetoPicker
                ranking={tournament.ranking}
                onVeto={(id) => {
                  setVetoed(id);
                  setStep("days");
                }}
              />
            </StepTransition>
          )}

          {step === "days" && (
            <StepTransition key="days">
              <DayPicker
                availableDays={availableDays}
                onContinue={(days) => {
                  setSelectedDays(days);
                  setStep("counter");
                }}
              />
            </StepTransition>
          )}

          {step === "counter" && (
            <StepTransition key="counter">
              <CounterCondition options={plan.counterOptions} onChoose={handleCondition} />
            </StepTransition>
          )}

          {step === "ending" && tournament && (
            <StepTransition key="ending">
              <EndingScreen
                endingType={endingType}
                matchName={matchName}
                senderName={senderName}
                champion={tournament.ranking.filter((id) => id !== vetoed)[0]}
                days={selectedDays}
                condition={condition}
                vetoed={vetoed}
              />
            </StepTransition>
          )}

          {step === "alreadyAnswered" && (
            <StepTransition key="alreadyAnswered">
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
            it&apos;s {senderName}
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
        I&apos;ve got a quick question for you. 30 seconds, promise.
      </motion.p>

      <motion.button
        type="button"
        onClick={onStart}
        initial={{ opacity: 0, y: 12 }}
        animate={{
          opacity: 1,
          y: 0,
          boxShadow: [
            "0 10px 30px rgba(22,163,74,0.25)",
            "0 10px 40px rgba(22,163,74,0.45)",
            "0 10px 30px rgba(22,163,74,0.25)",
          ],
        }}
        transition={{
          opacity: { delay: 0.35 },
          y: { delay: 0.35 },
          boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        }}
        whileTap={{ scale: 0.95 }}
        className="mt-4 w-full max-w-xs rounded-full bg-brand-dark px-8 py-4 text-lg font-bold text-white"
      >
        Let&apos;s go →
      </motion.button>
    </motion.div>
  );
}
