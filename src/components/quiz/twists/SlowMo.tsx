"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { TwistContext } from "@/types/flow";
import { TwistFrame } from "./TwistFrame";

const STEP_MS = 850;

/**
 * Instant replay of her own failed NO taps, in slow motion, with
 * commentary. The highest-weighted twist in the deck because it's the one
 * that reacts to what she personally just did — it can't feel canned.
 */
export function SlowMo({ ctx, onDone }: { ctx: TwistContext; onDone: (skipped: boolean) => void }) {
  // The NO starts centre-right, which is where EvasiveAskOut parks it.
  const points = [{ xPct: 62, yPct: 60 }, ...ctx.escapeTrail];
  const replayMs = Math.min(points.length * STEP_MS, 5200);
  const duration = replayMs + 1600;

  const commentary = [
    "Let's go to the replay 🎙️",
    "She lines it up…",
    "Oh, and it's GONE.",
    `${ctx.escapes} ${ctx.escapes === 1 ? "attempt" : "attempts"}. Zero contact.`,
  ];

  const [line, setLine] = useState(0);

  useEffect(() => {
    const timers = commentary.map((_, i) =>
      window.setTimeout(() => setLine(i), i * (duration / commentary.length))
    );
    return () => timers.forEach(window.clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  return (
    <TwistFrame duration={duration} onDone={onDone}>
      <div className="flex w-full flex-1 flex-col items-center gap-3 px-5 py-10 text-center">
        <div className="flex items-center gap-2">
          <motion.span
            className="h-2.5 w-2.5 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.1, repeat: Infinity }}
          />
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500">
            Slow-motion replay
          </p>
        </div>

        <div className="relative w-full max-w-xs flex-1 overflow-hidden rounded-3xl border-[3px] border-ink bg-gradient-to-b from-neutral-900 to-neutral-800 shadow-[8px_8px_0_0_#1a1a1f]">
          {/* ghosts of every position the NO fled to */}
          {ctx.escapeTrail.map((point, i) => (
            <span
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 px-3 py-1 text-[10px] font-black text-white/25"
              style={{ left: `${point.xPct}%`, top: `${point.yPct}%` }}
            >
              NO
            </span>
          ))}

          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-dark px-5 py-2 text-sm font-black text-white">
            YES
          </span>

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

          <div className="absolute inset-x-0 bottom-0 bg-black/50 px-3 py-2">
            <motion.p key={line} className="text-xs font-bold text-white" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              {commentary[line]}
            </motion.p>
          </div>
        </div>
      </div>
    </TwistFrame>
  );
}
