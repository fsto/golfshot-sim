import { EARTH_OMEGA } from './constants';
import { degToRad } from './units';
import type { Vec3 } from './types';

/**
 * Coriolis acceleration on the ball in the local rotating frame.
 *
 * Assumes the player aims along the local north meridian. With physics axes (x = down-target =
 * north, y = up, z = lateral right = east), Earth's angular velocity is
 *   Ω = ω·(cos φ, sin φ, 0)
 * and a = −2 Ω × v expands to:
 *   a_x = −2ω·sin φ · v_z
 *   a_y =  2ω·cos φ · v_z
 *   a_z =  2ω·(sin φ · v_x  −  cos φ · v_y)
 *
 * In the northern hemisphere the ball deflects right of its aim line (positive z); in the
 * southern hemisphere it deflects left. For a typical driver shot the effect is <0.1 m, so
 * Coriolis is essentially cosmetic — but the model is physically correct.
 */
export function coriolisAccel(v: Vec3, latitudeDeg: number | undefined): Vec3 {
  if (latitudeDeg === undefined) return { x: 0, y: 0, z: 0 };
  const phi = degToRad(latitudeDeg);
  const s = Math.sin(phi);
  const c = Math.cos(phi);
  const two_omega = 2 * EARTH_OMEGA;
  return {
    x: -two_omega * s * v.z,
    y: two_omega * c * v.z,
    z: two_omega * (s * v.x - c * v.y),
  };
}
