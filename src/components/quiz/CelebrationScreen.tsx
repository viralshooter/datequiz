"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { CELEBRATION_MESSAGES } from "@/config/content";

const PARTICLE_EMOJIS = ["🎉", "💌", "✨", "🥳", "💫", "❤️", "🔥", "😍"];

export function CelebrationScreen() {
  const message = useMemo(
    () => CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)],
    []
  );

  const particles = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => ({
        emoji: PARTICLE_EMOJIS[i % PARTICLE_EMOJIS.length],
        left: 5 + Math.random() * 90,
        delay: Math.random() * 0.5,
        duration: 1.4 + Math.random() * 0.8,
        drift: (Math.random() - 0.5) * 80,
        rotate: (Math.random() - 0.5) * 120,
        size: 24 + Math.random() * 20,
      })),
    []
  );

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 overflow-hidden px-6 text-center">
      <motion.div
        className="absolute h-72 w-72 rounded-full bg-brand/25 blur-3xl"
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 2.2, opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute bottom-0"
          style={{ left: `${p.left}%`, fontSize: p.size }}
          initial={{ opacity: 0, y: 40, x: 0, rotate: 0, scale: 0.4 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: -320 - Math.random() * 80,
            x: p.drift,
            rotate: p.rotate,
            scale: 1,
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
        >
          {p.emoji}
        </motion.span>
      ))}

      <motion.div
        className="text-7xl"
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: [0, 1.3, 1], rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 12 }}
      >
        🎉
      </motion.div>

      <motion.h1
        className="text-3xl font-extrabold text-neutral-900"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0, scale: [1, 1.05, 1] }}
        transition={{ opacity: { delay: 0.2 }, y: { delay: 0.2 }, scale: { duration: 0.6, delay: 0.4 } }}
      >
        {message}
      </motion.h1>
    </div>
  );
}
