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
 * Lift coefficient as a function of spin ratio S.
 * Saturating-exponential fit calibrated to Smits & Smith (1994) and Bearman & Harvey (1976)
 * wind tunnel data for dimpled balls:
 *   CL ≈ 0.30 · (1 − exp(−12·S))
 * Rises quickly: ~0.19 at S=0.08 (driver), ~0.29 at S=0.30 (7-iron), saturates near 0.30.
 */
export function cl(S: number): number {
  if (S <= 0) return 0;
  return 0.30 * (1 - Math.exp(-10 * S));
}

/**
 * Drag coefficient for a dimpled golf ball at supercritical Reynolds (all golf shots).
 *   CD ≈ 0.21 + 0.5 · S²
 * Baseline 0.21 reflects published no-spin Cd at Re > 80k. Quadratic spin-induced drag
 * grows more sharply at high S (wedges) than linear forms.
 */
export function cd(S: number): number {
  const s = Math.max(0, S);
  return 0.24 + 0.30 * s * s;
}
