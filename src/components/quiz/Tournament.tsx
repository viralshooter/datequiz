"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ACTIVITIES } from "@/config/content";
import { rankFromBracket, type Bracket } from "@/lib/flowPlan";
import type { ActivityId } from "@/types/content";
import type { TournamentResult } from "@/types/flow";

interface TournamentProps {
  bracket: Bracket;
  onComplete: (result: TournamentResult) => void;
}

const RESOLVE_MS = 700;
const ROUND_LABELS = ["Round 1", "Round 2", "The final"];

function activity(id: ActivityId) {
  return ACTIVITIES.find((a) => a.id === id)!;
}

/**
 * Act 2. Head-to-head elimination instead of a flat multi-select: two
 * activities at a time, three taps, and the output is a ranked order
 * rather than an unordered pile of checkboxes.
 *
 * Three taps is deliberate — it's the shortest bracket that still crowns
 * a winner, and it keeps the whole act inside its ~12s slice of the
 * 60-second budget.
 */
export function Tournament({ bracket, onComplete }: TournamentProps) {
  const [round, setRound] = useState(0);
  const [semiWinners, setSemiWinners] = useState<ActivityId[]>([]);
  const [picked, setPicked] = useState<ActivityId | null>(null);

  const matchup: [ActivityId, ActivityId] =
    round < 2
      ? bracket.semis[round]
      : [semiWinners[0], semiWinners[1]];

  function choose(winner: ActivityId) {
    if (picked) return;
    setPicked(winner);

    window.setTimeout(() => {
      if (round === 0) {
        setSemiWinners([winner]);
        setRound(1);
        setPicked(null);
        return;
      }
      if (round === 1) {
        setSemiWinners((prev) => [...prev, winner]);
        setRound(2);
        setPicked(null);
        return;
      }

      const winners: [ActivityId, ActivityId] = [semiWinners[0], semiWinners[1]];
      onComplete({
        champion: winner,
        ranking: rankFromBracket(bracket, winners, winner),
      });
    }, RESOLVE_MS);
  }

  return (
    <motion.div
      className="flex w-full flex-1 flex-col items-center justify-center gap-4 px-5 pb-10 pt-12 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2">
        {ROUND_LABELS.map((_, i) => (
          <span
            key={i}
            className={`h-2 rounded-full transition-all ${
              i === round ? "w-6 bg-brand-dark" : i < round ? "w-2 bg-brand-dark/40" : "w-2 bg-neutral-300"
            }`}
          />
        ))}
      </div>

      <h1 className="text-2xl font-extrabold text-neutral-900">
        {round === 2 ? "The final 🏆" : "Pick one 👀"}
      </h1>
      <p className="-mt-2 text-sm text-neutral-500">
        {ROUND_LABELS[round]} · only one survives
      </p>

      <div className="mt-1 flex w-full max-w-xs flex-col items-center gap-2">
        <AnimatePresence mode="popLayout">
          {matchup.map((id, index) => (
            <motion.div key={`${round}-${id}`} className="w-full" layout>
              {index === 1 && (
                <p className="py-1 text-xs font-black uppercase tracking-widest text-neutral-400">
                  vs
                </p>
              )}
              <ContenderCard
                id={id}
                state={!picked ? "idle" : picked === id ? "won" : "lost"}
                onPick={() => choose(id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ContenderCard({
  id,
  state,
  onPick,
}: {
  id: ActivityId;
  state: "idle" | "won" | "lost";
  onPick: () => void;
}) {
  const item = activity(id);

  return (
    <motion.button
      type="button"
      onClick={onPick}
      disabled={state !== "idle"}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{
        opacity: state === "lost" ? 0.25 : 1,
        scale: state === "won" ? 1.04 : state === "lost" ? 0.92 : 1,
        rotate: state === "lost" ? -2 : 0,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      whileTap={{ scale: 0.96 }}
      className={`flex w-full items-center gap-4 rounded-2xl border-[3px] px-4 py-4 text-left transition-colors ${
        state === "won"
          ? "border-brand-dark bg-brand/15 shadow-[5px_5px_0_0_#16a34a]"
          : "border-ink bg-white shadow-[5px_5px_0_0_#1a1a1f]"
      }`}
    >
      <span className="text-4xl">{item.emoji}</span>
      <span className="min-w-0">
        <span className="block text-lg font-black text-ink">{item.label}</span>
        <span className="block text-xs text-neutral-500">{item.description}</span>
      </span>
      {state === "won" && (
        <motion.span
          className="ml-auto text-2xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 14 }}
        >
          ✅
        </motion.span>
      )}
    </motion.button>
  );
}
