import { describe, expect, test } from 'vitest';
import { simulateRoll } from './roll';
import { BALL_RADIUS_M } from './constants';
import type { KinState } from './integrator';

const rolling = (vx: number, vz = 0): KinState => ({
  pos: { x: 100, y: BALL_RADIUS_M, z: 0 },
  vel: { x: vx, y: 0, z: vz },
  spin: { x: 0, y: 0, z: 0 },
  t: 6,
});

describe('roll', () => {
  test('ball stops eventually (final speed ≈ 0)', () => {
    const r = simulateRoll(rolling(10), 'fairway');
    const final = r.samples[r.samples.length - 1]!;
    const speed = Math.sqrt(final.vel.x ** 2 + final.vel.z ** 2);
    expect(speed).toBeLessThan(0.5);
  });

  test('green produces longer roll than fairway than rough', () => {
    const green = simulateRoll(rolling(8), 'green');
    const fairway = simulateRoll(rolling(8), 'fairway');
    const rough = simulateRoll(rolling(8), 'rough');
    const dist = (r: ReturnType<typeof simulateRoll>) => {
      const f = r.samples[r.samples.length - 1]!;
      const s = r.samples[0]!;
      return Math.hypot(f.pos.x - s.pos.x, f.pos.z - s.pos.z);
    };
    expect(dist(green)).toBeGreaterThan(dist(fairway));
    expect(dist(fairway)).toBeGreaterThan(dist(rough));
  });

  test('path is a straight line in the direction of initial velocity', () => {
    // 30° rightward roll
    const vMag = 10;
    const angle = Math.PI / 6;
    const r = simulateRoll(rolling(vMag * Math.cos(angle), vMag * Math.sin(angle)), 'fairway');
    const last = r.samples[r.samples.length - 1]!;
    const first = r.samples[0]!;
    const dx = last.pos.x - first.pos.x;
    const dz = last.pos.z - first.pos.z;
    // Ratio z/x should match tan(angle)
    expect(dz / dx).toBeCloseTo(Math.tan(angle), 3);
  });

  test('ball stays on the ground (y = ball radius) throughout', () => {
    const r = simulateRoll(rolling(10), 'fairway');
    for (const s of r.samples) {
      expect(s.pos.y).toBeCloseTo(BALL_RADIUS_M, 6);
    }
  });

  test('zero-velocity input returns no roll', () => {
    const r = simulateRoll(rolling(0), 'fairway');
    expect(r.samples.length).toBeLessThanOrEqual(2);
    expect(r.samples[r.samples.length - 1]!.pos.x).toBeCloseTo(100, 3);
  });

  test('faster initial → farther roll', () => {
    const slow = simulateRoll(rolling(5), 'fairway');
    const fast = simulateRoll(rolling(15), 'fairway');
    const dist = (r: ReturnType<typeof simulateRoll>) =>
      r.samples[r.samples.length - 1]!.pos.x - r.samples[0]!.pos.x;
    expect(dist(fast)).toBeGreaterThan(dist(slow) + 5);
  });
});
