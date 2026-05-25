/**
 * mulberry32 — a 32-bit deterministic PRNG. Tiny, fast, good distribution for our purposes.
 * Returns a function that yields a fresh uniform in [0, 1) on each call.
 */
export function makeRng(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * One standard-normal sample via the Box-Muller transform.
 * We discard the paired sample for simplicity; pair caching would halve trig calls if needed.
 */
export function gaussian(rng: () => number): number {
  const u1 = Math.max(Number.MIN_VALUE, rng()); // avoid log(0)
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
