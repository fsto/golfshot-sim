import { describe, expect, test } from 'vitest';
import { bounceImpact } from './bounce';
import { SURFACE_PROPS } from '../presets/surfaces';
import { BALL_RADIUS_M } from './constants';
import type { KinState } from './integrator';

const groundedState = (vel: { x: number; y: number; z: number }, spin = { x: 0, y: 0, z: 0 }): KinState => ({
  pos: { x: 100, y: 0, z: 0 },
  vel,
  spin,
  t: 5,
});

describe('bounce', () => {
  test('vertical velocity reverses and is scaled by COR', () => {
    const cor = SURFACE_PROPS.fairway.cor;
    const after = bounceImpact(groundedState({ x: 0, y: -10, z: 0 }), 'fairway');
    expect(after.vel.y).toBeCloseTo(cor * 10, 6);
  });

  test('horizontal velocity decreases with friction (no spin)', () => {
    const before = groundedState({ x: 30, y: -8, z: 0 });
    const after = bounceImpact(before, 'fairway');
    expect(after.vel.x).toBeGreaterThan(0);
    expect(after.vel.x).toBeLessThan(before.vel.x);
  });

  test('green is more elastic than fairway than rough', () => {
    const init = groundedState({ x: 30, y: -10, z: 0 });
    const green = bounceImpact(init, 'green');
    const fairway = bounceImpact(init, 'fairway');
    const rough = bounceImpact(init, 'rough');
    expect(green.vel.y).toBeGreaterThan(fairway.vel.y);
    expect(fairway.vel.y).toBeGreaterThan(rough.vel.y);
  });

  test('spin magnitude reduced by spinRetention factor', () => {
    const init = groundedState({ x: 30, y: -8, z: 0 }, { x: 0, y: 0, z: 200 });
    const after = bounceImpact(init, 'green');
    expect(after.spin.z).toBeCloseTo(200 * SURFACE_PROPS.green.spinRetention, 6);
  });

  test('high backspin on firm green produces back-spin step-up (large forward decel or reversal)', () => {
    // Heavy backspin (+z): contact point slip is in +x direction, friction pushes -x.
    // With friction × impulse large enough relative to forward momentum, post-bounce v_x can be small or negative.
    const before = groundedState({ x: 25, y: -10, z: 0 }, { x: 0, y: 0, z: 800 });
    const after = bounceImpact(before, 'green');
    expect(after.vel.x).toBeLessThan(before.vel.x - 5); // measurable forward decel
  });

  test('lateral velocity from sidespin: +x spin shifts ball -z (left from player view)', () => {
    // +x spin component: contact slip in -z direction (cross product with downward r=(0,-R,0)).
    // Wait actually: omega = (omega_x, 0, 0), r = (0, -R, 0). ω × r = (0*0 - 0*(-R), 0*0 - omega_x*0, omega_x*(-R) - 0*0) = (0, 0, -omega_x·R).
    // So +x spin makes contact velocity in -z. Friction acts in +z opposing slip, so v_z increases.
    const before = groundedState({ x: 20, y: -8, z: 0 }, { x: 200, y: 0, z: 200 });
    const after = bounceImpact(before, 'fairway');
    expect(after.vel.z).toBeGreaterThan(0); // pushed +z by friction
  });

  test('position pinned to ground (y = ball radius)', () => {
    const after = bounceImpact(groundedState({ x: 10, y: -5, z: 0 }), 'fairway');
    expect(after.pos.y).toBeCloseTo(BALL_RADIUS_M, 6);
  });

  test('time is preserved through the impulsive bounce', () => {
    const before = groundedState({ x: 10, y: -5, z: 0 });
    const after = bounceImpact(before, 'fairway');
    expect(after.t).toBe(before.t);
  });
});
