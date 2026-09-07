"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { shuffle } from "@/lib/prng";
import type { TwistContext } from "@/types/flow";
import { TwistFrame } from "./TwistFrame";

const REASONS = [
  { emoji: "🍕", label: "free food" },
  { emoji: "😂", label: "he's funny (allegedly)" },
  { emoji: "🐕", label: "there might be a dog" },
  { emoji: "🚪", label: "leaving the house" },
  { emoji: "📖", label: "a story for later" },
  { emoji: "🎲", label: "pure curiosity" },
];

/**
 * The one interactive twist, kept in the deck for modality variety: every
 * other twist is something she watches, this one is something she does.
 *
 * Every tile is a correct answer, so any tap passes — it can't gate her,
 * and the punchline is that the test was never real.
 */
export function Captcha({ ctx, onDone }: { ctx: TwistContext; onDone: (skipped: boolean) => void }) {
  const tiles = shuffle(ctx.seed, "captcha", REASONS);
  const [verified, setVerified] = useState(false);

  return (
    <TwistFrame duration={9000} onDone={onDone}>
      {(finish) => (
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 px-5 py-10 text-center">
          <div className="w-full max-w-xs overflow-hidden rounded-2xl border-[3px] border-ink bg-white shadow-[8px_8px_0_0_#1a1a1f]">
            <div className="bg-sky-600 px-4 py-3 text-left text-white">
              <p className="text-xs font-semibold opacity-80">Select all images containing</p>
              <p className="text-lg font-black leading-tight">a reason to say yes</p>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-3">
              {tiles.map((tile, i) => (
                <motion.button
                  key={tile.label}
                  type="button"
                  disabled={verified}
                  onClick={() => {
                    setVerified(true);
                    window.setTimeout(() => finish(false), 1900);
                  }}
                  whileTap={{ scale: 0.94 }}
                  className="relative flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-neutral-200 bg-neutral-50 p-1"
                >
                  <span className="text-2xl">{tile.emoji}</span>
                  <span className="text-[8px] font-bold leading-tight text-neutral-600">
                    {tile.label}
                  </span>
                  {verified && (
                    <motion.span
                      className="absolute inset-0 flex items-center justify-center rounded-lg bg-brand/80 text-xl text-white"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.07 }}
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </div>

            <p className="border-t border-neutral-200 px-4 py-2 text-left text-[11px] font-semibold text-neutral-500">
              {verified ? "Verified — you are (probably) not a robot" : "Tap any that apply"}
            </p>
          </div>
        </div>
      )}
    </TwistFrame>
  );
}
