"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ASK_OUT_QUESTION, NO_PROXIMITY_RADIUS, YES_GROWTH } from "@/config/content";

interface EvasiveAskOutProps {
  matchName: string;
  onYes: () => void;
}

const EVADE_COOLDOWN_MS = 260;

export function EvasiveAskOut({ matchName, onYes }: EvasiveAskOutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const noRef = useRef<HTMLButtonElement>(null);
  const lastEvadeRef = useRef(0);

  const [noPos, setNoPos] = useState({ xPct: 62, yPct: 60 });
  const [escapes, setEscapes] = useState(0);
  const [puff, setPuff] = useState<{ xPct: number; yPct: number; id: number } | null>(null);
  const puffIdRef = useRef(0);

  const evade = useCallback(() => {
    const now = Date.now();
    if (now - lastEvadeRef.current < EVADE_COOLDOWN_MS) return;
    lastEvadeRef.current = now;

    const marginPct = 14;
    const xPct = marginPct + Math.random() * (100 - marginPct * 2);
    const yPct = 22 + Math.random() * (100 - 22 - 16);

    setNoPos((prev) => {
      puffIdRef.current += 1;
      setPuff({ xPct: prev.xPct, yPct: prev.yPct, id: puffIdRef.current });
      return { xPct, yPct };
    });
    setEscapes((e) => e + 1);
  }, []);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const button = noRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      if (dist < NO_PROXIMITY_RADIUS) evade();
    }

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [evade]);

  const yesScale = Math.min(YES_GROWTH.base + escapes * YES_GROWTH.step, YES_GROWTH.max);

  return (
    <div ref={containerRef} className="relative w-full flex-1 overflow-hidden px-6 pt-16 text-center">
      <motion.p
        className="mx-auto max-w-xs text-3xl font-extrabold leading-snug text-neutral-900"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {matchName}, {ASK_OUT_QUESTION.toLowerCase()}
      </motion.p>

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
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-dark px-8 py-4 text-lg font-bold text-white"
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
        className="rounded-full border-2 border-neutral-200 bg-white px-8 py-4 text-lg font-bold text-neutral-500 select-none"
      >
        NO
      </motion.button>

      <p className="absolute bottom-10 left-1/2 -translate-x-1/2 text-xs text-neutral-400">
        (careful, NO is a little slippery 😏)
      </p>
    </div>
  );
}
