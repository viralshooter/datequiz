"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { TwistContext } from "@/types/flow";
import { TwistFrame } from "./TwistFrame";

/**
 * A two-second fake crash, then an immediate apology.
 *
 * Kept deliberately short and self-cancelling: the recovery text lands
 * before she has time to think she actually broke something, and the
 * joke resolves onto him being over-eager. Chaos and roulette only.
 */
export function FakeCrash({ onDone }: { ctx: TwistContext; onDone: (skipped: boolean) => void }) {
  const [phase, setPhase] = useState<"glitch" | "crash" | "sorry">("glitch");

  useEffect(() => {
    const toCrash = window.setTimeout(() => setPhase("crash"), 450);
    const toSorry = window.setTimeout(() => setPhase("sorry"), 2450);
    return () => {
      window.clearTimeout(toCrash);
      window.clearTimeout(toSorry);
    };
  }, []);

  return (
    <TwistFrame duration={5200} onDone={onDone} invert={phase !== "sorry"}>
      <motion.div
        className={`flex w-full flex-1 flex-col items-center justify-center gap-4 px-8 text-center ${
          phase === "sorry" ? "" : "bg-[#2b4b8f]"
        }`}
        animate={
          phase === "glitch"
            ? { x: [0, -6, 5, -3, 0], filter: ["none", "hue-rotate(90deg)", "none"] }
            : { x: 0 }
        }
        transition={{ duration: 0.45 }}
      >
        {phase !== "sorry" ? (
          <div className="w-full text-left font-mono text-white">
            <p className="text-5xl">:(</p>
            <p className="mt-4 text-sm leading-relaxed">
              Your invitation ran into a problem and needs to restart.
            </p>
            <p className="mt-4 text-xs text-white/70">
              Collecting error info… {phase === "crash" ? "94" : "12"}%
            </p>
            <p className="mt-6 text-[10px] text-white/50">
              STOP CODE: TOO_EXCITED_TO_FUNCTION
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          >
            <div className="text-6xl">😅</div>
            <p className="mt-4 text-2xl font-black text-ink">sorry, got excited</p>
            <p className="mt-2 text-sm text-neutral-600">Nothing broke. Carry on.</p>
          </motion.div>
        )}
      </motion.div>
    </TwistFrame>
  );
}
