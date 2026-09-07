"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ACTIVITIES } from "@/config/content";
import type { ActivityId } from "@/types/content";

/**
 * Follow-up to the veto golden card. She strikes one option; it's removed
 * from the ranking he receives.
 *
 * Never blocking: the champion is excluded from the board, so whatever
 * she vetoes he still ends up with a ranked list and her top pick intact.
 */
export function VetoPicker({
  ranking,
  onVeto,
}: {
  ranking: ActivityId[];
  onVeto: (id: ActivityId) => void;
}) {
  const [struck, setStruck] = useState<ActivityId | null>(null);
  // Her winner is off-limits — vetoing it would leave him with nothing.
  const candidates = ranking.slice(1);

  function choose(id: ActivityId) {
    if (struck) return;
    setStruck(id);
    window.setTimeout(() => onVeto(id), 900);
  }

  return (
    <motion.div
      className="flex w-full flex-1 flex-col items-center justify-center gap-4 px-5 py-10 text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-2xl font-extrabold text-neutral-900">Strike one off 🚫</h1>
      <p className="-mt-1 max-w-xs text-sm text-neutral-600">
        Pick the one he never gets to suggest.
      </p>

      <div className="mt-2 grid w-full max-w-xs grid-cols-1 gap-2">
        {candidates.map((id) => {
          const item = ACTIVITIES.find((a) => a.id === id)!;
          const isStruck = struck === id;
          return (
            <motion.button
              key={id}
              type="button"
              disabled={Boolean(struck)}
              onClick={() => choose(id)}
              whileTap={{ scale: 0.96 }}
              animate={{
                opacity: struck && !isStruck ? 0.3 : 1,
                x: isStruck ? [0, -6, 6, 0] : 0,
              }}
              transition={{ duration: 0.35 }}
              className={`flex items-center gap-3 rounded-2xl border-[3px] px-4 py-3 text-left ${
                isStruck
                  ? "border-red-500 bg-red-50 shadow-[4px_4px_0_0_#ef4444]"
                  : "border-ink bg-white shadow-[4px_4px_0_0_#1a1a1f]"
              }`}
            >
              <span className="text-2xl">{item.emoji}</span>
              <span
                className={`text-base font-black ${
                  isStruck ? "text-red-600 line-through" : "text-ink"
                }`}
              >
                {item.label}
              </span>
              {isStruck && <span className="ml-auto text-xl">🚫</span>}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
