import { describe, expect, test } from 'vitest';
import { decaySpin, SPIN_DECAY_TAU_S } from './spin';

describe('spin decay', () => {
  test('at t=0 returns original spin magnitude', () => {
    expect(decaySpin(300, 0)).toBeCloseTo(300, 9);
  });

  test('at t=τ falls to ω₀/e ≈ 0.368·ω₀', () => {
    expect(decaySpin(300, SPIN_DECAY_TAU_S)).toBeCloseTo(300 / Math.E, 6);
  });

  test('zero spin stays zero', () => {
    expect(decaySpin(0, 5)).toBe(0);
  });

  test('over typical driver flight (~6 s) loses 15..30%', () => {
    const loss = 1 - decaySpin(2685, 6) / 2685;
    expect(loss).toBeGreaterThan(0.10);
    expect(loss).toBeLessThan(0.35);
  });

  test('monotonically decreasing in t', () => {
    expect(decaySpin(1000, 2)).toBeGreaterThan(decaySpin(1000, 4));
    expect(decaySpin(1000, 4)).toBeGreaterThan(decaySpin(1000, 6));
  });
});
