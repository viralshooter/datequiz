"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

type Finish = (skipped: boolean) => void;

interface TwistFrameProps {
  /** Auto-advance after this long if she neither skips nor finishes. */
  duration: number;
  /** Called at most once, with whether she skipped out early. */
  onDone: Finish;
  /** Dark twists (FAKE_CRASH) need a light dismiss affordance. */
  invert?: boolean;
  skipLabel?: string;
  /**
   * Plain content, or a render function for interactive twists that can
   * complete before the timer (CAPTCHA).
   */
  children: ReactNode | ((finish: Finish) => ReactNode);
}

const SKIP_UNLOCKS_AT_MS = 2000;

/**
 * Shared shell for every twist.
 *
 * Enforces the two rules that stop a twist ever becoming a wall: it
 * auto-advances on its own, and there is always a visible way out that
 * arms after two seconds. The affordance renders from the first frame
 * (dimmed, counting down) rather than appearing from nowhere, so she can
 * see the exit coming.
 */
export function TwistFrame({
  duration,
  onDone,
  invert = false,
  skipLabel = "Skip",
  children,
}: TwistFrameProps) {
  const [canSkip, setCanSkip] = useState(false);
  const doneRef = useRef(false);

  // The timer, the skip button and an interactive twist's own completion
  // can all race; whichever lands first wins and the rest are ignored.
  const finish = useCallback<Finish>(
    (skipped) => {
      if (doneRef.current) return;
      doneRef.current = true;
      onDone(skipped);
    },
    [onDone]
  );

  useEffect(() => {
    const unlock = window.setTimeout(() => setCanSkip(true), SKIP_UNLOCKS_AT_MS);
    const auto = window.setTimeout(() => finish(false), duration);
    return () => {
      window.clearTimeout(unlock);
      window.clearTimeout(auto);
    };
  }, [duration, finish]);

  return (
    <div className="relative flex w-full flex-1 flex-col">
      {typeof children === "function" ? children(finish) : children}

      <button
        type="button"
        onClick={() => canSkip && finish(true)}
        aria-disabled={!canSkip}
        className={`absolute bottom-4 right-4 z-30 flex min-h-11 items-center gap-2 rounded-full border-2 px-4 py-2 text-xs font-black uppercase tracking-wide transition-opacity ${
          invert
            ? "border-white/40 bg-white/10 text-white"
            : "border-ink/20 bg-white/80 text-neutral-600 backdrop-blur"
        } ${canSkip ? "opacity-100" : "opacity-40"}`}
      >
        {skipLabel}
        {canSkip ? (
          <span aria-hidden>→</span>
        ) : (
          <motion.span
            aria-hidden
            className={`block h-3 w-3 rounded-full border-2 border-t-transparent ${
              invert ? "border-white/60" : "border-neutral-400"
            }`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, ease: "linear", repeat: Infinity }}
          />
        )}
      </button>
    </div>
  );
}
