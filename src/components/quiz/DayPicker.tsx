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
      className="flex h-full w-full flex-col items-center justify-center gap-6 px-6 text-center"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-2xl font-extrabold text-neutral-900">Quando ti va? 📅</h1>
      <p className="max-w-xs text-neutral-600">
        Spunta i giorni in cui sei libera tra questi:
      </p>

      <div className="flex w-full max-w-xs flex-col gap-3">
        {availableDays.map((day) => {
          const active = selected.includes(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggle(day)}
              className={`rounded-2xl border-2 px-5 py-3 text-left text-lg font-semibold transition-colors ${
                active
                  ? "border-brand-dark bg-brand/10 text-brand-dark"
                  : "border-neutral-200 bg-white text-neutral-700"
              }`}
            >
              <span className="mr-2">{active ? "✅" : "⬜"}</span>
              {day}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={selected.length === 0}
        onClick={() => onContinue(selected)}
        className="mt-2 w-full max-w-xs rounded-full bg-brand-dark px-8 py-4 text-lg font-bold text-white shadow-lg shadow-brand/30 transition-transform active:scale-95 disabled:opacity-40"
      >
        Continua →
      </button>
    </motion.div>
  );
}
