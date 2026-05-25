import { describe, expect, test } from 'vitest';
import { mean, stddev, covariance2D, ellipseFromCovariance } from './stats';
import { makeRng, gaussian } from './rng';

const close = (a: number, b: number, tol: number) => expect(Math.abs(a - b)).toBeLessThan(tol);

describe('mean', () => {
  test('arithmetic mean of an array', () => {
    expect(mean([1, 2, 3, 4, 5])).toBe(3);
  });
  test('empty array returns 0', () => {
    expect(mean([])).toBe(0);
  });
});

describe('stddev (population)', () => {
  test('zero for empty or constant array', () => {
    expect(stddev([])).toBe(0);
    expect(stddev([3, 3, 3, 3])).toBe(0);
  });
  test('matches known value: stddev of [1,2,3,4,5] = √2', () => {
    close(stddev([1, 2, 3, 4, 5]), Math.sqrt(2), 1e-9);
  });
});

describe('covariance2D', () => {
  test('axis-aligned scatter: cov_xz ≈ 0; var_x and var_z reflect spreads', () => {
    const rng = makeRng(101);
    const points: { x: number; z: number }[] = [];
    for (let i = 0; i < 4000; i++) {
      points.push({ x: gaussian(rng) * 3, z: gaussian(rng) * 1 });
    }
    const c = covariance2D(points);
    close(c.sxx, 9, 0.5);
    close(c.szz, 1, 0.2);
    close(c.sxz, 0, 0.2);
  });

  test('perfectly correlated 45° line: cov_xz > 0, |corr| ≈ 1', () => {
    const points: { x: number; z: number }[] = [];
    for (let i = 0; i < 200; i++) {
      const t = (i - 100) * 0.1;
      points.push({ x: t, z: t });
    }
    const c = covariance2D(points);
    expect(c.sxz).toBeGreaterThan(0);
    const corr = c.sxz / Math.sqrt(c.sxx * c.szz);
    close(corr, 1, 1e-6);
  });

  test('zero points returns zero covariance', () => {
    const c = covariance2D([]);
    expect(c).toEqual({ sxx: 0, szz: 0, sxz: 0 });
  });
});

describe('ellipseFromCovariance (95%)', () => {
  test('axis-aligned diagonal cov → axes match sqrt(eigenvalues) × χ²-scale, angle ≈ 0', () => {
    // Spread σ_x=3, σ_z=1: cov = diag(9, 1). Semi-axes for 95%: sqrt(9·5.991) ≈ 7.34, sqrt(1·5.991) ≈ 2.45
    const e = ellipseFromCovariance({ sxx: 9, szz: 1, sxz: 0 });
    close(e.semiMajor, Math.sqrt(9 * 5.991), 0.01);
    close(e.semiMinor, Math.sqrt(1 * 5.991), 0.01);
    close(e.angleRad, 0, 1e-6);
  });

  test('vertical-major spread (σ_z > σ_x): angle ≈ ±π/2 and semi-major from σ_z', () => {
    const e = ellipseFromCovariance({ sxx: 1, szz: 9, sxz: 0 });
    expect(e.semiMajor).toBeGreaterThan(e.semiMinor);
    close(e.semiMajor, Math.sqrt(9 * 5.991), 0.01);
    close(Math.abs(Math.cos(e.angleRad)), 0, 1e-6); // angle is ±π/2
  });

  test('45° rotated covariance produces angle ≈ π/4', () => {
    // Rotate diag(9,1) by 45°: cov entries are mean of variances on the diagonal, half their difference on the off-diagonal.
    //   σ²_x' = σ²_z' = (9+1)/2 = 5;   σ_xz = (9−1)/2 = 4
    const e = ellipseFromCovariance({ sxx: 5, szz: 5, sxz: 4 });
    close(Math.abs(e.angleRad), Math.PI / 4, 1e-6);
    close(e.semiMajor, Math.sqrt(9 * 5.991), 0.05);
    close(e.semiMinor, Math.sqrt(1 * 5.991), 0.05);
  });

  test('degenerate (all-zero) covariance returns a zero ellipse', () => {
    const e = ellipseFromCovariance({ sxx: 0, szz: 0, sxz: 0 });
    expect(e.semiMajor).toBe(0);
    expect(e.semiMinor).toBe(0);
  });
});
