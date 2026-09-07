"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ColdOpenVariant } from "@/types/flow";

interface ColdOpenProps {
  variant: ColdOpenVariant;
  matchName: string;
  onDone: () => void;
}

const DURATION_MS = 4000;

/**
 * The first four seconds. Its only job is to signal "this is a game, not
 * a form" before she's read a single word — so every variant is motion
 * first, text second, and none of them ask her to do anything.
 */
export function ColdOpen({ variant, matchName, onDone }: ColdOpenProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onDone, DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, [onDone]);

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      {variant === "envelope" && <Envelope />}
      {variant === "typing" && <Typing />}
      {variant === "countdown" && <Countdown />}
      {variant === "progress" && <ProgressBar />}
      {variant === "typewriter" && <Typewriter matchName={matchName} />}
    </div>
  );
}

function Envelope() {
  return (
    <>
      <motion.div
        className="text-8xl"
        initial={{ scale: 0.4, rotate: -12, y: 20 }}
        animate={{ scale: [0.4, 1.15, 1], rotate: [-12, 6, 0], y: 0 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      >
        💌
      </motion.div>
      <motion.p
        className="text-lg font-black text-neutral-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        opening…
      </motion.p>
    </>
  );
}

function Typing() {
  return (
    <>
      <div className="flex items-center gap-2 rounded-3xl rounded-bl-sm border-2 border-neutral-200 bg-white px-6 py-5 shadow-sm">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-3 w-3 rounded-full bg-neutral-400"
            animate={{ y: [0, -7, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </div>
      <motion.p
        className="text-sm font-bold text-neutral-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        someone is typing…
      </motion.p>
    </>
  );
}

function Countdown() {
  const [n, setN] = useState(3);

  useEffect(() => {
    const id = window.setInterval(() => setN((prev) => (prev > 1 ? prev - 1 : prev)), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <motion.div
      key={n}
      className="text-9xl font-black text-ink"
      initial={{ scale: 1.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {n}
    </motion.div>
  );
}

function ProgressBar() {
  return (
    <>
      <div className="h-4 w-64 max-w-full overflow-hidden rounded-full border-[3px] border-ink bg-white">
        <motion.div
          className="h-full bg-brand-dark"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />
      </div>
      <motion.p
        className="text-lg font-black text-ink"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        Loading… done. 🎉
      </motion.p>
      <motion.p
        className="-mt-3 text-sm text-neutral-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        that was quick
      </motion.p>
    </>
  );
}

function Typewriter({ matchName }: { matchName: string }) {
  const full = `Hey ${matchName}…`;
  const [shown, setShown] = useState("");

  useEffect(() => {
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(full.slice(0, i));
      if (i >= full.length) window.clearInterval(id);
    }, 90);
    return () => window.clearInterval(id);
  }, [full]);

  return (
    <p className="text-4xl font-black text-ink">
      {shown}
      <motion.span
        className="ml-0.5 inline-block h-9 w-[3px] translate-y-1 bg-ink"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.9, repeat: Infinity }}
      />
    </p>
  );
}
