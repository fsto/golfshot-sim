import { describe, expect, test } from 'vitest';
import { airDensity, isaPressure } from './atmosphere';
import { cToK } from './units';

const close = (a: number, b: number, tol: number) =>
  expect(Math.abs(a - b)).toBeLessThan(tol);

describe('atmosphere', () => {
  test('ISA sea level dry air → 1.225 kg/m³', () => {
    const rho = airDensity({
      tempK: cToK(15),
      pressurePa: 101325,
      humidityPct: 0,
      altitudeM: 0,
      windSpeedMps: 0,
      windDirDeg: 0,
    });
    close(rho, 1.225, 0.002);
  });

  test('humidity reduces air density (water vapor is lighter)', () => {
    const dry = airDensity({
      tempK: cToK(15), pressurePa: 101325, humidityPct: 0,
      altitudeM: 0, windSpeedMps: 0, windDirDeg: 0,
    });
    const humid = airDensity({
      tempK: cToK(15), pressurePa: 101325, humidityPct: 100,
      altitudeM: 0, windSpeedMps: 0, windDirDeg: 0,
    });
    expect(humid).toBeLessThan(dry);
    // At 15°C 100% RH, density drops ~0.5%; Brüning/Picard typical reference ~1.220 kg/m³
    close(humid, 1.219, 0.003);
  });

  test('higher altitude pressure → lower density', () => {
    // Denver ~1600 m, ~83400 Pa, 15°C
    const rho = airDensity({
      tempK: cToK(15),
      pressurePa: 83400,
      humidityPct: 0,
      altitudeM: 1600,
      windSpeedMps: 0,
      windDirDeg: 0,
    });
    close(rho, 1.008, 0.01);
  });

  test('hot day reduces density', () => {
    const rho = airDensity({
      tempK: cToK(35), pressurePa: 101325, humidityPct: 0,
      altitudeM: 0, windSpeedMps: 0, windDirDeg: 0,
    });
    close(rho, 1.146, 0.005);
  });

  test('isaPressure(0m) = 101325 Pa', () => {
    close(isaPressure(0), 101325, 1);
  });

  test('isaPressure(1500m) ≈ 84556 Pa (ISA)', () => {
    close(isaPressure(1500), 84556, 50);
  });
});
