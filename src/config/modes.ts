import type { LinkMode } from "@/types/flow";

/**
 * The one piece of configuration he gets. Deliberately unexplained: not
 * knowing exactly what each mode does is part of the fun, and creator
 * friction is the top-of-funnel bottleneck — so this stays a single tap
 * and nothing more is ever added here.
 */
export const MODE_CARDS: { id: LinkMode; emoji: string; label: string; tint: string }[] = [
  { id: "soft", emoji: "🌤️", label: "Soft", tint: "bg-sky-100" },
  { id: "chaos", emoji: "🌪️", label: "Chaos", tint: "bg-pink-100" },
  { id: "roulette", emoji: "🎰", label: "Roulette", tint: "bg-yellow-100" },
];

export const DEFAULT_MODE: LinkMode = "chaos";
