"use client";

import { motion } from "framer-motion";
import { pick } from "@/lib/prng";
import type { TwistContext } from "@/types/flow";
import { TwistFrame } from "./TwistFrame";

const FAKE_ADS = [
  {
    emoji: "🧦",
    product: "SockSub™",
    pitch: "One sock. Every month. Never a pair.",
    price: "$14.99/mo",
  },
  {
    emoji: "🪑",
    product: "ChairBnB",
    pitch: "Rent a single chair in a stranger's kitchen.",
    price: "from $3/night",
  },
  {
    emoji: "🥒",
    product: "Pickle Water",
    pitch: "The water the pickles were in. Bottled.",
    price: "$9 a jar",
  },
  {
    emoji: "📠",
    product: "FaxBook",
    pitch: "Social media, but it prints out at your house.",
    price: "free (paper not included)",
  },
];

/**
 * A five-second ad break, mid-invitation. The absurdity is the point: it
 * frames the whole thing as a broadcast rather than a form.
 */
export function AdBreak({ ctx, onDone }: { ctx: TwistContext; onDone: (skipped: boolean) => void }) {
  const ad = pick(ctx.seed, "ad-break", FAKE_ADS);

  return (
    <TwistFrame duration={6000} onDone={onDone} skipLabel="Skip ad">
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400">
          This invitation is brought to you by
        </p>

        <motion.div
          className="w-full max-w-xs rounded-3xl border-[3px] border-ink bg-white p-6 shadow-[8px_8px_0_0_#1a1a1f]"
          initial={{ scale: 0.85, rotate: -3, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
        >
          <motion.div
            className="text-6xl"
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.6 }}
          >
            {ad.emoji}
          </motion.div>
          <p className="mt-3 text-2xl font-black text-ink">{ad.product}</p>
          <p className="mt-1 text-sm text-neutral-600">{ad.pitch}</p>
          <p className="mt-4 inline-block -rotate-2 rounded-full border-2 border-ink bg-yellow-300 px-4 py-1 text-sm font-black text-ink">
            {ad.price}
          </p>
        </motion.div>

        <p className="text-[11px] text-neutral-400">We are not affiliated. Nobody is.</p>
      </div>
    </TwistFrame>
  );
}
