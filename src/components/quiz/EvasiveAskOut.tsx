"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ASK_OUT_QUESTION, NO_PROXIMITY_RADIUS, YES_GROWTH } from "@/config/content";
import { createRng } from "@/lib/prng";
import type { EscapePoint } from "@/types/flow";

interface EvasiveAskOutProps {
  matchName: string;
  seed: number;
  onYes: () => void;
  onEscape: (point: EscapePoint, count: number) => void;
}

const EVADE_COOLDOWN_MS = 260;

/** Where the NO parks itself before she's touched anything. */
const START_POSITION: EscapePoint = { xPct: 62, yPct: 60 };

/** Tucked just behind YES, with an edge still poking out. */
const HIDING_SPOT: EscapePoint = { xPct: 58, yPct: 53 };

/**
 * The escalation is scripted, not random — the progression *is* the joke,
 * so it has to land in the same order every time:
 *   1. silent
 *   2. it starts commenting
 *   3. it hides behind YES
 *   4. it gives up and relabels itself
 */
const REACTIONS: Record<number, string> = {
  2: "…seriously?",
  3: "okay, now it's hiding",
  4: "fine. have it your way.",
};

function reactionFor(escapes: number): string | null {
  if (escapes < 2) return null;
  return REACTIONS[Math.min(escapes, 4)];
}

/**
 * Seeded so the whole path is reproducible on reload: the nth escape
 * always lands in the same place for a given link.
 */
function positionForEscape(seed: number, n: number): EscapePoint {
  const rng = createRng(seed, `escape-${n}`);
  for (let attempt = 0; attempt < 6; attempt++) {
    const xPct = 14 + rng() * 72;
    const yPct = 22 + rng() * 62;
    // Keep clear of the YES button sitting dead centre.
    if (Math.hypot(xPct - 50, yPct - 50) > 20) return { xPct, yPct };
  }
  return { xPct: 82, yPct: 78 };
}

export function EvasiveAskOut({ matchName, seed, onYes, onEscape }: EvasiveAskOutProps) {
  const noRef = useRef<HTMLButtonElement>(null);
  const lastEvadeRef = useRef(0);
  const escapesRef = useRef(0);
  const pointerOriginRef = useRef<{ x: number; y: number } | null>(null);
  const pointerMovedRef = useRef(false);

  const [noPos, setNoPos] = useState<EscapePoint>(START_POSITION);
  const [escapes, setEscapes] = useState(0);
  const [puff, setPuff] = useState<{ xPct: number; yPct: number; id: number } | null>(null);
  const puffIdRef = useRef(0);

  const evade = useCallback(() => {
    const now = Date.now();
    if (now - lastEvadeRef.current < EVADE_COOLDOWN_MS) return;
    lastEvadeRef.current = now;

    const count = escapesRef.current + 1;
    escapesRef.current = count;

    const target = count === 3 ? HIDING_SPOT : positionForEscape(seed, count);

    setNoPos((prev) => {
      puffIdRef.current += 1;
      setPuff({ xPct: prev.xPct, yPct: prev.yPct, id: puffIdRef.current });
      return target;
    });
    setEscapes(count);
    onEscape(target, count);
  }, [seed, onEscape]);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      // The NO animates into place on mount and can slide under a cursor
      // that never moved, which would score an escape she didn't make —
      // and cost her the credit for going straight to yes. So nothing
      // counts until the pointer has actually travelled.
      const origin = pointerOriginRef.current;
      if (!origin) {
        pointerOriginRef.current = { x: e.clientX, y: e.clientY };
        return;
      }
      if (!pointerMovedRef.current) {
        if (Math.hypot(e.clientX - origin.x, e.clientY - origin.y) < 12) return;
        pointerMovedRef.current = true;
      }

      const button = noRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const dist = Math.hypot(
        e.clientX - (rect.left + rect.width / 2),
        e.clientY - (rect.top + rect.height / 2)
      );
      if (dist < NO_PROXIMITY_RADIUS) evade();
    }

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [evade]);

  const yesScale = Math.min(YES_GROWTH.base + escapes * YES_GROWTH.step, YES_GROWTH.max);
  const reaction = reactionFor(escapes);
  const isHiding = escapes === 3;
  const hasGivenUp = escapes >= 4;

  return (
    <div className="relative w-full flex-1 overflow-hidden px-6 pt-16 text-center">
      <motion.p
        className="mx-auto max-w-xs text-3xl font-extrabold leading-snug text-neutral-900"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {matchName}, {ASK_OUT_QUESTION.toLowerCase()}
      </motion.p>

      {reaction && (
        <motion.p
          key={reaction}
          className="mx-auto mt-4 max-w-xs text-base font-black text-neutral-400"
          initial={{ opacity: 0, y: -6, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
        >
          {reaction}
        </motion.p>
      )}

      {puff && (
        <motion.span
          key={puff.id}
          className="pointer-events-none absolute text-3xl"
          style={{
            left: `${puff.xPct}%`,
            top: `${puff.yPct}%`,
            translateX: "-50%",
            translateY: "-50%",
          }}
          initial={{ opacity: 0.9, scale: 0.8 }}
          animate={{ opacity: 0, scale: 1.8 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          💨
        </motion.span>
      )}

      <motion.button
        type="button"
        onClick={onYes}
        animate={{
          scale: yesScale,
          boxShadow: [
            "0 10px 30px rgba(22,163,74,0.3)",
            "0 10px 45px rgba(22,163,74,0.55)",
            "0 10px 30px rgba(22,163,74,0.3)",
          ],
        }}
        transition={{
          scale: { type: "spring", stiffness: 300, damping: 16 },
          boxShadow: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-dark px-8 py-4 text-lg font-bold text-white"
      >
        YES
      </motion.button>

      <motion.button
        ref={noRef}
        type="button"
        tabIndex={-1}
        onMouseEnter={() => {
          // Same guard: the button arriving under a still cursor isn't a try.
          if (pointerMovedRef.current) evade();
        }}
        onTouchStart={evade}
        onClick={evade}
        animate={{
          left: `${noPos.xPct}%`,
          top: `${noPos.yPct}%`,
          rotate: escapes === 0 ? [0, -4, 4, -4, 0] : 0,
        }}
        transition={{
          left: { type: "spring", stiffness: 260, damping: 14 },
          top: { type: "spring", stiffness: 260, damping: 14 },
          rotate: { duration: 1.2, repeat: Infinity, repeatDelay: 0.6 },
        }}
        style={{ position: "absolute", translateX: "-50%", translateY: "-50%" }}
        className={`select-none rounded-full border-2 border-neutral-200 bg-white px-8 py-4 text-lg font-bold text-neutral-500 ${
          isHiding ? "z-0" : "z-10"
        }`}
      >
        {hasGivenUp ? "fine" : "NO"}
      </motion.button>

      <p className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 text-xs text-neutral-400">
        (careful, NO is a little slippery 😏)
      </p>
    </div>
  );
}
