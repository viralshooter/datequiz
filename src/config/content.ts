import type { DateActivity } from "@/types/content";

/**
 * The 6 activities she picks from (multi-select) after saying yes.
 * Built to be edited freely: add, remove, or rename cards without
 * touching the logic anywhere else. The `id` values are stored in the
 * database (see ActivityId) — safe to change label/emoji/description,
 * but changing an `id` needs a matching DB migration.
 */
export const ACTIVITIES: DateActivity[] = [
  { id: "cena", label: "Dinner", emoji: "🍝", description: "Table, no rush, real talk" },
  { id: "drink", label: "Drinks", emoji: "🥂", description: "Cocktails, music, people" },
  { id: "sport", label: "Sport", emoji: "🏋️", description: "Energy, movement, a challenge" },
  { id: "esperienza", label: "Experience", emoji: "🎯", description: "Something you've never done" },
  { id: "cultura", label: "Culture", emoji: "🖼️", description: "Museums, shows, inspiration" },
  { id: "outdoor", label: "Outdoor", emoji: "🏞️", description: "Fresh air, sun, nature" },
];

export const ASK_OUT_QUESTION = "Will you go out with me?";

/** Messages shown (picked at random) in the celebration animation after YES. */
export const CELEBRATION_MESSAGES = [
  "Knew it! 🎉",
  "Great choice 😍",
  "Yes!!! 🙌",
  "Can't wait 💌",
  "Let's go 🔥",
];

/**
 * Tuning for the YES button, which grows every time NO escapes.
 * Scale starts at `base` and climbs by `step` per escape, up to `max`.
 */
export const YES_GROWTH = {
  base: 1,
  step: 0.12,
  max: 1.8,
};

/** Radius (px) within which the mouse makes NO run away. */
export const NO_PROXIMITY_RADIUS = 110;
