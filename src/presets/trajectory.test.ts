import { describe, expect, test } from 'vitest';
import { simulateShot } from '../physics/shot';
import { cToK, mToYd } from '../physics/units';
import { CLUB_PRESETS } from './pgaPresets';
import type { ClubId, EnvConditions } from '../physics/types';

const ISA: EnvConditions = {
  tempK: cToK(15), pressurePa: 101325, humidityPct: 0,
  altitudeM: 0, windSpeedMps: 0, windDirDeg: 0, surface: 'fairway',
};

/**
 * Trajectory-shape guard rails — defends against future "carry happens to match but the ball
 * flies wrong" regressions like the one fixed in the mid-iron calibration: previously every
 * club had apex 32–40 m (Tour avg 26–30 m) and hang time 7+ s (Tour avg 5.5–6.0 s) because
 * the closed-form CL/CD produced peak L/D ≈ 1.07. After the table-interpolated coefficients
 * (peak L/D ≈ 0.83) all three flight-shape metrics are in published Tour ranges.
 *
 * Targets stitched from Trackman PGA-Tour averages (2009 3jack transcription + 2019 update,
 * referenced in README.md sources). Tolerances are intentionally loose because Tour-average
 * apex/hang figures are aggregates from many shots and span a meaningful spread per club.
 */
type Target = {
  apexLoM: number; apexHiM: number;
  hangLoS: number; hangHiS: number;
  descLoDeg: number; descHiDeg: number;
};

const TARGETS: Record<ClubId, Target> = {
  driver: { apexLoM: 24, apexHiM: 34, hangLoS: 5.7, hangHiS: 7.0, descLoDeg: 32, descHiDeg: 44 },
  '3w':   { apexLoM: 23, apexHiM: 34, hangLoS: 5.8, hangHiS: 7.0, descLoDeg: 38, descHiDeg: 48 },
  '5w':   { apexLoM: 24, apexHiM: 35, hangLoS: 5.8, hangHiS: 7.0, descLoDeg: 41, descHiDeg: 50 },
  '3i':   { apexLoM: 23, apexHiM: 36, hangLoS: 5.5, hangHiS: 6.9, descLoDeg: 41, descHiDeg: 50 },
  '4i':   { apexLoM: 23, apexHiM: 36, hangLoS: 5.5, hangHiS: 6.9, descLoDeg: 43, descHiDeg: 51 },
  '5i':   { apexLoM: 24, apexHiM: 36, hangLoS: 5.5, hangHiS: 6.9, descLoDeg: 44, descHiDeg: 52 },
  '6i':   { apexLoM: 23, apexHiM: 33, hangLoS: 5.3, hangHiS: 6.5, descLoDeg: 44, descHiDeg: 52 },
  '7i':   { apexLoM: 22, apexHiM: 32, hangLoS: 5.0, hangHiS: 6.3, descLoDeg: 44, descHiDeg: 53 },
  '8i':   { apexLoM: 22, apexHiM: 31, hangLoS: 4.8, hangHiS: 6.2, descLoDeg: 45, descHiDeg: 54 },
  '9i':   { apexLoM: 22, apexHiM: 31, hangLoS: 4.8, hangHiS: 6.1, descLoDeg: 46, descHiDeg: 55 },
  pw:     { apexLoM: 18, apexHiM: 30, hangLoS: 4.4, hangHiS: 5.9, descLoDeg: 45, descHiDeg: 55 },
  gw:     { apexLoM: 16, apexHiM: 28, hangLoS: 4.0, hangHiS: 5.6, descLoDeg: 46, descHiDeg: 58 },
  sw:     { apexLoM: 14, apexHiM: 26, hangLoS: 3.6, hangHiS: 5.4, descLoDeg: 48, descHiDeg: 60 },
  lw:     { apexLoM: 12, apexHiM: 24, hangLoS: 3.2, hangHiS: 5.0, descLoDeg: 50, descHiDeg: 62 },
};

const SHAPED_CLUBS: ClubId[] = [
  'driver', '3w', '5w', '3i', '4i', '5i', '6i', '7i', '8i', '9i', 'pw',
];

describe('preset trajectory shape — apex, hang time, descent angle in Tour range', () => {
  for (const id of SHAPED_CLUBS) {
    const preset = CLUB_PRESETS[id];
    const target = TARGETS[id];

    test(`${preset.label} apex ∈ [${target.apexLoM}, ${target.apexHiM}] m`, () => {
      const result = simulateShot(
        {
          mode: 'delivery',
          clubId: preset.id,
          clubSpeedMps: preset.neutralDelivery.clubSpeedMps,
          attackAngleDeg: preset.neutralDelivery.attackAngleDeg,
          clubPathDeg: 0,
          faceAngleDeg: 0,
          dynamicLoftDeg: preset.neutralDelivery.dynamicLoftDeg,
        },
        ISA,
      );
      const apexYd = mToYd(result.apexM);
      expect(result.apexM, `${preset.label} apex was ${result.apexM.toFixed(1)} m (${apexYd.toFixed(0)} yd)`).toBeGreaterThanOrEqual(target.apexLoM);
      expect(result.apexM, `${preset.label} apex was ${result.apexM.toFixed(1)} m (${apexYd.toFixed(0)} yd)`).toBeLessThanOrEqual(target.apexHiM);
    });

    test(`${preset.label} hang time ∈ [${target.hangLoS}, ${target.hangHiS}] s`, () => {
      const result = simulateShot(
        {
          mode: 'delivery',
          clubId: preset.id,
          clubSpeedMps: preset.neutralDelivery.clubSpeedMps,
          attackAngleDeg: preset.neutralDelivery.attackAngleDeg,
          clubPathDeg: 0,
          faceAngleDeg: 0,
          dynamicLoftDeg: preset.neutralDelivery.dynamicLoftDeg,
        },
        ISA,
      );
      expect(result.hangTimeS, `${preset.label} hang was ${result.hangTimeS.toFixed(2)} s`).toBeGreaterThanOrEqual(target.hangLoS);
      expect(result.hangTimeS, `${preset.label} hang was ${result.hangTimeS.toFixed(2)} s`).toBeLessThanOrEqual(target.hangHiS);
    });

    test(`${preset.label} descent angle ∈ [${target.descLoDeg}, ${target.descHiDeg}]°`, () => {
      const result = simulateShot(
        {
          mode: 'delivery',
          clubId: preset.id,
          clubSpeedMps: preset.neutralDelivery.clubSpeedMps,
          attackAngleDeg: preset.neutralDelivery.attackAngleDeg,
          clubPathDeg: 0,
          faceAngleDeg: 0,
          dynamicLoftDeg: preset.neutralDelivery.dynamicLoftDeg,
        },
        ISA,
      );
      expect(result.descentAngleDeg, `${preset.label} descent was ${result.descentAngleDeg.toFixed(1)}°`).toBeGreaterThanOrEqual(target.descLoDeg);
      expect(result.descentAngleDeg, `${preset.label} descent was ${result.descentAngleDeg.toFixed(1)}°`).toBeLessThanOrEqual(target.descHiDeg);
    });
  }
});
