"use client";

import { motion } from "framer-motion";
import { ACTIVITIES } from "@/config/content";
import type { ActivityId } from "@/types/content";

interface ConfirmSummaryProps {
  activities: ActivityId[];
  days: string[];
  submitting: boolean;
  onConfirm: () => void;
}

export function ConfirmSummary({ activities, days, submitting, onConfirm }: ConfirmSummaryProps) {
  const activityLabels = ACTIVITIES.filter((a) => activities.includes(a.id));

  return (
    <motion.div
      className="flex min-h-full w-full flex-col items-center justify-center gap-6 px-6 pb-10 pt-12 text-center"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.h1
        className="text-2xl font-extrabold text-neutral-900"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        Everything look right? 👀
      </motion.h1>

      <motion.div
        className="w-full max-w-xs rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-left"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">In the mood for</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {activityLabels.map((a, i) => (
            <motion.span
              key={a.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.06, type: "spring", stiffness: 300 }}
              className="rounded-full bg-brand/15 px-3 py-1 text-sm font-semibold text-brand-dark"
            >
              {a.emoji} {a.label}
            </motion.span>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="w-full max-w-xs rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-left"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Your days</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {days.map((day, i) => (
            <motion.span
              key={day}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.06, type: "spring", stiffness: 300 }}
              className="rounded-full bg-brand/15 px-3 py-1 text-sm font-semibold text-brand-dark"
            >
              {day}
            </motion.span>
          ))}
        </div>
      </motion.div>

      <motion.button
        type="button"
        disabled={submitting}
        onClick={onConfirm}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileTap={{ scale: 0.95 }}
        className="w-full max-w-xs rounded-full bg-brand-dark px-8 py-4 text-lg font-bold text-white shadow-lg shadow-brand/30 disabled:opacity-60"
      >
        {submitting ? "One sec…" : "I'm in"}
      </motion.button>
    </motion.div>
  );
}
