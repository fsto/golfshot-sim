import { BALL_RADIUS_M } from './constants';

const BALL_DIAMETER_M = 2 * BALL_RADIUS_M;

/** Kinematic viscosity of air at ISA sea level, m²/s. Weak T-dependence; constant for now. */
export const NU_AIR = 1.46e-5;

/** Re = v · D / ν, with D the ball diameter. */
export function reynoldsNumber(speedMps: number, kinematicViscosity = NU_AIR): number {
  return (speedMps * BALL_DIAMETER_M) / kinematicViscosity;
}

/** Spin ratio S = ωR / |v|. ω is the magnitude of the spin angular velocity (rad/s). */
export function spinRatio(omegaMagRads: number, speedMps: number): number {
  if (speedMps === 0) return 0;
  return (omegaMagRads * BALL_RADIUS_M) / speedMps;
}

/**
 * Lift- and drag-coefficient tables vs spin ratio S = ωR/|v|, for a dimpled golf ball at
 * supercritical Reynolds (Re ≈ 7e4–2e5, covering every realistic golf shot).
 *
 * Stitched from:
 *   - Bearman & Harvey (1976), Aeronautical Quarterly 27, Re 1.26e5–2.38e5, for S ≤ 0.25
 *   - Smits & Smith (1994), Re ~1e5–2e5
 *   - Aoki et al. (2010), Procedia Engineering, Re ~1.5e5, for S up to 0.5 (including the
 *     non-monotonic CL decline at S > ~0.4 that the prior closed-form missed)
 *
 * Peak L/D ≈ 0.80 at S ≈ 0.30, matching Bearman's reported ~0.78 at S=0.25. The earlier
 * closed-form `0.30(1-exp(-10S))` / `0.24 + 0.30·S²` produced peak L/D ≈ 1.07 at S≈0.30 —
 * unphysical for a dimpled ball and the root cause of the mid-iron over-carry.
 */
const AERO_TABLE: ReadonlyArray<readonly [S: number, CL: number, CD: number]> = [
  [0.00, 0.000, 0.240],
  [0.05, 0.100, 0.245],
  [0.10, 0.180, 0.258],
  [0.15, 0.215, 0.275],
  [0.20, 0.240, 0.293],
  [0.25, 0.260, 0.310],
  [0.30, 0.270, 0.323],
  [0.40, 0.290, 0.355],
  [0.50, 0.290, 0.385],
  [0.60, 0.285, 0.415],   // CL plateau region (Aoki)
  [0.80, 0.265, 0.460],   // gentle CL decline above saturation
  [1.00, 0.245, 0.500],
];

function lerpAero(S: number, col: 1 | 2): number {
  if (S <= AERO_TABLE[0]![0]) return AERO_TABLE[0]![col];
  const last = AERO_TABLE[AERO_TABLE.length - 1]!;
  if (S >= last[0]) return last[col];
  // Linear search is fine: table is short and called inside a hot loop only at small constant cost.
  for (let i = 1; i < AERO_TABLE.length; i++) {
    const hi = AERO_TABLE[i]!;
    if (S <= hi[0]) {
      const lo = AERO_TABLE[i - 1]!;
      const t = (S - lo[0]) / (hi[0] - lo[0]);
      return lo[col] + t * (hi[col] - lo[col]);
    }
  }
  return last[col];
}

/** Lift coefficient as a function of spin ratio S. Table interpolation. */
export function cl(S: number): number {
  if (S <= 0) return 0;
  return lerpAero(S, 1);
}

/** Drag coefficient as a function of spin ratio S. Table interpolation. */
export function cd(S: number): number {
  return lerpAero(Math.max(0, S), 2);
}
