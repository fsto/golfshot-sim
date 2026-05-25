import { describe, expect, test } from 'vitest';
import { simulateShot } from './shot';
import { cToK, mphToMps, mToYd, radToDeg } from './units';
import type { BallLaunchInput, EnvConditions } from './types';

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

describe('simulateShot', () => {
  test('produces ShotResult with all key fields populated', () => {
    const r = simulateShot(DRIVER, ISA);
    expect(r.flight.samples.length).toBeGreaterThan(100);
    expect(r.carryM).toBeGreaterThan(200);
    expect(r.totalM).toBeGreaterThan(r.carryM); // bounce + roll add distance
    expect(r.apexM).toBeGreaterThan(20);
    expect(r.hangTimeS).toBeGreaterThan(5);
    expect(r.firstBounce).not.toBeNull();
    expect(r.rollPath.length).toBeGreaterThan(0);
  });

  test('total distance respects surface (rough rolls much less than fairway than green)', () => {
    const greenTotal = simulateShot(DRIVER, { ...ISA, surface: 'green' }).totalM;
    const fairwayTotal = simulateShot(DRIVER, { ...ISA, surface: 'fairway' }).totalM;
    const roughTotal = simulateShot(DRIVER, { ...ISA, surface: 'rough' }).totalM;
    expect(greenTotal).toBeGreaterThan(fairwayTotal);
    expect(fairwayTotal).toBeGreaterThan(roughTotal);
  });

  test('descent angle is in expected range for a driver (~38..50°)', () => {
    const r = simulateShot(DRIVER, ISA);
    expect(r.descentAngleDeg).toBeGreaterThan(30);
    expect(r.descentAngleDeg).toBeLessThan(55);
  });

  test('lateralM matches landing z-coordinate', () => {
    const r = simulateShot(DRIVER, ISA);
    expect(r.lateralM).toBe(r.flight.landingState.pos.z);
  });

  test('derivedLaunch echoes input in launch mode', () => {
    const r = simulateShot(DRIVER, ISA);
    expect(r.derivedLaunch).toEqual(DRIVER);
  });

  test('delivery mode at preset neutral reproduces ball-launch mode within rounding', () => {
    const launchResult = simulateShot(DRIVER, ISA);
    const deliveryResult = simulateShot(
      {
        mode: 'delivery',
        clubId: 'driver',
        clubSpeedMps: mphToMps(112.08),
        attackAngleDeg: -1.3,
        clubPathDeg: 0,
        faceAngleDeg: 0,
        dynamicLoftDeg: 12.5,
      },
      ISA,
    );
    expect(deliveryResult.carryM).toBeCloseTo(launchResult.carryM, 0);
    expect(deliveryResult.derivedLaunch.mode).toBe('launch');
    expect(deliveryResult.derivedLaunch.ballSpeedMps).toBeCloseTo(DRIVER.ballSpeedMps, 1);
  });

  test('carry in yards round-trips through mToYd', () => {
    const r = simulateShot(DRIVER, ISA);
    const carryYd = mToYd(r.carryM);
    expect(carryYd).toBeGreaterThan(260);
    expect(carryYd).toBeLessThan(285);
  });

  test('radToDeg(descent) matches descentAngleDeg', () => {
    const r = simulateShot(DRIVER, ISA);
    const v = r.flight.landingState.vel;
    const expected = radToDeg(Math.atan2(-v.y, Math.sqrt(v.x * v.x + v.z * v.z)));
    expect(r.descentAngleDeg).toBeCloseTo(expected, 6);
  });
});
