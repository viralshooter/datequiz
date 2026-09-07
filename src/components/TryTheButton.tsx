"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const TAUNTS = [
  "Go on, click NO 😏",
  "Closer…",
  "It's right there!",
  "Getting warmer 🔥",
  "Are you even trying?",
  "This is what she'll be doing",
];

const EVADE_COOLDOWN_MS = 240;
const PROXIMITY = 90;

/** The product's whole trick, playable on the landing page: whoever
 * lands here experiences the joke instead of reading about it. */
export function TryTheButton() {
  const noRef = useRef<HTMLButtonElement>(null);
  const lastEvadeRef = useRef(0);

  const [pos, setPos] = useState({ xPct: 72, yPct: 62 });
  const [escapes, setEscapes] = useState(0);
  const [saidYes, setSaidYes] = useState(false);

  const evade = useCallback(() => {
    const now = Date.now();
    if (now - lastEvadeRef.current < EVADE_COOLDOWN_MS) return;
    lastEvadeRef.current = now;

    setPos({
      xPct: 14 + Math.random() * 72,
      yPct: 20 + Math.random() * 62,
    });
    setEscapes((e) => e + 1);
  }, []);

  useEffect(() => {
    if (saidYes) return;

    function handleMouseMove(e: MouseEvent) {
      const button = noRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const dist = Math.hypot(
        e.clientX - (rect.left + rect.width / 2),
        e.clientY - (rect.top + rect.height / 2)
      );
      if (dist < PROXIMITY) evade();
    }

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [evade, saidYes]);

  const yesScale = Math.min(1 + escapes * 0.09, 1.55);
  const taunt = TAUNTS[Math.min(escapes, TAUNTS.length - 1)];

  return (
    <div className="relative mx-auto h-72 w-full max-w-lg overflow-hidden rounded-3xl border-[3px] border-ink bg-white shadow-[8px_8px_0_0_#1a1a1f] sm:h-80">
      <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b-2 border-dashed border-neutral-200 px-4 py-2.5">
        <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
          Live demo
        </span>
        <span className="rounded-full bg-yellow-300 px-2.5 py-0.5 text-xs font-black text-ink">
          NOs dodged: {escapes}
        </span>
      </div>

      {saidYes ? (
        <motion.div
          className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="text-6xl"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: [0, 1.3, 1], rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 12 }}
          >
            🎉
          </motion.div>
          <p className="text-2xl font-black text-ink">See? Nobody says no.</p>
          <p className="max-w-xs text-sm text-neutral-500">
            {escapes > 0
              ? `You gave up after ${escapes} ${escapes === 1 ? "try" : "tries"}. She will too.`
              : "Smart. Straight to yes."}
          </p>
          <Link
            href="/create"
            className="mt-1 rounded-full border-[3px] border-ink bg-brand px-6 py-3 text-sm font-black text-ink shadow-[4px_4px_0_0_#1a1a1f] transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Now do it to her →
          </Link>
        </motion.div>
      ) : (
        <>
          <motion.p
            key={taunt}
            className="absolute inset-x-0 top-14 text-center text-lg font-black text-ink"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {taunt}
          </motion.p>

          <motion.button
            type="button"
            onClick={() => setSaidYes(true)}
            animate={{ scale: yesScale }}
            transition={{ type: "spring", stiffness: 300, damping: 16 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-ink bg-brand px-8 py-3.5 text-lg font-black text-ink shadow-[5px_5px_0_0_#1a1a1f]"
          >
            YES
          </motion.button>

          <motion.button
            ref={noRef}
            type="button"
            tabIndex={-1}
            onMouseEnter={evade}
            onTouchStart={evade}
            onClick={evade}
            animate={{
              left: `${pos.xPct}%`,
              top: `${pos.yPct}%`,
              rotate: escapes === 0 ? [0, -5, 5, -5, 0] : 0,
            }}
            transition={{
              left: { type: "spring", stiffness: 260, damping: 14 },
              top: { type: "spring", stiffness: 260, damping: 14 },
              rotate: { duration: 1.2, repeat: Infinity, repeatDelay: 0.8 },
            }}
            style={{ position: "absolute", translateX: "-50%", translateY: "-50%" }}
            className="select-none rounded-full border-[3px] border-neutral-300 bg-white px-7 py-3 text-lg font-black text-neutral-400 shadow-[4px_4px_0_0_#d4d4d4]"
          >
            NO
          </motion.button>
        </>
      )}
    </div>
  );
}
