"use client";

import { motion } from "framer-motion";
import { ViralBadge } from "@/components/ViralBadge";

interface DoneScreenProps {
  slug: string;
  watermarkEnabled: boolean;
}

export function DoneScreen({ slug, watermarkEnabled }: DoneScreenProps) {
  return (
    <motion.div
      className="flex h-full w-full flex-col items-center justify-center gap-6 px-6 text-center"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-6xl">🎉</div>
      <h1 className="text-2xl font-extrabold text-neutral-900">Fatto!</h1>
      <p className="max-w-xs text-neutral-600">
        Gli è arrivato tutto: cosa ti va di fare e quando sei libera. Ora deve solo
        organizzarsi 😏
      </p>

      <div className="mt-6 flex flex-col items-center gap-3">
        <p className="text-sm font-medium text-neutral-500">
          Vuoi farlo al tuo prossimo match? 😏
        </p>
        <ViralBadge
          slug={slug}
          utmSource="respondent_cta"
          className="rounded-full bg-brand-dark px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/30"
        />
      </div>

      {watermarkEnabled && (
        <div className="mt-4">
          <ViralBadge slug={slug} utmSource="badge" />
        </div>
      )}
    </motion.div>
  );
}
