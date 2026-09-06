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
      <motion.h1
        className="text-2xl font-extrabold text-neutral-900"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Cosa ti va di fare? 🎈
      </motion.h1>
      <p className="text-sm text-neutral-600">Puoi sceglierne anche più di una.</p>

      <div className="grid w-full max-w-sm grid-cols-2 gap-3">
        {ACTIVITIES.map((activity, i) => {
          const active = selected.includes(activity.id);
          return (
            <motion.button
              key={activity.id}
              type="button"
              onClick={() => toggle(activity.id)}
              initial={{ opacity: 0, scale: 0.6, y: 16 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: active ? [1, 1.16, 1.03] : 1,
              }}
              transition={{
                opacity: { delay: i * 0.06, type: "spring", stiffness: 260, damping: 20 },
                y: { delay: i * 0.06, type: "spring", stiffness: 260, damping: 20 },
                scale: { duration: active ? 0.35 : 0.2, ease: "easeOut" },
              }}
              whileHover={{ rotate: active ? 0 : [0, -2, 2, 0] }}
              whileTap={{ scale: 0.94 }}
              className={`relative flex flex-col items-center gap-1 rounded-2xl border-2 px-3 py-5 text-center shadow-sm ${
                active ? "border-brand-dark bg-brand/10 shadow-brand/20" : "border-neutral-200 bg-white"
              }`}
            >
              {active && (
                <motion.span
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-dark text-xs text-white"
                >
                  ✓
                </motion.span>
              )}
              <motion.span
                className="text-3xl"
                animate={active ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                {activity.emoji}
              </motion.span>
              <span className="text-sm font-bold text-neutral-800">{activity.label}</span>
              <span className="text-xs text-neutral-500">{activity.description}</span>
            </motion.button>
          );
        })}
      </div>

      <motion.button
        type="button"
        disabled={selected.length === 0}
        onClick={() => onConfirm(selected)}
        whileTap={{ scale: 0.95 }}
        animate={selected.length > 0 ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
        className="mt-2 w-full max-w-sm rounded-full bg-brand-dark px-8 py-4 text-lg font-bold text-white shadow-lg shadow-brand/30 disabled:opacity-40"
      >
        Continua →
      </motion.button>
    </motion.div>
  );
}
