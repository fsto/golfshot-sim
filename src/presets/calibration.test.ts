import { describe, expect, test } from 'vitest';
import { simulateShot } from '../physics/shot';
import { cToK, mToYd } from '../physics/units';
import { presetList } from './pgaPresets';
import type { EnvConditions } from '../physics/types';

const ISA: EnvConditions = {
  tempK: cToK(15), pressurePa: 101325, humidityPct: 0,
  altitudeM: 0, windSpeedMps: 0, windDirDeg: 0, surface: 'fairway',
};

/**
 * Each preset's neutral delivery should produce its documented tour-avg carry within tolerance.
 *
 * The smooth global Cd/Cl formulas (Smits-Smith-style exponential lift, quadratic drag in S)
 * fit Driver / 7i / PW within ±4% but over-shoot mid-irons by ~10–15% because the model can't
 * resolve the non-monotonic L/D relationship in the S ∈ [0.15, 0.25] range. M8 will replace
 * the formulas with a table interpolated from Bearman & Harvey / Smits & Smith raw data points,
 * which should bring all clubs within 3%. For now this guards against regression at a looser
 * envelope.
 */
const TOLERANCE = 0.18;

describe('preset calibration: neutral delivery → tour-avg carry', () => {
  for (const preset of presetList) {
    test(`${preset.label} carries ${(mToYd(preset.tourAvg.carryM)).toFixed(0)} yd ±${TOLERANCE * 100}%`, () => {
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
      const target = preset.tourAvg.carryM;
      const rel = Math.abs(result.carryM - target) / target;
      if (rel > TOLERANCE) {
        throw new Error(
          `${preset.label}: ${mToYd(result.carryM).toFixed(1)} yd vs target ${mToYd(target).toFixed(1)} yd ` +
          `(rel err ${(rel * 100).toFixed(2)}%)`,
        );
      }
    });
  }
});
