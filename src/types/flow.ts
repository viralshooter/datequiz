import type { ActivityId } from "./content";

/** Chosen by him at creation time; weights which twists can be drawn. */
export type LinkMode = "soft" | "chaos" | "roulette";

export const LINK_MODES: LinkMode[] = ["soft", "chaos", "roulette"];

export function isLinkMode(value: unknown): value is LinkMode {
  return typeof value === "string" && (LINK_MODES as string[]).includes(value);
}

/** Which final screen she reached. Drives what he's allowed to see. */
export type EndingType = "classic" | "blind" | "rare";

/** The rare golden card, if the jolly roll hit. */
export type JollyKind = "blind" | "veto";

export type ColdOpenVariant =
  | "envelope"
  | "typing"
  | "countdown"
  | "progress"
  | "typewriter";

export type TwistId = "AD_BREAK" | "REVIEWS" | "FAKE_CRASH" | "CAPTCHA";

/** Where a NO escaped to, in % of the ask-out area. Replayed by InstantReplay. */
export interface EscapePoint {
  xPct: number;
  yPct: number;
}

/**
 * Everything a twist is allowed to know. Twists are additive or cosmetic
 * only — none of them can change what he ends up receiving.
 */
export interface TwistContext {
  seed: number;
  matchName: string;
  senderName: string;
  escapes: number;
  escapeTrail: EscapePoint[];
}

export interface TwistDefinition {
  id: TwistId;
  weight: number;
  modes: LinkMode[];
  /**
   * Runtime gate. A twist that isn't applicable is skipped over in the
   * seeded priority order rather than causing a reroll.
   */
  isAvailable?: (ctx: TwistContext) => boolean;
}

/** Result of the Act 2 tournament. */
export interface TournamentResult {
  /** Full preference order, best first. */
  ranking: ActivityId[];
  champion: ActivityId;
}
