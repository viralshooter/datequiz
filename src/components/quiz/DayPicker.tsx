"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface DayPickerProps {
  availableDays: string[];
  onContinue: (selectedDays: string[]) => void;
}

export function DayPicker({ availableDays, onContinue }: DayPickerProps) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(day: string) {
    setSelected((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  return (
    <motion.div
      className="flex min-h-full w-full flex-col items-center justify-center gap-6 px-6 pb-10 pt-12 text-center"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-2xl font-extrabold text-neutral-900">When works for you? 📅</h1>
      <p className="max-w-xs text-neutral-600">
        Check off the days you're free among these:
      </p>

      <div className="flex w-full max-w-xs flex-col gap-3">
        {availableDays.map((day, i) => {
          const active = selected.includes(day);
          return (
            <motion.button
              key={day}
              type="button"
              onClick={() => toggle(day)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 260, damping: 22 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-3 rounded-2xl border-2 px-5 py-3 text-left text-lg font-semibold ${
                active
                  ? "border-brand-dark bg-brand/10 text-brand-dark"
                  : "border-neutral-200 bg-white text-neutral-700"
              }`}
            >
              <motion.span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs text-white ${
                  active ? "border-brand-dark bg-brand-dark" : "border-neutral-300 bg-white"
                }`}
                animate={active ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {active && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    ✓
                  </motion.span>
                )}
              </motion.span>
              {day}
            </motion.button>
          );
        })}
      </div>

      <motion.button
        type="button"
        disabled={selected.length === 0}
        onClick={() => onContinue(selected)}
        whileTap={{ scale: 0.95 }}
        animate={selected.length > 0 ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
        className="mt-2 w-full max-w-xs rounded-full bg-brand-dark px-8 py-4 text-lg font-bold text-white shadow-lg shadow-brand/30 disabled:opacity-40"
      >
        Continue →
      </motion.button>
    </motion.div>
  );
}
