"use client";

import { motion } from "framer-motion";

/**
 * Sfondo "atmosferico" per le superfici dark del brand (landing, login,
 * dashboard, create, risultato). Fixed dietro il contenuto: glow radiale
 * dall'alto, trama a puntini sottile, e un paio di orb sfocate che
 * derivano piano. Va abbinato a un wrapper di contenuto con `relative z-10`.
 */
export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-ink">
      <div
        className="absolute inset-x-0 top-0 h-[560px]"
        style={{
          background: "radial-gradient(60% 100% at 50% 0%, rgba(34,197,94,0.16), transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <motion.div
        className="absolute -left-24 top-10 h-96 w-96 rounded-full bg-brand/10 blur-[100px]"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-24 bottom-0 h-[420px] w-[420px] rounded-full bg-amber-500/10 blur-[110px]"
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/5 blur-[90px]"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
