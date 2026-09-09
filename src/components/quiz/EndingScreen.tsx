"use client";

import { motion } from "framer-motion";
import { ACTIVITIES } from "@/config/content";
import { trackEvent } from "@/lib/events";
import type { ActivityId } from "@/types/content";
import type { EndingType } from "@/types/flow";

interface EndingScreenProps {
  endingType: EndingType;
  matchName: string;
  senderName: string;
  champion: ActivityId;
  days: string[];
  condition: string;
  vetoed: ActivityId | null;
  /** False once he's bought the removal. */
  watermarkEnabled: boolean;
  slug: string;
}

const THEME: Record<EndingType, { card: string; shadow: string; accent: string; kicker: string }> = {
  classic: {
    card: "border-ink bg-white",
    shadow: "shadow-[10px_10px_0_0_#1a1a1f]",
    accent: "text-brand-dark",
    kicker: "It's a yes",
  },
  blind: {
    card: "border-ink bg-gradient-to-b from-indigo-50 to-white",
    shadow: "shadow-[10px_10px_0_0_#312e81]",
    accent: "text-indigo-700",
    kicker: "It's a yes — blind",
  },
  rare: {
    card: "border-amber-500 bg-gradient-to-b from-amber-100 to-yellow-50",
    shadow: "shadow-[10px_10px_0_0_#b45309]",
    accent: "text-amber-700",
    kicker: "It's a yes — rare card",
  },
};

/**
 * The final screen, and the thing she's most likely to screenshot and
 * send him. So the card is built for that: tall, high contrast, only a
 * handful of words, and everything legible when it's a thumbnail in a
 * chat. The brand mark stays small — the joke has to travel, not the ad.
 */
export function EndingScreen({
  endingType,
  matchName,
  senderName,
  champion,
  days,
  condition,
  vetoed,
  watermarkEnabled,
  slug,
}: EndingScreenProps) {
  const theme = THEME[endingType];
  const activity = ACTIVITIES.find((a) => a.id === champion)!;
  const vetoedActivity = vetoed ? ACTIVITIES.find((a) => a.id === vetoed) : null;
  const shownDays = days.slice(0, 3);

  return (
    <motion.div
      className="flex w-full flex-1 flex-col items-center justify-center gap-4 px-5 py-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div
        className={`w-full max-w-xs rounded-[2rem] border-[3px] p-6 text-center ${theme.card} ${theme.shadow}`}
        initial={{ scale: 0.9, rotate: -2, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
      >
        <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.accent}`}>
          {theme.kicker}
        </p>

        <div className="mt-3 text-6xl">
          {endingType === "blind" ? "🕶️" : endingType === "rare" ? "🌟" : "🎉"}
        </div>

        <p className="mt-3 text-3xl font-black leading-tight text-ink">
          {matchName} said yes
        </p>
        {senderName && (
          <p className="mt-1 text-sm font-bold text-neutral-500">to {senderName}</p>
        )}

        <div className="mt-5 space-y-3 text-left">
          <Row label="Doing">
            {endingType === "blind" ? (
              <span className="font-black text-indigo-700">🔒 sealed until the day</span>
            ) : (
              <span className="font-black text-ink">
                {activity.emoji} {activity.label}
              </span>
            )}
          </Row>

          <Row label="When">
            <span className="font-black text-ink">
              {shownDays.join(" · ")}
              {days.length > shownDays.length && ` +${days.length - shownDays.length}`}
            </span>
          </Row>

          <Row label="Her terms">
            <span className="font-black text-ink">{condition}</span>
          </Row>

          {vetoedActivity && (
            <Row label="Vetoed">
              <span className="font-black text-red-600 line-through">
                {vetoedActivity.emoji} {vetoedActivity.label}
              </span>
            </Row>
          )}
        </div>

        {/* The badge the "remove watermark" package actually removes.
            It sits inside the card because that card is the thing she
            screenshots, which is also what makes it the way anyone else
            ever hears about this. */}
        {watermarkEnabled && (
          <a
            href="https://yeslink.app/?utm_source=yeslink&utm_medium=badge&utm_campaign=ending"
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent("badge_clicked", slug)}
            className="mt-6 inline-block text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400"
          >
            made with yeslink.app
          </a>
        )}
      </motion.div>

      <motion.p
        className="text-center text-sm font-semibold text-neutral-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        📸 Screenshot this and send it to him.
        <br />
        <span className="text-xs text-neutral-400">He's been told too, don't worry.</span>
      </motion.p>
    </motion.div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-black/[0.04] px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{label}</p>
      <p className="mt-0.5 text-base leading-tight">{children}</p>
    </div>
  );
}
