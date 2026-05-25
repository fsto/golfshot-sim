import { describe, expect, test } from 'vitest';
import { CLUB_PRESETS, getPreset, presetList } from './pgaPresets';
import { mpsToMph } from '../physics/units';

describe('pgaPresets', () => {
  test('has driver, 7i, PW at minimum', () => {
    expect(CLUB_PRESETS.driver).toBeDefined();
    expect(CLUB_PRESETS['7i']).toBeDefined();
    expect(CLUB_PRESETS.pw).toBeDefined();
  });

  test('driver tour-avg numbers match the calibration test', () => {
    const d = CLUB_PRESETS.driver;
    // 167 mph ball, 10.9° launch, 2685 rpm
    expect(mpsToMph(d.tourAvg.ballSpeedMps)).toBeCloseTo(167, 0);
    expect(d.tourAvg.launchDeg).toBeCloseTo(10.9, 1);
    expect(d.tourAvg.backspinRpm).toBeCloseTo(2685, 0);
  });

  test('smashFactor decreases with loft (driver highest)', () => {
    const driver = CLUB_PRESETS.driver.smashFactor;
    const sevenI = CLUB_PRESETS['7i'].smashFactor;
    const pw = CLUB_PRESETS.pw.smashFactor;
    expect(driver).toBeGreaterThan(sevenI);
    expect(sevenI).toBeGreaterThan(pw);
  });

  test('neutral delivery clubSpeed × smashFactor ≈ tourAvg ballSpeed', () => {
    for (const preset of presetList) {
      const derived = preset.neutralDelivery.clubSpeedMps * preset.smashFactor;
      expect(derived).toBeCloseTo(preset.tourAvg.ballSpeedMps, 1);
    }
  });

  test('attack angle is negative for irons (descending blow)', () => {
    expect(CLUB_PRESETS['7i'].neutralDelivery.attackAngleDeg).toBeLessThan(0);
    expect(CLUB_PRESETS.pw.neutralDelivery.attackAngleDeg).toBeLessThan(0);
  });

  test('getPreset returns the requested preset', () => {
    expect(getPreset('driver')).toBe(CLUB_PRESETS.driver);
    expect(getPreset('7i')).toBe(CLUB_PRESETS['7i']);
  });

  test('presetList is ordered driver → wedge', () => {
    expect(presetList[0]?.id).toBe('driver');
    expect(presetList[presetList.length - 1]?.id).toBe('pw');
  });
});
