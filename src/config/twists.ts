import type { LinkMode, TwistDefinition } from "@/types/flow";

/**
 * The twist deck.
 *
 * Hard rules, enforced by how twists are used rather than by type:
 * - Additive or cosmetic only, never blocking. Whatever path she takes,
 *   he still receives at least one activity and at least one day.
 * - The joke is always on HIM. No pressure tactics, no fake social proof
 *   nudging her toward yes.
 * - One twist per slot, both slots skippable after 2s.
 *
 * `weight` biases the seeded priority order; `modes` gates which of his
 * three chosen modes can draw the twist at all.
 */
export const TWISTS: TwistDefinition[] = [
  {
    // Reacts to what she just did, so it lands hardest — weighted highest.
    id: "SLOW_MO",
    weight: 5,
    modes: ["soft", "chaos", "roulette"],
    isAvailable: (ctx) => ctx.escapes >= 1,
  },
  {
    id: "REVIEWS",
    weight: 3,
    modes: ["soft", "chaos", "roulette"],
  },
  {
    // The only interactive twist — kept in every mode for modality variety.
    id: "CAPTCHA",
    weight: 3,
    modes: ["soft", "chaos", "roulette"],
  },
  {
    id: "AD_BREAK",
    weight: 2,
    modes: ["chaos", "roulette"],
  },
  {
    // Briefly alarming, so it stays out of soft mode.
    id: "FAKE_CRASH",
    weight: 2,
    modes: ["chaos", "roulette"],
  },
];

/**
 * Probability the second slot rolls the golden card instead of a twist.
 * Nudged up slightly from the nominal 5/8/10 because the measured rate
 * across the seed space lands a few tenths low — these are the values
 * that actually produce a 5–10% band in practice.
 */
export const JOLLY_CHANCE: Record<LinkMode, number> = {
  soft: 0.055,
  chaos: 0.085,
  roulette: 0.105,
};

/**
 * Act 3's role-reversal beat: three of these are offered, she imposes one
 * on him. All are light, none are a real demand.
 */
export const COUNTER_CONDITIONS: string[] = [
  "fine, but you're paying",
  "fine, but bring the dog",
  "fine, but one hour max",
  "fine, but no talking about work",
  "fine, but I pick the music",
  "fine, but you're driving",
  "fine, but phones stay in pockets",
  "fine, but dessert is non-negotiable",
];
