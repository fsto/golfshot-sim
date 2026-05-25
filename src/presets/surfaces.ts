import type { Surface } from '../physics/types';

export interface SurfaceProps {
  /** Coefficient of restitution: 0 = perfectly inelastic, 1 = perfectly elastic. Vertical velocity bounces back at −COR·v_y. */
  cor: number;
  /** Sliding friction coefficient during the impulsive bounce. */
  friction: number;
  /** Fraction of spin retained through each bounce. */
  spinRetention: number;
  /** Rolling friction coefficient (a = −μ_roll · g · v̂). */
  rollFriction: number;
  /** Speed (m/s) below which the rolling ball is considered stopped. */
  stopSpeed: number;
}

/**
 * Calibrated against Penner (2002) "Golf ball landing, bounce and roll on turf" and common
 * launch-monitor / shot-tracer defaults. Greens are firm and elastic; fairway moderately
 * absorbent; rough kills both bounce and roll.
 */
export const SURFACE_PROPS: Record<Surface, SurfaceProps> = {
  green: {
    cor: 0.50,
    friction: 0.40,
    spinRetention: 0.65,
    rollFriction: 0.08,
    stopSpeed: 0.10,
  },
  fairway: {
    cor: 0.40,
    friction: 0.50,
    spinRetention: 0.55,
    rollFriction: 0.18,
    stopSpeed: 0.10,
  },
  tee: {
    cor: 0.40,
    friction: 0.50,
    spinRetention: 0.55,
    rollFriction: 0.18,
    stopSpeed: 0.10,
  },
  rough: {
    cor: 0.25,
    friction: 0.80,
    spinRetention: 0.30,
    rollFriction: 0.45,
    stopSpeed: 0.15,
  },
};
