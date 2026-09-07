"use client";

import { motion } from "framer-motion";
import type { JollyKind } from "@/types/flow";

const COPY: Record<JollyKind, { title: string; body: string; cta: string }> = {
  blind: {
    title: "Blind date mode",
    body: "You pick. He doesn't get to know what — he only finds out on the day.",
    cta: "Oh, I'm in →",
  },
  veto: {
    title: "Veto power",
    body: "You get to strike one option off the board. He'll never know it was ever an option.",
    cta: "Use it →",
  },
};

/**
 * The rare outcome from the second slot's jolly roll. Seeded like
 * everything else, so refreshing can't farm it — this card either exists
 * for a given link or it never will.
 */
export function GoldenCard({ kind, onContinue }: { kind: JollyKind; onContinue: () => void }) {
  const copy = COPY[kind];

  return (
    <motion.div
      className="flex w-full flex-1 flex-col items-center justify-center gap-5 px-6 py-10 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.p
        className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-600"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Rare card
      </motion.p>

      <motion.div
        className="relative w-full max-w-xs overflow-hidden rounded-3xl border-[3px] border-amber-500 bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-200 p-7 shadow-[8px_8px_0_0_#b45309]"
        initial={{ scale: 0.7, rotate: -8, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
      >
        {/* sheen sweeping across the card */}
        <motion.div
          className="pointer-events-none absolute inset-y-0 w-1/3 bg-white/50 blur-md"
          initial={{ x: "-150%" }}
          animate={{ x: "400%" }}
          transition={{ duration: 1.4, delay: 0.4, ease: "easeInOut" }}
        />
        <div className="text-6xl">{kind === "blind" ? "🕶️" : "🚫"}</div>
        <p className="mt-3 text-2xl font-black text-amber-900">{copy.title}</p>
        <p className="mt-2 text-sm font-medium text-amber-900/80">{copy.body}</p>
      </motion.div>

      <motion.button
        type="button"
        onClick={onContinue}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        whileTap={{ scale: 0.95 }}
        className="w-full max-w-xs rounded-full border-[3px] border-ink bg-brand px-8 py-4 text-lg font-black text-ink shadow-[5px_5px_0_0_#1a1a1f]"
      >
        {copy.cta}
      </motion.button>
    </motion.div>
  );
}
