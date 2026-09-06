import type { DateActivity } from "@/types/content";

/**
 * Le 6 attività tra cui lei sceglie (selezione multipla) dopo aver
 * detto sì. File pensato per essere editato facilmente: aggiungi,
 * rimuovi o rinomina le card senza toccare la logica altrove.
 */
export const ACTIVITIES: DateActivity[] = [
  { id: "cena", label: "Cena", emoji: "🍝", description: "Tavolo, calma, chiacchiere" },
  { id: "drink", label: "Drink", emoji: "🥂", description: "Aperitivo, musica, gente" },
  { id: "sport", label: "Sport", emoji: "🏋️", description: "Energia, movimento, sfida" },
  { id: "esperienza", label: "Esperienza", emoji: "🎯", description: "Qualcosa mai fatto prima" },
  { id: "cultura", label: "Cultura", emoji: "🖼️", description: "Musei, mostre, ispirazione" },
  { id: "outdoor", label: "Outdoor", emoji: "🏞️", description: "Aria aperta, sole, natura" },
];

export const ASK_OUT_QUESTION = "Esci con me?";

/** Messaggi mostrati (a rotazione casuale) nell'animazione di celebrazione dopo il SÌ. */
export const CELEBRATION_MESSAGES = [
  "Lo sapevo! 🎉",
  "Ottima scelta 😍",
  "Yes!!! 🙌",
  "Non vedo l'ora 💌",
  "Top, dai 🔥",
];

/**
 * Tuning del bottone SÌ che cresce ad ogni fuga del NO.
 * scale parte da `base` e sale di `step` per ogni fuga, fino a `max`.
 */
export const YES_GROWTH = {
  base: 1,
  step: 0.12,
  max: 1.8,
};

/** Raggio (px) entro cui il mouse fa scattare la fuga del NO. */
export const NO_PROXIMITY_RADIUS = 110;
