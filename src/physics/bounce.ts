import { BALL_RADIUS_M as R } from './constants';
import type { Surface } from './types';
import { SURFACE_PROPS } from '../presets/surfaces';
import type { KinState } from './integrator';

/**
 * Single rigid-body bounce of the ball against the turf, after Penner (2002).
 *
 * Decomposition at contact:
 *   - Normal impulse (vertical): J_n = m · (1 + COR) · |v_y|. Post-bounce v_y = −COR · v_y.
 *   - Tangential (horizontal) impulse: friction × J_n, acting opposite to the SLIP velocity
 *     of the contact patch — which is the ball's horizontal velocity plus the local tangential
 *     velocity contributed by the spin (ω × r, with r = (0, −R, 0) at the contact point).
 *   - Slip is capped: friction cannot reverse the slip direction within one bounce; the
 *     tangential impulse is min(friction · J_n, slip momentum).
 *
 * Net effects:
 *   - Vertical bounce attenuated by COR (turf-dependent).
 *   - Heavy backspin + firm green → contact slip is forward; friction strongly decelerates
 *     forward motion or reverses it (the "spin-back" you see on TV).
 *   - Sidespin tilts the bounce direction (slice/draw kicks).
 *   - Spin magnitude attenuated by spinRetention per bounce.
 *   - Position is pinned to y = ball radius (the ball is sitting on the surface).
 *
 * The bounce is treated as instantaneous (Δt = 0); time is preserved.
 */
export function bounceImpact(s: KinState, surface: Surface): KinState {
  const { cor, friction, spinRetention } = SURFACE_PROPS[surface];

  // Vertical: reverse and attenuate
  const vyAfter = -cor * s.vel.y;

  // Slip velocity at the contact point (horizontal only):
  //   v_contact = v_center + ω × r,   r = (0, −R, 0)
  //   ω × (0, −R, 0) = (−ω_z·R, 0, ω_x·R)
  // So the slip in the ground plane is (v_x − ω_z·R, 0, v_z + ω_x·R).
  // Wait — careful. Cross product:
  //   ω = (ω_x, ω_y, ω_z); r = (0, −R, 0)
  //   ω × r = (ω_y·0 − ω_z·(−R), ω_z·0 − ω_x·0, ω_x·(−R) − ω_y·0)
  //         = (ω_z·R, 0, −ω_x·R)
  // So v_contact_horiz = (v_x + ω_z·R, v_z − ω_x·R).
  const slipX = s.vel.x + s.spin.z * R;
  const slipZ = s.vel.z - s.spin.x * R;
  const slipMag = Math.sqrt(slipX * slipX + slipZ * slipZ);

  const normalImpulsePerMass = (1 + cor) * Math.abs(s.vel.y); // J_n / m
  const maxFrictionDv = friction * normalImpulsePerMass;
  const dv = Math.min(maxFrictionDv, slipMag);

  let vxAfter = s.vel.x;
  let vzAfter = s.vel.z;
  if (slipMag > 1e-9) {
    vxAfter -= (slipX / slipMag) * dv;
    vzAfter -= (slipZ / slipMag) * dv;
  }

  return {
    pos: { x: s.pos.x, y: R, z: s.pos.z },
    vel: { x: vxAfter, y: vyAfter, z: vzAfter },
    spin: {
      x: s.spin.x * spinRetention,
      y: s.spin.y * spinRetention,
      z: s.spin.z * spinRetention,
    },
    t: s.t,
  };
}
