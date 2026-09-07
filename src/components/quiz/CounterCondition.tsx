"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/**
 * Act 3's closing beat, and the point of the whole restructure: she stops
 * answering and starts negotiating. She's said yes — now he has terms.
 */
export function CounterCondition({
  options,
  onChoose,
}: {
  options: string[];
  onChoose: (condition: string) => void;
}) {
  const [chosen, setChosen] = useState<string | null>(null);

  function choose(option: string) {
    if (chosen) return;
    setChosen(option);
    window.setTimeout(() => onChoose(option), 850);
  }

  return (
    <motion.div
      className="flex w-full flex-1 flex-col items-center justify-center gap-4 px-5 py-10 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className="text-5xl">🤝</span>
      <h1 className="text-2xl font-extrabold text-neutral-900">Your terms</h1>
      <p className="-mt-1 max-w-xs text-sm text-neutral-600">
        You said yes. Now he agrees to one thing.
      </p>

      <div className="mt-2 flex w-full max-w-xs flex-col gap-3">
        {options.map((option, i) => {
          const isChosen = chosen === option;
          return (
            <motion.button
              key={option}
              type="button"
              disabled={Boolean(chosen)}
              onClick={() => choose(option)}
              initial={{ opacity: 0, y: 14 }}
              animate={{
                opacity: chosen && !isChosen ? 0.3 : 1,
                y: 0,
                scale: isChosen ? 1.03 : 1,
              }}
              transition={{ delay: chosen ? 0 : i * 0.08, type: "spring", stiffness: 280, damping: 22 }}
              whileTap={{ scale: 0.96 }}
              className={`rounded-2xl border-[3px] px-5 py-4 text-left text-base font-black ${
                isChosen
                  ? "border-brand-dark bg-brand/15 text-brand-dark shadow-[5px_5px_0_0_#16a34a]"
                  : "border-ink bg-white text-ink shadow-[5px_5px_0_0_#1a1a1f]"
              }`}
            >
              {option}
              {isChosen && <span className="ml-2">✅</span>}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
