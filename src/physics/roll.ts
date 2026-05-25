import { BALL_RADIUS_M, G } from './constants';
import type { Surface } from './types';
import { SURFACE_PROPS } from '../presets/surfaces';
import type { KinState } from './integrator';

const DT_ROLL = 0.05;       // 50 ms — fine enough for visualization, fast enough to stop quickly
const MAX_ITERATIONS = 5000; // safety cap (~250 s of simulated rolling)

export interface RollResult {
  /** Path samples from the starting state to the final stopped state. */
  samples: KinState[];
}

/**
 * Pure horizontal roll under rolling friction.
 *   dv/dt = −μ_roll · g · v̂
 * The ball is treated as a point on the ground (y = ball radius). Vertical velocity is
 * zeroed at entry; this is the post-bounce ground game, not free flight.
 */
export function simulateRoll(initial: KinState, surface: Surface): RollResult {
  const { rollFriction, stopSpeed } = SURFACE_PROPS[surface];
  const decel = rollFriction * G; // m/s²

  const samples: KinState[] = [
    {
      pos: { ...initial.pos, y: BALL_RADIUS_M },
      vel: { x: initial.vel.x, y: 0, z: initial.vel.z },
      spin: { ...initial.spin },
      t: initial.t,
    },
  ];

  let s = samples[0]!;
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const speed = Math.hypot(s.vel.x, s.vel.z);
    if (speed < stopSpeed) break;

    const newSpeed = Math.max(0, speed - decel * DT_ROLL);
    const factor = newSpeed / speed;
    const vx = s.vel.x * factor;
    const vz = s.vel.z * factor;

    // Trapezoidal position update (more accurate than Euler for decelerating motion)
    const dx = (s.vel.x + vx) * 0.5 * DT_ROLL;
    const dz = (s.vel.z + vz) * 0.5 * DT_ROLL;

    s = {
      pos: { x: s.pos.x + dx, y: BALL_RADIUS_M, z: s.pos.z + dz },
      vel: { x: vx, y: 0, z: vz },
      spin: s.spin,
      t: s.t + DT_ROLL,
    };
    samples.push(s);
  }

  return { samples };
}
