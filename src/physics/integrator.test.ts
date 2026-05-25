import { describe, expect, test } from 'vitest';
import { rk4Step, type KinState, type Derivs } from './integrator';
import { G } from './constants';
import { ZERO } from '../lib/math/vec3';

/** Pure projectile in vacuum: only gravity acts. Analytical solution is closed form. */
const projectileDerivs: Derivs = (s) => ({
  dpos: s.vel,
  dvel: { x: 0, y: -G, z: 0 },
  dspin: ZERO,
});

const closeRel = (actual: number, expected: number, relTol: number) => {
  const denom = Math.max(1, Math.abs(expected));
  expect(Math.abs(actual - expected) / denom).toBeLessThan(relTol);
};

describe('rk4Step (projectile in vacuum, analytical reference)', () => {
  test('integrates vertical free-flight to closed-form solution', () => {
    let s: KinState = {
      pos: { x: 0, y: 0, z: 0 },
      vel: { x: 10, y: 30, z: 0 },
      spin: ZERO,
      t: 0,
    };
    const dt = 0.002;
    const steps = 1000; // 2 s total
    for (let i = 0; i < steps; i++) s = rk4Step(s, dt, projectileDerivs);

    const t = 2;
    const expectedY = 30 * t - 0.5 * G * t * t;
    const expectedVy = 30 - G * t;
    const expectedX = 10 * t;

    closeRel(s.t, 2, 1e-9);
    closeRel(s.pos.y, expectedY, 1e-9);
    closeRel(s.vel.y, expectedVy, 1e-9);
    closeRel(s.pos.x, expectedX, 1e-9);
    expect(s.pos.z).toBe(0);
  });

  test('energy conservation: KE + PE stays constant in vacuum', () => {
    let s: KinState = {
      pos: { x: 0, y: 0, z: 0 },
      vel: { x: 0, y: 50, z: 0 },
      spin: ZERO,
      t: 0,
    };
    const e0 = 0.5 * (s.vel.x * s.vel.x + s.vel.y * s.vel.y) + G * s.pos.y;
    for (let i = 0; i < 2000; i++) s = rk4Step(s, 0.002, projectileDerivs);
    const e1 = 0.5 * (s.vel.x * s.vel.x + s.vel.y * s.vel.y) + G * s.pos.y;
    expect(Math.abs(e1 - e0) / Math.abs(e0)).toBeLessThan(1e-9);
  });
});
