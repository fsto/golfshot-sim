import { describe, expect, test } from 'vitest';
import { makeRng, gaussian } from './rng';

describe('makeRng', () => {
  test('same seed produces the same sequence', () => {
    const a = makeRng(42);
    const b = makeRng(42);
    const xs = Array.from({ length: 8 }, () => a());
    const ys = Array.from({ length: 8 }, () => b());
    expect(xs).toEqual(ys);
  });

  test('different seeds produce different sequences', () => {
    const a = makeRng(1);
    const b = makeRng(2);
    expect(a()).not.toBe(b());
  });

  test('output is in [0, 1)', () => {
    const r = makeRng(7);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('gaussian (standard normal)', () => {
  test('mean is ~0 over many samples', () => {
    const r = makeRng(123);
    const N = 5000;
    let sum = 0;
    for (let i = 0; i < N; i++) sum += gaussian(r);
    const mean = sum / N;
    expect(Math.abs(mean)).toBeLessThan(0.1);
  });

  test('variance is ~1 over many samples', () => {
    const r = makeRng(456);
    const N = 5000;
    const xs: number[] = [];
    for (let i = 0; i < N; i++) xs.push(gaussian(r));
    const mean = xs.reduce((s, x) => s + x, 0) / N;
    const variance = xs.reduce((s, x) => s + (x - mean) ** 2, 0) / N;
    expect(Math.abs(variance - 1)).toBeLessThan(0.1);
  });

  test('deterministic for the same seed', () => {
    const a = gaussian(makeRng(99));
    const b = gaussian(makeRng(99));
    expect(a).toBe(b);
  });
});
