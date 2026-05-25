import { describe, expect, test } from 'vitest';
import { coriolisAccel } from './coriolis';
import { simulateFlight } from './flight';
import { cToK, mphToMps } from './units';
import type { BallLaunchInput, EnvConditions } from './types';

const driver: BallLaunchInput = {
  mode: 'launch',
  ballSpeedMps: mphToMps(167),
  launchAngleDeg: 10.9,
  azimuthDeg: 0,
  backspinRpm: 2685,
  spinAxisDeg: 0,
};

const ISA = (overrides: Partial<EnvConditions> = {}): EnvConditions => ({
  tempK: cToK(15), pressurePa: 101325, humidityPct: 0,
  altitudeM: 0, windSpeedMps: 0, windDirDeg: 0, surface: 'fairway',
  ...overrides,
});

describe('coriolisAccel', () => {
  test('returns zero when latitude is undefined', () => {
    const a = coriolisAccel({ x: 50, y: 10, z: 0 }, undefined);
    expect(a).toEqual({ x: 0, y: 0, z: 0 });
  });

  test('stationary ball at any latitude gets zero Coriolis', () => {
    const a = coriolisAccel({ x: 0, y: 0, z: 0 }, 40);
    expect(a.x).toBeCloseTo(0, 9);
    expect(a.y).toBeCloseTo(0, 9);
    expect(a.z).toBeCloseTo(0, 9);
  });

  test('north-aimed shot in northern hemisphere is pushed eastward (+z)', () => {
    // φ = +40°: sin>0, cos>0. v = (50, 10, 0).
    // a_z = 2ω(sin·v_x − cos·v_y) > 0 because sin·50 > cos·10 (32 > 8)
    const a = coriolisAccel({ x: 50, y: 10, z: 0 }, 40);
    expect(a.z).toBeGreaterThan(0);
  });

  test('southern-hemisphere shot is deflected westward (−z)', () => {
    const a = coriolisAccel({ x: 50, y: 10, z: 0 }, -40);
    expect(a.z).toBeLessThan(0);
  });

  test('Coriolis effect on a driver flight is small but non-zero (lateral < 1 m)', () => {
    const noCor = simulateFlight(driver, ISA()).landingState;
    const withCor = simulateFlight(driver, ISA({ coriolisLatDeg: 40 })).landingState;
    const dz = withCor.pos.z - noCor.pos.z;
    expect(Math.abs(dz)).toBeGreaterThan(0.005); // measurable
    expect(Math.abs(dz)).toBeLessThan(1.0);      // but tiny
  });
});
