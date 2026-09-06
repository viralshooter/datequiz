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
      className="flex h-full w-full flex-col items-center justify-center gap-6 px-6 text-center"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-2xl font-extrabold text-neutral-900">Tutto ok? 👀</h1>

      <div className="w-full max-w-xs rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Voglia di</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {activityLabels.map((a) => (
            <span
              key={a.id}
              className="rounded-full bg-brand/15 px-3 py-1 text-sm font-semibold text-brand-dark"
            >
              {a.emoji} {a.label}
            </span>
          ))}
        </div>
      </div>

      <div className="w-full max-w-xs rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">I tuoi giorni</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {days.map((day) => (
            <span
              key={day}
              className="rounded-full bg-brand/15 px-3 py-1 text-sm font-semibold text-brand-dark"
            >
              {day}
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={submitting}
        onClick={onConfirm}
        className="w-full max-w-xs rounded-full bg-brand-dark px-8 py-4 text-lg font-bold text-white shadow-lg shadow-brand/30 transition-transform active:scale-95 disabled:opacity-60"
      >
        {submitting ? "Un attimo…" : "Ok, ci sto"}
      </button>
    </motion.div>
  );
}
