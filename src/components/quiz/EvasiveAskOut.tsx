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

  const evade = useCallback(() => {
    const now = Date.now();
    if (now - lastEvadeRef.current < EVADE_COOLDOWN_MS) return;
    lastEvadeRef.current = now;

    const marginPct = 14;
    const xPct = marginPct + Math.random() * (100 - marginPct * 2);
    const yPct = 22 + Math.random() * (100 - 22 - 16);

    setNoPos({ xPct, yPct });
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
    <div ref={containerRef} className="relative h-full w-full overflow-hidden px-6 pt-16 text-center">
      <motion.p
        className="mx-auto max-w-xs text-3xl font-extrabold leading-snug text-neutral-900"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {matchName}, {ASK_OUT_QUESTION.toLowerCase()}
      </motion.p>

      <motion.button
        type="button"
        onClick={onYes}
        animate={{ scale: yesScale }}
        transition={{ type: "spring", stiffness: 300, damping: 16 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-dark px-8 py-4 text-lg font-bold text-white shadow-xl shadow-brand/30"
      >
        SÌ
      </motion.button>

      <motion.button
        ref={noRef}
        type="button"
        tabIndex={-1}
        onMouseEnter={evade}
        onTouchStart={evade}
        onClick={evade}
        animate={{ left: `${noPos.xPct}%`, top: `${noPos.yPct}%` }}
        transition={{ type: "spring", stiffness: 260, damping: 14 }}
        style={{ position: "absolute", translateX: "-50%", translateY: "-50%" }}
        className="rounded-full border-2 border-neutral-200 bg-white px-8 py-4 text-lg font-bold text-neutral-500 select-none"
      >
        NO
      </motion.button>

      <p className="absolute bottom-10 left-1/2 -translate-x-1/2 text-xs text-neutral-400">
        (occhio, il NO è un po&apos; scivoloso 😏)
      </p>
    </div>
  );
}
