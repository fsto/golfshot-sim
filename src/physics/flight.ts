import type { BallLaunchInput, EnvConditions, Trajectory, Vec3 } from './types';
import { airDensity } from './atmosphere';
import { degToRad, rpmToRads } from './units';
import { ZERO, add, cross, lincomb2, normalize, scale } from '../lib/math/vec3';
import { rk4Step, type Derivs, type KinState } from './integrator';
import { bodyAccel, type AeroContext } from './forces';
import { SPIN_DECAY_TAU_S } from './spin';

const DT = 0.002;          // s — integrator step
const T_MAX = 15;          // s — safety cap; well above any real flight
const STORE_EVERY = 1;     // store every step; downsampling for plots happens at UI layer

/**
 * Wind world-frame velocity vector from meteorological "from" convention.
 * windDirDeg is the direction the wind is COMING FROM, measured clockwise from +x (target line):
 *   0°   = wind blowing in -x  → headwind
 *   90°  = wind blowing in -z  → cross-wind from the right (R→L)
 *   180° = wind blowing in +x  → tailwind
 *   270° = wind blowing in +z  → cross-wind from the left (L→R)
 */
function windVector(env: EnvConditions): Vec3 {
  if (env.windSpeedMps === 0) return ZERO;
  const fromRad = degToRad(env.windDirDeg);
  return {
    x: -env.windSpeedMps * Math.cos(fromRad),
    y: 0,
    z: -env.windSpeedMps * Math.sin(fromRad),
  };
}

/** Construct the initial velocity vector from ball-launch inputs. */
function launchVelocity(input: BallLaunchInput): Vec3 {
  const e = degToRad(input.launchAngleDeg);
  const a = degToRad(input.azimuthDeg);
  return {
    x: input.ballSpeedMps * Math.cos(e) * Math.cos(a),
    y: input.ballSpeedMps * Math.sin(e),
    z: input.ballSpeedMps * Math.cos(e) * Math.sin(a),
  };
}

/**
 * Construct the spin angular velocity vector.
 * Pure-backspin axis is horizontal, perpendicular to the ground track of the launch, pointing
 * to the player's right. spinAxisDeg tilts the axis around the velocity vector by Rodrigues'
 * rotation — positive tilt produces Magnus push to +z (slice/fade), negative to -z (draw/hook).
 */
function spinVector(input: BallLaunchInput, velUnit: Vec3): Vec3 {
  const azRad = degToRad(input.azimuthDeg);
  // R = horizontal-right perpendicular to ground track.
  // For launch at azimuth a: R = (-sin a, 0, cos a)  (unit, ⊥ to (cos a, 0, sin a))
  const R: Vec3 = { x: -Math.sin(azRad), y: 0, z: Math.cos(azRad) };
  // N = velUnit × R — completes the orthonormal frame around the velocity axis.
  const N = cross(velUnit, R);
  const theta = degToRad(input.spinAxisDeg);
  const axis = add(scale(R, Math.cos(theta)), scale(N, Math.sin(theta)));
  const mag = rpmToRads(input.backspinRpm);
  return scale(axis, mag);
}

export function simulateFlight(input: BallLaunchInput, env: EnvConditions): Trajectory {
  const vel = launchVelocity(input);
  const spin = spinVector(input, normalize(vel));
  const initial: KinState = { pos: { x: 0, y: 0, z: 0 }, vel, spin, t: 0 };
  return simulateFlightFromState(initial, env);
}

/**
 * Lower-level entry: integrate from an arbitrary ball state until ground contact (y ≤ 0).
 * Used by simulateFlight for the primary launch, and by shot.ts for the post-bounce
 * secondary arcs in the ground game.
 *
 * Ground-crossing rule: if the initial state is above ground, the integrator runs until
 * y crosses zero from positive. If the initial state is on the ground (y ≈ 0) with vy > 0,
 * we wait until y crosses zero again. With vy ≤ 0 we return immediately — there is no flight.
 */
export function simulateFlightFromState(initial: KinState, env: EnvConditions): Trajectory {
  const rho = airDensity(env);
  const wind = windVector(env);
  const ctx: AeroContext = { rho, wind };

  const derivs: Derivs = (s) => ({
    dpos: s.vel,
    dvel: bodyAccel(s, ctx),
    dspin: scale(s.spin, -1 / SPIN_DECAY_TAU_S),
  });

  const samples: KinState[] = [];
  let s: KinState = initial;
  samples.push(s);
  let apexM = s.pos.y;

  // If the ball isn't going up, there's no flight phase.
  if (s.vel.y <= 0 && s.pos.y <= 0) {
    return { samples, apexM, hangTimeS: 0, landingState: s };
  }

  let stepIdx = 0;
  const startT = s.t;
  while (s.t - startT < T_MAX) {
    const next = rk4Step(s, DT, derivs);
    stepIdx++;

    // Ground crossing: y went from ≥0 to <0, with at least one step from the start
    if (next.pos.y < 0 && s.pos.y >= 0 && stepIdx > 1) {
      const denom = s.pos.y - next.pos.y;
      const alpha = denom === 0 ? 0 : s.pos.y / denom; // ∈ [0,1)
      const landing: KinState = {
        pos: lincomb2(s.pos, 1 - alpha, next.pos, alpha),
        vel: lincomb2(s.vel, 1 - alpha, next.vel, alpha),
        spin: lincomb2(s.spin, 1 - alpha, next.spin, alpha),
        t: s.t + alpha * DT,
      };
      samples.push(landing);
      apexM = Math.max(apexM, landing.pos.y);
      return { samples, apexM, hangTimeS: landing.t - startT, landingState: landing };
    }

    s = next;
    if (stepIdx % STORE_EVERY === 0) samples.push(s);
    if (s.pos.y > apexM) apexM = s.pos.y;
  }
  return { samples, apexM, hangTimeS: s.t - startT, landingState: s };
}
