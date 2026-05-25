import type { BallLaunchInput, ClubDeliveryInput, ClubPreset } from './types';

/**
 * D-plane / modern ball-flight laws (Trackman):
 *
 *   ballSpeed       = clubSpeed × smashFactor
 *   start direction = 0.85 × face + 0.15 × path        (face dominates ~85%)
 *   spin axis       = face − path                       (face-to-path; +ve = fade/slice)
 *   launch angle    ≈ tourAvg.launch + ΔdynLoft·0.85 + Δattack·0.20  (anchored at preset neutral)
 *   backspin        ≈ tourAvg.spin × (1 + spinLoftSensitivity·ΔspinLoft) × (ballSpeed/tourAvg.ballSpeed)
 *
 * Anchoring at each preset's neutral delivery keeps the model self-consistent: the preset's
 * documented Tour-average ball launch is reproduced exactly when the user hits "neutral"
 * inputs, and small deltas from neutral move launch/spin in physically sensible ways.
 */

/** Empirically: each degree of extra spin loft adds ~7% to backspin (driver/iron averaged). */
const SPIN_LOFT_SENSITIVITY = 0.07;

/** Slope of launch angle in dynamic loft (Trackman regression ≈ 0.85 for irons, ≈ 0.96 for driver — use 0.85 generically). */
const LAUNCH_DYN_LOFT_SLOPE = 0.85;

/** Slope of launch angle in attack angle (positive: hitting up raises the ball). */
const LAUNCH_ATTACK_SLOPE = 0.20;

export function clubToBall(d: ClubDeliveryInput, preset: ClubPreset): BallLaunchInput {
  const neutral = preset.neutralDelivery;
  const avg = preset.tourAvg;

  // 1. Ball speed from smash factor
  const ballSpeedMps = d.clubSpeedMps * preset.smashFactor;

  // 2. Start direction (azimuth) — face-dominated
  const azimuthDeg = 0.85 * d.faceAngleDeg + 0.15 * d.clubPathDeg;

  // 3. Spin axis tilt — face minus path
  const spinAxisDeg = d.faceAngleDeg - d.clubPathDeg;

  // 4. Launch angle anchored to preset's tour-average, adjusted by deltas
  const launchAngleDeg =
    avg.launchDeg
    + LAUNCH_DYN_LOFT_SLOPE * (d.dynamicLoftDeg - neutral.dynamicLoftDeg)
    + LAUNCH_ATTACK_SLOPE * (d.attackAngleDeg - neutral.attackAngleDeg);

  // 5. Backspin anchored to tour-avg, scaled by spin-loft delta and ball-speed ratio
  const spinLoft = d.dynamicLoftDeg - d.attackAngleDeg;
  const neutralSpinLoft = neutral.dynamicLoftDeg - neutral.attackAngleDeg;
  const spinLoftFactor = 1 + SPIN_LOFT_SENSITIVITY * (spinLoft - neutralSpinLoft);
  const speedFactor = ballSpeedMps / avg.ballSpeedMps;
  const backspinRpm = Math.max(0, avg.backspinRpm * spinLoftFactor * speedFactor);

  return {
    mode: 'launch',
    ballSpeedMps,
    launchAngleDeg,
    azimuthDeg,
    backspinRpm,
    spinAxisDeg,
  };
}
