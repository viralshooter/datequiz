"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pick, shuffle } from "@/lib/prng";

interface DrumrollProps {
  seed: number;
  senderName: string;
  onDone: (held: boolean, ms: number) => void;
}

/** How long she has to keep her finger down. */
const HOLD_MS = 1500;
/** Charge bleeds away faster than it builds, so letting go actually costs. */
const DECAY_MULTIPLIER = 2.2;
/** Escape hatch: this can never become a wall. */
const SKIP_APPEARS_AT_MS = 4000;
const AUTO_ADVANCE_MS = 15000;

/** All the waiting is at his expense, never hers. */
const HYPE_LINES = [
  "he practised this in the mirror",
  "he's been drafting this since Tuesday",
  "he almost just sent “hey” instead",
  "he has refreshed this page nine times",
  "his thumbs are sweating",
  "he rewrote this four times",
];

const RELEASE_TAUNTS = ["…you let go.", "so close.", "nerves?", "again. with feeling."];

function chargeLabel(charge: number): string {
  if (charge > 0.85) return "ALMOST—";
  if (charge > 0.6) return "don't let go 😳";
  if (charge > 0.25) return "keep going…";
  return "HOLD IT";
}

/**
 * The beat right before the question.
 *
 * Everything else in the flow is a tap or something she watches. This one
 * needs her finger held down, which is the one interaction you can't do
 * while half-reading something else — that's what buys the question its
 * full attention. It also makes the reveal feel earned rather than
 * simply next.
 */
export function Drumroll({ seed, senderName, onDone }: DrumrollProps) {
  const [charge, setCharge] = useState(0);
  const [holding, setHolding] = useState(false);
  const [released, setReleased] = useState(0);
  const [boom, setBoom] = useState(false);
  const [showSkip, setShowSkip] = useState(false);

  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);
  const holdingRef = useRef(false);
  const chargeRef = useRef(0);
  const doneRef = useRef(false);
  const startedAtRef = useRef(Date.now());

  const hype = pick(seed, "drumroll-hype", HYPE_LINES);
  const taunts = shuffle(seed, "drumroll-taunts", RELEASE_TAUNTS);
  const name = senderName || "He";

  const finish = useCallback(
    (held: boolean) => {
      if (doneRef.current) return;
      doneRef.current = true;
      onDone(held, Date.now() - startedAtRef.current);
    },
    [onDone]
  );

  // One rAF loop drives both directions: filling while held, draining
  // when she lets go.
  useEffect(() => {
    function tick(now: number) {
      const dt = lastTickRef.current ? now - lastTickRef.current : 16;
      lastTickRef.current = now;

      const delta = holdingRef.current
        ? dt / HOLD_MS
        : -(dt / HOLD_MS) * DECAY_MULTIPLIER;
      const next = Math.min(1, Math.max(0, chargeRef.current + delta));

      if (next !== chargeRef.current) {
        chargeRef.current = next;
        setCharge(next);
      }

      if (next >= 1 && !doneRef.current) {
        setBoom(true);
        window.setTimeout(() => finish(true), 700);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [finish]);

  useEffect(() => {
    const skip = window.setTimeout(() => setShowSkip(true), SKIP_APPEARS_AT_MS);
    const auto = window.setTimeout(() => finish(false), AUTO_ADVANCE_MS);
    return () => {
      window.clearTimeout(skip);
      window.clearTimeout(auto);
    };
  }, [finish]);

  function startHold() {
    holdingRef.current = true;
    setHolding(true);
  }

  function stopHold() {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    setHolding(false);
    if (chargeRef.current > 0.1 && chargeRef.current < 1) setReleased((n) => n + 1);
  }

  const shake = charge * 6;

  return (
    <motion.div
      className="relative flex w-full flex-1 flex-col items-center justify-center gap-6 overflow-hidden px-6 py-10 text-center"
      animate={{ x: charge > 0.1 ? [-shake, shake, -shake] : 0 }}
      transition={{ duration: 0.12, repeat: charge > 0.1 ? Infinity : 0 }}
    >
      {/* the glow swells with the charge */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/30 blur-3xl"
        animate={{ scale: 0.6 + charge * 1.6, opacity: 0.3 + charge * 0.6 }}
        transition={{ duration: 0.1 }}
      />

      <div className="space-y-1">
        <motion.p
          className="text-[11px] font-black uppercase tracking-[0.25em] text-neutral-400"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {name} has one question
        </motion.p>
        <motion.p
          className="text-sm font-bold text-neutral-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          ({hype})
        </motion.p>
      </div>

      <motion.h1
        className="text-4xl font-black leading-tight text-ink"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        Ready?
      </motion.h1>

      {/* the detonator */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          startHold();
        }}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        onContextMenu={(e) => e.preventDefault()}
        style={{ touchAction: "none", WebkitTouchCallout: "none" }}
        className="relative flex h-44 w-44 select-none items-center justify-center rounded-full border-[5px] border-ink bg-brand shadow-[8px_8px_0_0_#1a1a1f] transition-transform active:translate-x-1 active:translate-y-1 active:shadow-[4px_4px_0_0_#1a1a1f]"
      >
        {/* charge ring */}
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden>
          {/* Hidden below a hair of charge: a round cap on a zero-length
              arc still paints a stray dot on the rim. */}
          {charge > 0.01 && (
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#1a1a1f"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${charge * 276} 276`}
              opacity={0.85}
            />
          )}
        </svg>

        <span className="px-4 text-lg font-black uppercase leading-tight text-ink">
          {holding ? chargeLabel(charge) : "Hold to open"}
        </span>
      </button>

      <div className="h-6">
        <AnimatePresence mode="wait">
          {released > 0 && !holding && charge < 0.05 && (
            <motion.p
              key={released}
              className="text-base font-black text-neutral-400"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {taunts[(released - 1) % taunts.length]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {showSkip && !boom && (
        <motion.button
          type="button"
          onClick={() => finish(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-4 right-4 min-h-11 rounded-full border-2 border-ink/20 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-wide text-neutral-600 backdrop-blur"
        >
          Just show me →
        </motion.button>
      )}

      {/* detonation */}
      {boom && (
        <>
          <motion.div
            className="pointer-events-none absolute inset-0 z-30 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          />
          {["🎉", "💥", "✨", "💌", "🔥", "🥁", "😳", "💫"].map((emoji, i) => (
            <motion.span
              key={i}
              className="pointer-events-none absolute left-1/2 top-1/2 z-20 text-4xl"
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{
                x: Math.cos((i / 8) * Math.PI * 2) * 190,
                y: Math.sin((i / 8) * Math.PI * 2) * 190,
                scale: 1.3,
                opacity: 0,
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              {emoji}
            </motion.span>
          ))}
        </>
      )}
    </motion.div>
  );
}
