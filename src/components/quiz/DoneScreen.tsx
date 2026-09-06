"use client";

import { motion } from "framer-motion";

export function DoneScreen() {
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
    </motion.div>
  );
}
