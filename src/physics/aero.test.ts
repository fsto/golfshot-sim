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

/**
 * Literature-anchored CL/CD tests.
 *
 * Targets stitched from Bearman & Harvey (1976, Aeronautical Quarterly 27, Re 1.26e5–2.38e5),
 * Smits & Smith (1994, Re ~1e5–2e5), and Aoki et al. (2010, Re ~1.5e5).
 *
 * Allow ±0.03 envelope on CL (uncertainty across ball constructions / dimple patterns) and
 * ±0.03 on CD. The peak-L/D bound (≤ 0.85) is the SHARP constraint — published peak L/D for
 * dimpled golf balls is ~0.75–0.80 at S ≈ 0.20–0.30. A model with peak L/D > 1.0 produces
 * unphysically high apex heights and over-carry on mid-irons.
 */
describe('aero CL/CD vs spin ratio — literature anchors', () => {
  // (S, CL_min, CL_max) — Bearman/Aoki composite for typical Tour ball
  const CL_TARGETS: Array<[S: number, lo: number, hi: number]> = [
    [0.05, 0.05, 0.13],   // driver low-S regime
    [0.10, 0.13, 0.20],
    [0.15, 0.17, 0.23],
    [0.20, 0.20, 0.26],
    [0.25, 0.22, 0.28],
    [0.30, 0.24, 0.30],
    [0.40, 0.24, 0.30],   // CL nearing plateau
    [0.60, 0.20, 0.30],   // may begin to decline (non-monotonic for some balls)
  ];

  for (const [S, lo, hi] of CL_TARGETS) {
    test(`cl(${S}) ∈ [${lo}, ${hi}] (Bearman/Aoki)`, () => {
      const v = cl(S);
      expect(v).toBeGreaterThanOrEqual(lo);
      expect(v).toBeLessThanOrEqual(hi);
    });
  }

  // (S, CD_min, CD_max) — Bearman/Aoki composite. Note CD rises faster than current model.
  const CD_TARGETS: Array<[S: number, lo: number, hi: number]> = [
    [0.00, 0.22, 0.27],
    [0.10, 0.24, 0.28],
    [0.15, 0.26, 0.30],
    [0.20, 0.28, 0.32],
    [0.25, 0.29, 0.33],
    [0.30, 0.30, 0.35],
    [0.40, 0.34, 0.40],
    [0.60, 0.40, 0.50],
  ];

  for (const [S, lo, hi] of CD_TARGETS) {
    test(`cd(${S}) ∈ [${lo}, ${hi}] (Bearman/Aoki)`, () => {
      const v = cd(S);
      expect(v).toBeGreaterThanOrEqual(lo);
      expect(v).toBeLessThanOrEqual(hi);
    });
  }

  test('peak L/D over S ∈ [0.05, 0.7] is ≤ 0.85 (Bearman: ~0.78 at S=0.25)', () => {
    let peak = 0;
    let peakS = 0;
    for (let S = 0.05; S <= 0.7 + 1e-9; S += 0.01) {
      const L = cl(S);
      const D = cd(S);
      const LD = L / D;
      if (LD > peak) {
        peak = LD;
        peakS = S;
      }
    }
    // Hard upper bound — physically realistic peak for dimpled balls
    expect(peak).toBeLessThanOrEqual(0.85);
    // And the peak should be in the mid-S regime (where Bearman observed it), not at saturation
    expect(peakS).toBeGreaterThanOrEqual(0.15);
    expect(peakS).toBeLessThanOrEqual(0.40);
  });
});
