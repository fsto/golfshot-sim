import { describe, expect, test } from 'vitest';
import {
  mphToMps, mpsToMph,
  ydToM, mToYd,
  rpmToRads, radsToRpm,
  fToK, kToF, cToK, kToC,
  inHgToPa, paToInHg,
  ftToM, mToFt,
  degToRad, radToDeg,
} from './units';

const approx = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps);

describe('units', () => {
  test('mph <-> m/s', () => {
    approx(mphToMps(100), 44.704);
    approx(mpsToMph(44.704), 100);
    approx(mpsToMph(mphToMps(167)), 167, 1e-9);
  });

  test('yards <-> meters', () => {
    approx(ydToM(100), 91.44);
    approx(mToYd(91.44), 100);
    approx(mToYd(ydToM(275)), 275, 1e-9);
  });

  test('rpm <-> rad/s', () => {
    approx(rpmToRads(60), 2 * Math.PI);
    approx(radsToRpm(2 * Math.PI), 60);
    approx(radsToRpm(rpmToRads(2685)), 2685, 1e-9);
  });

  test('°F <-> K and °C <-> K', () => {
    approx(fToK(32), 273.15);
    approx(fToK(212), 373.15);
    approx(kToF(273.15), 32);
    approx(cToK(0), 273.15);
    approx(kToC(273.15), 0);
  });

  test('inHg <-> Pa', () => {
    // 29.92 inHg ≈ 101325 Pa (standard)
    approx(inHgToPa(29.92), 101325, 10);
    approx(paToInHg(101325), 29.92, 0.01);
  });

  test('feet <-> meters', () => {
    approx(ftToM(1), 0.3048);
    approx(mToFt(0.3048), 1);
  });

  test('deg <-> rad', () => {
    approx(degToRad(180), Math.PI);
    approx(radToDeg(Math.PI), 180);
  });
});
