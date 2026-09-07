"use client";

import { motion } from "framer-motion";

const STICKERS = [
  { emoji: "💚", left: "6%", top: "18%", size: 40, drift: 18, duration: 11, rotate: -12 },
  { emoji: "😏", left: "88%", top: "12%", size: 44, drift: -22, duration: 13, rotate: 14 },
  { emoji: "🎯", left: "12%", top: "68%", size: 38, drift: 16, duration: 15, rotate: 10 },
  { emoji: "✨", left: "92%", top: "58%", size: 34, drift: -14, duration: 12, rotate: -8 },
  { emoji: "🍕", left: "80%", top: "82%", size: 36, drift: 20, duration: 14, rotate: 12 },
  { emoji: "💬", left: "4%", top: "44%", size: 34, drift: -16, duration: 16, rotate: -14 },
];

/** Emoji stickers drifting behind the landing page. Decorative only —
 * hidden on small screens, where they'd crowd the content. */
export function FloatingStickers() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden lg:block">
      {STICKERS.map((s, i) => (
        <motion.span
          key={i}
          className="absolute select-none opacity-40"
          style={{ left: s.left, top: s.top, fontSize: s.size, rotate: s.rotate }}
          animate={{ y: [0, s.drift, 0] }}
          transition={{ duration: s.duration, repeat: Infinity, ease: "easeInOut" }}
        >
          {s.emoji}
        </motion.span>
      ))}
    </div>
  );
}
