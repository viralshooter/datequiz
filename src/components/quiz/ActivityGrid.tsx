"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ACTIVITIES } from "@/config/content";
import type { ActivityId } from "@/types/content";

interface ActivityGridProps {
  onConfirm: (activities: ActivityId[]) => void;
}

export function ActivityGrid({ onConfirm }: ActivityGridProps) {
  const [selected, setSelected] = useState<ActivityId[]>([]);

  function toggle(id: ActivityId) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  }

  return (
    <motion.div
      className="flex h-full w-full flex-col items-center justify-center gap-6 px-5 py-8 text-center"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-2xl font-extrabold text-neutral-900">Cosa ti va di fare? 🎈</h1>
      <p className="text-sm text-neutral-600">Puoi sceglierne anche più di una.</p>

      <div className="grid w-full max-w-sm grid-cols-2 gap-3">
        {ACTIVITIES.map((activity) => {
          const active = selected.includes(activity.id);
          return (
            <motion.button
              key={activity.id}
              type="button"
              onClick={() => toggle(activity.id)}
              whileTap={{ scale: 0.94 }}
              animate={{ scale: active ? 1.03 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className={`relative flex flex-col items-center gap-1 rounded-2xl border-2 px-3 py-5 text-center shadow-sm ${
                active
                  ? "border-rose-500 bg-rose-50"
                  : "border-neutral-200 bg-white"
              }`}
            >
              {active && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs text-white"
                >
                  ✓
                </motion.span>
              )}
              <span className="text-3xl">{activity.emoji}</span>
              <span className="text-sm font-bold text-neutral-800">{activity.label}</span>
              <span className="text-xs text-neutral-500">{activity.description}</span>
            </motion.button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={selected.length === 0}
        onClick={() => onConfirm(selected)}
        className="mt-2 w-full max-w-sm rounded-full bg-rose-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-rose-200 transition-transform active:scale-95 disabled:opacity-40"
      >
        Continua →
      </button>
    </motion.div>
  );
}
