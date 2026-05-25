import type { Vec3 } from './types';
import { lincomb2 } from '../lib/math/vec3';

export interface KinState {
  pos: Vec3;
  vel: Vec3;
  spin: Vec3;
  t: number;
}

export interface KinDeriv {
  dpos: Vec3;
  dvel: Vec3;
  dspin: Vec3;
}

export type Derivs = (s: KinState) => KinDeriv;

/** Apply derivative scaled by dt to a state; produces an intermediate state. */
function shift(s: KinState, d: KinDeriv, dt: number): KinState {
  return {
    pos: lincomb2(s.pos, 1, d.dpos, dt),
    vel: lincomb2(s.vel, 1, d.dvel, dt),
    spin: lincomb2(s.spin, 1, d.dspin, dt),
    t: s.t + dt,
  };
}

/**
 * Classical 4th-order Runge-Kutta step.
 *   k1 = f(s)
 *   k2 = f(s + dt/2 · k1)
 *   k3 = f(s + dt/2 · k2)
 *   k4 = f(s + dt · k3)
 *   s' = s + dt/6 · (k1 + 2k2 + 2k3 + k4)
 */
export function rk4Step(s: KinState, dt: number, f: Derivs): KinState {
  const k1 = f(s);
  const k2 = f(shift(s, k1, dt / 2));
  const k3 = f(shift(s, k2, dt / 2));
  const k4 = f(shift(s, k3, dt));

  const sixth = dt / 6;
  return {
    pos: {
      x: s.pos.x + sixth * (k1.dpos.x + 2 * k2.dpos.x + 2 * k3.dpos.x + k4.dpos.x),
      y: s.pos.y + sixth * (k1.dpos.y + 2 * k2.dpos.y + 2 * k3.dpos.y + k4.dpos.y),
      z: s.pos.z + sixth * (k1.dpos.z + 2 * k2.dpos.z + 2 * k3.dpos.z + k4.dpos.z),
    },
    vel: {
      x: s.vel.x + sixth * (k1.dvel.x + 2 * k2.dvel.x + 2 * k3.dvel.x + k4.dvel.x),
      y: s.vel.y + sixth * (k1.dvel.y + 2 * k2.dvel.y + 2 * k3.dvel.y + k4.dvel.y),
      z: s.vel.z + sixth * (k1.dvel.z + 2 * k2.dvel.z + 2 * k3.dvel.z + k4.dvel.z),
    },
    spin: {
      x: s.spin.x + sixth * (k1.dspin.x + 2 * k2.dspin.x + 2 * k3.dspin.x + k4.dspin.x),
      y: s.spin.y + sixth * (k1.dspin.y + 2 * k2.dspin.y + 2 * k3.dspin.y + k4.dspin.y),
      z: s.spin.z + sixth * (k1.dspin.z + 2 * k2.dspin.z + 2 * k3.dspin.z + k4.dspin.z),
    },
    t: s.t + dt,
  };
}
