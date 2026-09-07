/**
 * Seeded, label-scoped randomness for the recipient flow.
 *
 * Every decision on /d/[slug] — cold open variant, which twists are
 * drawn, the jolly roll, the tournament bracket, the counter-condition
 * options — derives from the link's stored `seed`. Reloading the page
 * therefore replays the exact same path, and a rare outcome can never be
 * farmed by refreshing.
 *
 * Each call site passes its own `label`, mixed into the seed to produce
 * an independent stream. That matters for maintenance: adding a new draw
 * later can't shift the results of the draws that already exist, so an
 * already-sent link keeps behaving the way it did when it was sent.
 */

/** xmur3-style string hash, salted with the link seed. */
function mixSeed(seed: number, label: string): number {
  let h = 2166136261 ^ (seed >>> 0);
  for (let i = 0; i < label.length; i++) {
    h ^= label.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 16;
  return h >>> 0;
}

/** mulberry32: small, fast, good enough distribution for cosmetic picks. */
function mulberry32(state: number): () => number {
  let a = state >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A stream of floats in [0, 1) for one (seed, label) pair. */
export function createRng(seed: number, label: string): () => number {
  return mulberry32(mixSeed(seed, label));
}

/**
 * A fresh seed for a new link. Creation time only — this is the one
 * place unseeded randomness belongs, since it's what makes each link's
 * path differ from every other link's.
 */
export function randomSeed(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  // Keep it inside Postgres `integer` range.
  return buf[0] % 2147483647;
}

export function pick<T>(seed: number, label: string, items: readonly T[]): T {
  const rng = createRng(seed, label);
  return items[Math.floor(rng() * items.length)];
}

export function chance(seed: number, label: string, probability: number): boolean {
  return createRng(seed, label)() < probability;
}

/** Fisher-Yates against a seeded stream. Does not mutate `items`. */
export function shuffle<T>(seed: number, label: string, items: readonly T[]): T[] {
  const rng = createRng(seed, label);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Weighted sampling without replacement: returns every item, ordered so
 * that heavier items tend to come first.
 *
 * Used instead of a single weighted pick so twist selection can produce a
 * whole priority list up front. A slot then walks that list and takes the
 * first twist that's actually applicable — which keeps the draw seeded
 * even when a twist turns out to be unavailable at runtime (SLOW_MO with
 * zero escapes, say), rather than rerolling into something rarer.
 */
export function weightedOrder<T extends { weight: number }>(
  seed: number,
  label: string,
  items: readonly T[]
): T[] {
  const rng = createRng(seed, label);
  const pool = [...items];
  const out: T[] = [];

  while (pool.length > 0) {
    const total = pool.reduce((sum, item) => sum + Math.max(item.weight, 0), 0);
    if (total <= 0) {
      out.push(...pool);
      break;
    }

    let roll = rng() * total;
    let index = pool.length - 1;
    for (let i = 0; i < pool.length; i++) {
      roll -= Math.max(pool[i].weight, 0);
      if (roll <= 0) {
        index = i;
        break;
      }
    }
    out.push(pool[index]);
    pool.splice(index, 1);
  }

  return out;
}
