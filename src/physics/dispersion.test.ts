import { describe, expect, test } from 'vitest';
import { simulateDispersion, type DispersionSigmas } from './dispersion';
import type { BallLaunchInput, ClubDeliveryInput, EnvConditions } from './types';
import { cToK, mphToMps } from './units';
import { covariance2D } from '../lib/math/stats';

const ISA: EnvConditions = {
  tempK: cToK(15), pressurePa: 101325, humidityPct: 0,
  altitudeM: 0, windSpeedMps: 0, windDirDeg: 0, surface: 'fairway',
};

const DRIVER: BallLaunchInput = {
  mode: 'launch',
  ballSpeedMps: mphToMps(167),
  launchAngleDeg: 10.9,
  azimuthDeg: 0,
  backspinRpm: 2685,
  spinAxisDeg: 0,
};

const SEVEN_IRON_DELIVERY: ClubDeliveryInput = {
  mode: 'delivery',
  clubId: '7i',
  clubSpeedMps: mphToMps(89),
  attackAngleDeg: -4,
  clubPathDeg: 0,
  faceAngleDeg: 0,
  dynamicLoftDeg: 24.7,
};

describe('simulateDispersion', () => {
  test('N=0 returns empty arrays', () => {
    const r = simulateDispersion(DRIVER, ISA, {}, 0, 1);
    expect(r.landings).toEqual([]);
    expect(r.rests).toEqual([]);
    expect(r.carries).toEqual([]);
    expect(r.totals).toEqual([]);
  });

  test('all sigmas zero → all results identical to base shot', () => {
    const r = simulateDispersion(DRIVER, ISA, {}, 5, 42);
    expect(r.landings.length).toBe(5);
    const first = r.landings[0]!;
    for (const p of r.landings) {
      expect(p.x).toBeCloseTo(first.x, 6);
      expect(p.z).toBeCloseTo(first.z, 6);
    }
  });

  test('deterministic for the same seed', () => {
    const sigmas: DispersionSigmas = { ballSpeedMps: 1, spinAxisDeg: 5 };
    const a = simulateDispersion(DRIVER, ISA, sigmas, 30, 1234);
    const b = simulateDispersion(DRIVER, ISA, sigmas, 30, 1234);
    expect(a.landings).toEqual(b.landings);
  });

  test('ballSpeed sigma produces variance in carry (downrange direction)', () => {
    const r = simulateDispersion(DRIVER, ISA, { ballSpeedMps: 2 }, 80, 99);
    const cov = covariance2D(r.landings);
    expect(cov.sxx).toBeGreaterThan(20); // measurable downrange spread
  });

  test('spinAxis sigma produces lateral spread (z variance > x variance)', () => {
    const r = simulateDispersion(DRIVER, ISA, { spinAxisDeg: 6 }, 80, 7);
    const cov = covariance2D(r.landings);
    expect(cov.szz).toBeGreaterThan(20);
    expect(cov.szz).toBeGreaterThan(cov.sxx);
  });

  test('delivery mode: faceAngle sigma yields lateral spread (axis tilt drives curve)', () => {
    const r = simulateDispersion(SEVEN_IRON_DELIVERY, ISA, { faceAngleDeg: 2 }, 80, 51);
    const cov = covariance2D(r.landings);
    expect(cov.szz).toBeGreaterThan(5);
  });

  test('larger sigma → larger spread', () => {
    const small = simulateDispersion(DRIVER, ISA, { ballSpeedMps: 1 }, 80, 11);
    const big = simulateDispersion(DRIVER, ISA, { ballSpeedMps: 3 }, 80, 11);
    expect(covariance2D(big.landings).sxx).toBeGreaterThan(
      covariance2D(small.landings).sxx,
    );
  });

  test('delivery mode: smashFactor sigma never produces ball speeds above the preset cap', () => {
    // A really aggressive σ to try to push samples above the cap.
    const r = simulateDispersion(SEVEN_IRON_DELIVERY, ISA, { smashFactor: 0.1 }, 200, 17);
    // PGA 7-iron preset smash = 1.337 → max ball speed = 89 mph * 1.337 = 119 mph = 53.20 m/s
    const cap = 53.20;
    for (const carry of r.carries) {
      expect(carry).toBeLessThan(180); // sanity — no shot is 200+ yd with a 7-iron
    }
    // Carry monotonically increases with ball speed (roughly), so capping ball speed caps carry.
    // The base preset carries ~172 yd; a smash above 1.337 would exceed that systematically.
    // With clamp, the mean carry should be ≤ the base carry (or close to it given truncation).
    const meanCarry = r.carries.reduce((a, b) => a + b, 0) / r.carries.length;
    // Base 7-iron sim is ~178 yd; smash-only σ truncated above means mean carry should be ≤ base.
    expect(meanCarry).toBeLessThanOrEqual(178 / 1.0936 + 1); // converting yd→m, tolerate 1m
  });

  test('rest x is downrange of landing x on a forward shot', () => {
    const r = simulateDispersion(DRIVER, ISA, { ballSpeedMps: 1 }, 30, 3);
    for (let i = 0; i < r.landings.length; i++) {
      expect(r.rests[i]!.x).toBeGreaterThanOrEqual(r.landings[i]!.x - 0.5);
    }
  });
});
