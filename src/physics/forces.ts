import type { Vec3 } from './types';
import { add, cross, norm, scale, sub, ZERO } from '../lib/math/vec3';
import { BALL_AREA_M2, BALL_MASS_KG, G } from './constants';
import { cd, cl, spinRatio } from './aero';
import type { KinState } from './integrator';

export interface AeroContext {
  rho: number;   // kg/m³, precomputed for the shot
  wind: Vec3;    // m/s, wind velocity vector in world frame (the velocity of the air)
}

/** Constant gravitational acceleration in world frame. */
export function gravityAccel(): Vec3 {
  return { x: 0, y: -G, z: 0 };
}

/**
 * Aerodynamic acceleration: drag + Magnus (lift), divided by ball mass.
 * Uses the velocity of the ball RELATIVE to the air (v − wind) for both the
 * dynamic-pressure factor and the unit vectors.
 *
 *   F_drag  = -½ ρ A Cd(S) |v_rel|² · v̂_rel
 *   F_lift  =  ½ ρ A Cl(S) |v_rel|² · (ŝ × v̂_rel)        ŝ = spin axis unit vector
 */
export function aeroAccel(s: KinState, ctx: AeroContext): Vec3 {
  if (ctx.rho <= 0) return ZERO;
  const vRel = sub(s.vel, ctx.wind);
  const vMag = norm(vRel);
  if (vMag === 0) return ZERO;
  const vHat = scale(vRel, 1 / vMag);

  const q = 0.5 * ctx.rho * BALL_AREA_M2 * vMag * vMag; // dynamic pressure × area, N
  const omegaMag = norm(s.spin);
  const S = spinRatio(omegaMag, vMag);

  // Drag accel = -|q|·Cd / m · v̂
  const aDrag = scale(vHat, (-q * cd(S)) / BALL_MASS_KG);

  // Magnus: direction = ŝ × v̂. When ω = 0 the cross is zero anyway.
  let aLift: Vec3 = ZERO;
  if (omegaMag > 0) {
    const sHat = scale(s.spin, 1 / omegaMag);
    const liftDir = cross(sHat, vHat); // not unit, but |ŝ × v̂| = sin(angle); for ω⊥v this is 1.
    aLift = scale(liftDir, (q * cl(S)) / BALL_MASS_KG);
  }

  return add(aDrag, aLift);
}

/** Total acceleration on the ball: aero + gravity. */
export function bodyAccel(s: KinState, ctx: AeroContext): Vec3 {
  return add(aeroAccel(s, ctx), gravityAccel());
}
