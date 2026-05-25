/**
 * Spin decay time constant in seconds.
 * ω(t) = ω₀ · exp(-t/τ).
 * τ ≈ 25 s gives ~21% spin loss over a 6-second driver flight — consistent with
 * Tavares et al. (1999) and Holmes & Hsu (1995) measurements. Treated as a tunable
 * constant for M1; can be made v-dependent later if calibration demands it.
 */
export const SPIN_DECAY_TAU_S = 35;

export function decaySpin(omega0: number, tSeconds: number, tau = SPIN_DECAY_TAU_S): number {
  if (omega0 === 0) return 0;
  return omega0 * Math.exp(-tSeconds / tau);
}
