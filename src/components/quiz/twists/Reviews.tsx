"use client";

import { motion } from "framer-motion";
import type { TwistContext } from "@/types/flow";
import { TwistFrame } from "./TwistFrame";

const REVIEWS = [
  {
    stars: 4,
    text: "Punctual, but talked about crypto for 40 minutes.",
    author: "his ex",
  },
  {
    stars: 3,
    text: "Good listener. Ordered for me though. Bold.",
    author: "verified diner",
  },
  {
    stars: 5,
    text: "He's fine. I'm his mum.",
    author: "Susan",
  },
];

function Stars({ n }: { n: number }) {
  return (
    <span className="text-sm tracking-tight text-amber-500" aria-label={`${n} out of 5`}>
      {"★".repeat(n)}
      <span className="text-neutral-300">{"★".repeat(5 - n)}</span>
    </span>
  );
}

/**
 * A review site profile for HIM. Every joke here points at him and none
 * of them at her — and none of it is social proof pushing her toward yes,
 * which is exactly why the ratings are mediocre.
 */
export function Reviews({ ctx, onDone }: { ctx: TwistContext; onDone: (skipped: boolean) => void }) {
  const name = ctx.senderName || "Your date";

  return (
    <TwistFrame duration={7000} onDone={onDone}>
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-3 px-5 py-10 text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400">
          Before you decide
        </p>

        <motion.div
          className="w-full max-w-xs rounded-3xl border-[3px] border-ink bg-white p-5 text-left shadow-[8px_8px_0_0_#1a1a1f]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-ink bg-brand text-2xl">
              🙋‍♂️
            </span>
            <span className="min-w-0">
              <span className="block truncate text-lg font-black text-ink">{name}</span>
              <span className="block text-xs text-neutral-500">
                <Stars n={4} /> 4.0 · 3 reviews
              </span>
            </span>
          </div>

          <p className="mt-2 text-[11px] font-semibold text-neutral-400">
            #2,847 of 3,001 people in your area
          </p>

          <div className="mt-4 flex flex-col gap-3">
            {REVIEWS.map((review, i) => (
              <motion.div
                key={review.text}
                className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.5, type: "spring", stiffness: 260, damping: 22 }}
              >
                <Stars n={review.stars} />
                <p className="mt-1 text-sm leading-snug text-neutral-700">{review.text}</p>
                <p className="mt-1 text-[11px] font-semibold text-neutral-400">— {review.author}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </TwistFrame>
  );
}
