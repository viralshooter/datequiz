import { ACTIVITIES } from "@/config/content";
import { COUNTER_CONDITIONS, JOLLY_CHANCE, TWISTS } from "@/config/twists";
import { chance, pick, shuffle, weightedOrder } from "@/lib/prng";
import type { ActivityId } from "@/types/content";
import type {
  ColdOpenVariant,
  JollyKind,
  LinkMode,
  TwistContext,
  TwistDefinition,
  TwistId,
} from "@/types/flow";

const COLD_OPEN_VARIANTS: ColdOpenVariant[] = [
  "envelope",
  "typing",
  "countdown",
  "progress",
  "typewriter",
];

export interface Bracket {
  /** Two head-to-head matchups; the winners meet in the final. */
  semis: [[ActivityId, ActivityId], [ActivityId, ActivityId]];
  /** The two activities that didn't make the bracket for this link. */
  bench: [ActivityId, ActivityId];
}

export interface FlowPlan {
  coldOpen: ColdOpenVariant;
  /** Twists in seeded priority order; slots walk this list. */
  twistOrder: TwistDefinition[];
  jollyHit: boolean;
  jollyKind: JollyKind;
  bracket: Bracket;
  counterOptions: string[];
}

/**
 * Derives the whole path from the link's seed. Pure and side-effect free,
 * so the same seed always produces the same plan — on the server, on the
 * client, and on every reload.
 */
export function buildFlowPlan(seed: number, mode: LinkMode): FlowPlan {
  const eligible = TWISTS.filter((twist) => twist.modes.includes(mode));
  const shuffledActivities = shuffle(
    seed,
    "bracket",
    ACTIVITIES.map((a) => a.id)
  );

  return {
    coldOpen: pick(seed, "cold-open", COLD_OPEN_VARIANTS),
    twistOrder: weightedOrder(seed, "twist-order", eligible),
    jollyHit: chance(seed, "jolly", JOLLY_CHANCE[mode]),
    jollyKind: pick(seed, "jolly-kind", ["blind", "veto"] as JollyKind[]),
    bracket: {
      semis: [
        [shuffledActivities[0], shuffledActivities[1]],
        [shuffledActivities[2], shuffledActivities[3]],
      ],
      bench: [shuffledActivities[4], shuffledActivities[5]],
    },
    counterOptions: shuffle(seed, "counter-conditions", COUNTER_CONDITIONS).slice(0, 3),
  };
}

/**
 * Takes the first twist in the seeded order that's applicable right now
 * and hasn't already been used. Returns null when nothing applies, which
 * is fine: a slot with no twist simply passes through.
 */
export function selectTwist(
  plan: FlowPlan,
  ctx: TwistContext,
  used: TwistId[]
): TwistId | null {
  const found = plan.twistOrder.find(
    (twist) => !used.includes(twist.id) && (twist.isAvailable?.(ctx) ?? true)
  );
  return found?.id ?? null;
}

/**
 * Turns the three tournament taps into a full preference order.
 *
 * The activity that lost to the eventual champion ranks above the one
 * that lost to the runner-up, and the two that never made the bracket
 * come last — so he always sees all six, ordered by what she actually did.
 */
export function rankFromBracket(
  bracket: Bracket,
  semiWinners: [ActivityId, ActivityId],
  champion: ActivityId
): ActivityId[] {
  const [semi1, semi2] = bracket.semis;
  const [w1, w2] = semiWinners;

  const loser1 = semi1[0] === w1 ? semi1[1] : semi1[0];
  const loser2 = semi2[0] === w2 ? semi2[1] : semi2[0];

  const championCameFromSemi1 = champion === w1;
  const runnerUp = championCameFromSemi1 ? w2 : w1;
  const championsVictim = championCameFromSemi1 ? loser1 : loser2;
  const otherVictim = championCameFromSemi1 ? loser2 : loser1;

  return [champion, runnerUp, championsVictim, otherVictim, ...bracket.bench];
}
