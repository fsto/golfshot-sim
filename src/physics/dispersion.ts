import { simulateShot } from './shot';
import type { ShotInput, EnvConditions } from './types';
import { makeRng, gaussian } from '../lib/math/rng';
import { CLUB_PRESETS } from '../presets/pgaPresets';

/**
 * Standard-deviation perturbations applied to launch- or delivery-mode inputs.
 * Each key is optional — unspecified fields are not perturbed.
 * Units match the corresponding ShotInput field (m/s, degrees, rpm).
 */
export interface DispersionSigmas {
  // Ball-launch fields
  ballSpeedMps?: number;
  launchAngleDeg?: number;
  azimuthDeg?: number;
  backspinRpm?: number;
  spinAxisDeg?: number;
  // Club-delivery fields
  clubSpeedMps?: number;
  attackAngleDeg?: number;
  clubPathDeg?: number;
  faceAngleDeg?: number;
  dynamicLoftDeg?: number;
  smashFactor?: number;
}

export interface DispersionResult {
  /** First-bounce landing point per shot, in physics-frame (x = downrange, z = lateral). */
  landings: Array<{ x: number; z: number }>;
  /** Final rest point per shot (after bounce + roll). */
  rests: Array<{ x: number; z: number }>;
  /** Carry distance per shot, m. */
  carries: number[];
  /** Total distance per shot (carry + roll), m. */
  totals: number[];
}

function perturb(input: ShotInput, sigmas: DispersionSigmas, rng: () => number): ShotInput {
  if (input.mode === 'launch') {
    return {
      ...input,
      ballSpeedMps: input.ballSpeedMps + g(rng, sigmas.ballSpeedMps),
      launchAngleDeg: input.launchAngleDeg + g(rng, sigmas.launchAngleDeg),
      azimuthDeg: input.azimuthDeg + g(rng, sigmas.azimuthDeg),
      backspinRpm: Math.max(0, input.backspinRpm + g(rng, sigmas.backspinRpm)),
      spinAxisDeg: input.spinAxisDeg + g(rng, sigmas.spinAxisDeg),
    };
  }
  const cap = CLUB_PRESETS[input.clubId].smashFactor;
  const baseSmash = input.smashFactor ?? cap;
  // Perturb but NEVER exceed the preset's "perfect" smash — a real strike can only be
  // less efficient than the ideal centered hit.
  const smash = Math.min(cap, Math.max(0, baseSmash + g(rng, sigmas.smashFactor)));
  return {
    ...input,
    clubSpeedMps: Math.max(0, input.clubSpeedMps + g(rng, sigmas.clubSpeedMps)),
    attackAngleDeg: input.attackAngleDeg + g(rng, sigmas.attackAngleDeg),
    clubPathDeg: input.clubPathDeg + g(rng, sigmas.clubPathDeg),
    faceAngleDeg: input.faceAngleDeg + g(rng, sigmas.faceAngleDeg),
    dynamicLoftDeg: input.dynamicLoftDeg + g(rng, sigmas.dynamicLoftDeg),
    smashFactor: smash,
  };
}

function g(rng: () => number, sigma: number | undefined): number {
  if (!sigma || sigma === 0) return 0;
  return gaussian(rng) * sigma;
}

/**
 * Monte-Carlo: run `n` simulated shots, each perturbing the input by Gaussian noise with the
 * supplied per-field σ. Pure — runs synchronously on whatever thread it's called on; safe to
 * import into a Web Worker.
 */
export function simulateDispersion(
  baseInput: ShotInput,
  env: EnvConditions,
  sigmas: DispersionSigmas,
  n: number,
  seed = 1,
): DispersionResult {
  const rng = makeRng(seed);
  const landings: DispersionResult['landings'] = [];
  const rests: DispersionResult['rests'] = [];
  const carries: number[] = [];
  const totals: number[] = [];

  for (let i = 0; i < n; i++) {
    const perturbed = perturb(baseInput, sigmas, rng);
    const result = simulateShot(perturbed, env);
    const landing = result.flight.landingState.pos;
    const rest = result.rollPath[result.rollPath.length - 1] ?? landing;
    landings.push({ x: landing.x, z: landing.z });
    rests.push({ x: rest.x, z: rest.z });
    carries.push(result.carryM);
    totals.push(result.totalM);
  }

  return { landings, rests, carries, totals };
}
