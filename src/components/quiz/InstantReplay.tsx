"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { pick } from "@/lib/prng";
import type { EscapePoint } from "@/types/flow";

interface InstantReplayProps {
  seed: number;
  escapes: number;
  escapeTrail: EscapePoint[];
  onDone: () => void;
}

const STEP_MS = 800;
const PARTICLES = ["🎉", "💌", "✨", "🥳", "💫", "❤️", "🔥", "😍"];

/** Straight to yes deserves credit — and he deserves none of it. */
const FIRST_TRY_LINES = [
  "He had a whole bit prepared. You skipped it.",
  "He was ready for a fight. You gave him none.",
  "He is going to be unbearable about this.",
  "He didn't even get to use his taunts.",
];

/**
 * The beat straight after the question, in both directions.
 *
 * If she made the NO run first, she gets the replay of it — her own taps,
 * slowed down, ending on the YES. If she went straight to yes, there's
 * nothing to replay, so she gets the credit for it instead. Either way
 * this is the payoff for what she just did, which is why it sits here
 * rather than being one of the twists that may or may not be drawn.
 */
export function InstantReplay({ seed, escapes, escapeTrail, onDone }: InstantReplayProps) {
  const firstTry = escapes === 0;
  return firstTry ? (
    <FirstTry seed={seed} onDone={onDone} />
  ) : (
    <Replay escapes={escapes} escapeTrail={escapeTrail} onDone={onDone} />
  );
}

function Confetti() {
  return (
    <>
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute bottom-0 text-3xl"
          style={{ left: `${6 + i * 6.5}%` }}
          initial={{ opacity: 0, y: 40, scale: 0.4 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: -300 - (i % 4) * 40,
            x: (i % 2 ? 1 : -1) * (20 + (i % 5) * 12),
            rotate: (i % 2 ? 1 : -1) * 90,
            scale: 1,
          }}
          transition={{ duration: 1.5 + (i % 3) * 0.25, delay: (i % 6) * 0.07, ease: "easeOut" }}
        >
          {PARTICLES[i % PARTICLES.length]}
        </motion.span>
      ))}
    </>
  );
}

function FirstTry({ seed, onDone }: { seed: number; onDone: () => void }) {
  const line = pick(seed, "first-try", FIRST_TRY_LINES);

  useEffect(() => {
    const t = window.setTimeout(onDone, 3400);
    return () => window.clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="relative flex w-full flex-1 flex-col items-center justify-center gap-4 overflow-hidden px-6 text-center"
      onClick={onDone}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Confetti />

      <motion.div
        className="text-7xl"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: [0, 1.3, 1], rotate: 0 }}
        transition={{
          scale: { duration: 0.5, ease: "easeOut" },
          rotate: { type: "spring", stiffness: 260, damping: 12 },
        }}
      >
        ⚡
      </motion.div>

      <motion.p
        className="text-[11px] font-black uppercase tracking-[0.25em] text-brand-dark"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        First tap · no hesitation
      </motion.p>

      <motion.h1
        className="text-4xl font-black leading-tight text-ink"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, type: "spring", stiffness: 260, damping: 20 }}
      >
        Straight to yes.
      </motion.h1>

      <motion.p
        className="max-w-xs text-base font-semibold text-neutral-600"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        {line}
      </motion.p>

      <motion.p
        className="absolute bottom-6 text-xs text-neutral-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        tap to continue
      </motion.p>
    </motion.div>
  );
}

function Replay({
  escapes,
  escapeTrail,
  onDone,
}: {
  escapes: number;
  escapeTrail: EscapePoint[];
  onDone: () => void;
}) {
  // The NO starts centre-right, which is where EvasiveAskOut parks it.
  const points = [{ xPct: 62, yPct: 60 }, ...escapeTrail];
  const replayMs = Math.min(points.length * STEP_MS, 3400);

  const commentary = [
    "Let's go to the replay 🎙️",
    "She lines it up…",
    "Oh, and it's GONE.",
    `${escapes} ${escapes === 1 ? "attempt" : "attempts"}. Zero contact.`,
  ];

  const [line, setLine] = useState(0);
  const [showYes, setShowYes] = useState(false);

  useEffect(() => {
    const timers = commentary.map((_, i) =>
      window.setTimeout(() => setLine(i), (i * replayMs) / commentary.length)
    );
    // Then the part he'll want to see: the tap that actually landed.
    const yes = window.setTimeout(() => setShowYes(true), replayMs + 250);
    const done = window.setTimeout(onDone, replayMs + 2600);
    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(yes);
      window.clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayMs, onDone]);

  return (
    <motion.div
      className="relative flex w-full flex-1 flex-col items-center gap-3 overflow-hidden px-5 py-10 text-center"
      onClick={onDone}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center gap-2">
        <motion.span
          className="h-2.5 w-2.5 rounded-full bg-red-500"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.1, repeat: Infinity }}
        />
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500">
          {showYes ? "The one that landed" : "Slow-motion replay"}
        </p>
      </div>

      <div className="relative w-full max-w-xs flex-1 overflow-hidden rounded-3xl border-[3px] border-ink bg-gradient-to-b from-neutral-900 to-neutral-800 shadow-[8px_8px_0_0_#1a1a1f]">
        {/* every position the NO fled to */}
        {escapeTrail.map((point, i) => (
          <span
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 px-3 py-1 text-[10px] font-black text-white/25"
            style={{ left: `${point.xPct}%`, top: `${point.yPct}%` }}
          >
            NO
          </span>
        ))}

        <motion.span
          className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-dark px-5 py-2 text-sm font-black text-white"
          animate={
            showYes
              ? { scale: [1, 1.45, 1.2], boxShadow: "0 0 45px rgba(34,197,94,0.9)" }
              : { scale: 1 }
          }
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          YES
        </motion.span>

        {!showYes && (
          <motion.span
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/60 bg-white px-4 py-2 text-sm font-black text-neutral-600"
            initial={{ left: `${points[0].xPct}%`, top: `${points[0].yPct}%` }}
            animate={{
              left: points.map((p) => `${p.xPct}%`),
              top: points.map((p) => `${p.yPct}%`),
            }}
            // Keyframe arrays must not run on a spring — duration only.
            transition={{ duration: replayMs / 1000, ease: "linear" }}
          >
            NO
          </motion.span>
        )}

        {showYes && (
          <motion.span
            className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-6xl"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2.6, opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            👆
          </motion.span>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-black/50 px-3 py-2">
          <motion.p
            key={showYes ? "yes" : line}
            className="text-xs font-bold text-white"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {showYes ? "…and there it is. YES. 🎉" : commentary[line]}
          </motion.p>
        </div>
      </div>

      <p className="text-xs text-neutral-400">tap to continue</p>
    </motion.div>
  );
}
