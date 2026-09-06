"use client";

import { motion } from "framer-motion";

export function DoneScreen() {
  return (
    <motion.div
      className="flex h-full w-full flex-col items-center justify-center gap-6 px-6 text-center"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div
        className="flex h-24 w-24 items-center justify-center rounded-full bg-brand/15 text-6xl"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ type: "spring", stiffness: 260, damping: 14 }}
      >
        🎉
      </motion.div>
      <motion.h1
        className="text-2xl font-extrabold text-neutral-900"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Fatto!
      </motion.h1>
      <motion.p
        className="max-w-xs text-neutral-600"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Gli è arrivato tutto: cosa ti va di fare e quando sei libera. Ora deve solo
        organizzarsi 😏
      </motion.p>
    </motion.div>
  );
}
