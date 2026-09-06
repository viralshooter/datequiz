"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { CELEBRATION_MESSAGES } from "@/config/content";

const PARTICLES = ["🎉", "💌", "✨", "🥳", "💫", "❤️"];

export function CelebrationScreen() {
  const message = useMemo(
    () => CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)],
    []
  );

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 overflow-hidden px-6 text-center">
      {PARTICLES.map((particle, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute text-4xl"
          style={{ left: `${10 + i * 15}%`, top: "55%" }}
          initial={{ opacity: 0, y: 0, scale: 0.4 }}
          animate={{ opacity: [0, 1, 0], y: -220, scale: 1.1 }}
          transition={{ duration: 1.6, delay: i * 0.08, ease: "easeOut" }}
        >
          {particle}
        </motion.span>
      ))}

      <motion.div
        className="text-7xl"
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 12 }}
      >
        🎉
      </motion.div>

      <motion.h1
        className="text-3xl font-extrabold text-neutral-900"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.h1>
    </div>
  );
}
