import { describe, expect, test } from 'vitest';
import { cl, cd, reynoldsNumber, spinRatio } from './aero';
import { BALL_RADIUS_M } from './constants';

describe('aero', () => {
  test('reynoldsNumber for typical driver shot is in turbulent regime (~2e5)', () => {
    // ~75 m/s ball, sea-level ISA air (ν ≈ 1.46e-5 m²/s)
    const Re = reynoldsNumber(75, 1.46e-5);
    expect(Re).toBeGreaterThan(1.5e5);
    expect(Re).toBeLessThan(2.5e5);
  });

  test('spinRatio S = ωR / |v|', () => {
    // 2685 rpm = 281.16 rad/s, R = 0.021335 m, v = 74.6 m/s (driver)
    const omega = (2685 * 2 * Math.PI) / 60;
    const S = spinRatio(omega, 74.6);
    expect(S).toBeCloseTo((omega * BALL_RADIUS_M) / 74.6, 6);
    expect(S).toBeGreaterThan(0.07);
    expect(S).toBeLessThan(0.10);
  });

  test('cl(0) = 0 (no spin → no Magnus lift)', () => {
    expect(cl(0)).toBe(0);
  });

  test('cl monotonically increasing for small S', () => {
    expect(cl(0.1)).toBeGreaterThan(cl(0));
    expect(cl(0.2)).toBeGreaterThan(cl(0.1));
    expect(cl(0.3)).toBeGreaterThan(cl(0.2));
  });

  test('cl in published range for driver-like S (~0.08): 0.08..0.20', () => {
    const v = cl(0.08);
    expect(v).toBeGreaterThan(0.07);
    expect(v).toBeLessThan(0.20);
  });

  test('cd is bounded for golf-relevant range (S in [0, 0.4])', () => {
    for (let S = 0; S <= 0.4; S += 0.05) {
      const c = cd(S);
      expect(c).toBeGreaterThan(0.18);
      expect(c).toBeLessThan(0.40);
    }
  });

  test('cd at S=0 is ~0.24 (no-spin dimpled ball, supercritical Re)', () => {
    expect(cd(0)).toBeCloseTo(0.24, 2);
  });

  test('cd increases with spin (induced drag from spin)', () => {
    expect(cd(0.2)).toBeGreaterThan(cd(0));
  });
});
