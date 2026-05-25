import { describe, expect, test } from 'vitest';
import {
  speedDisplay, speedFromDisplay, speedUnit,
  distanceDisplay, distanceUnit,
  shortDistanceDisplay,
  tempDisplay, tempFromDisplay, tempUnit,
  pressureDisplay, pressureFromDisplay, pressureUnit,
  altitudeDisplay, altitudeFromDisplay, altitudeUnit,
} from './format';

const approx = (a: number, b: number, eps = 1e-9) =>
  expect(Math.abs(a - b)).toBeLessThan(eps);

describe('format helpers — imperial', () => {
  test('speed round-trip mph', () => {
    approx(speedFromDisplay(speedDisplay(33.5, 'imperial'), 'imperial'), 33.5);
    expect(speedUnit('imperial')).toBe('mph');
  });

  test('distance display in yd', () => {
    approx(distanceDisplay(91.44, 'imperial'), 100);
    expect(distanceUnit('imperial')).toBe('yd');
  });

  test('short distance (apex) in ft', () => {
    approx(shortDistanceDisplay(30, 'imperial'), 98.4252, 1e-3);
  });

  test('temp round-trip °F', () => {
    approx(tempFromDisplay(tempDisplay(288.15, 'imperial'), 'imperial'), 288.15, 1e-9);
    expect(tempUnit('imperial')).toBe('°F');
  });

  test('pressure round-trip inHg', () => {
    approx(pressureFromDisplay(pressureDisplay(101325, 'imperial'), 'imperial'), 101325, 1e-6);
    expect(pressureUnit('imperial')).toBe('inHg');
  });

  test('altitude round-trip ft', () => {
    approx(altitudeFromDisplay(altitudeDisplay(500, 'imperial'), 'imperial'), 500, 1e-9);
    expect(altitudeUnit('imperial')).toBe('ft');
  });
});

describe('format helpers — metric', () => {
  test('speed stays in mph even under metric (Trackman convention)', () => {
    // 33.5 m/s = 74.94 mph
    approx(speedDisplay(33.5, 'metric'), 33.5 / 0.44704, 1e-6);
    approx(speedFromDisplay(74.94, 'metric'), 74.94 * 0.44704, 1e-3);
    expect(speedUnit('metric')).toBe('mph');
  });

  test('distance identity in meters', () => {
    approx(distanceDisplay(91.44, 'metric'), 91.44);
    expect(distanceUnit('metric')).toBe('m');
  });

  test('temp returns °C', () => {
    approx(tempDisplay(288.15, 'metric'), 15);
    approx(tempFromDisplay(15, 'metric'), 288.15);
    expect(tempUnit('metric')).toBe('°C');
  });

  test('pressure in hPa', () => {
    approx(pressureDisplay(101325, 'metric'), 1013.25);
    approx(pressureFromDisplay(1013.25, 'metric'), 101325);
    expect(pressureUnit('metric')).toBe('hPa');
  });

  test('altitude identity in meters', () => {
    approx(altitudeDisplay(500, 'metric'), 500);
    expect(altitudeUnit('metric')).toBe('m');
  });
});
