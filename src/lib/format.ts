import {
  mpsToMph, mphToMps,
  mToYd, ydToM,
  mToFt, ftToM,
  kToF, fToK, kToC, cToK,
  paToInHg, inHgToPa,
} from '../physics/units';
import type { Units } from '../state/shotStore';

// Speed (m/s ↔ mph)
export const speedDisplay = (mps: number, u: Units): number =>
  u === 'imperial' ? mpsToMph(mps) : mps;
export const speedFromDisplay = (val: number, u: Units): number =>
  u === 'imperial' ? mphToMps(val) : val;
export const speedUnit = (u: Units): string => (u === 'imperial' ? 'mph' : 'm/s');

// Long distance (m ↔ yd)
export const distanceDisplay = (m: number, u: Units): number =>
  u === 'imperial' ? mToYd(m) : m;
export const distanceFromDisplay = (val: number, u: Units): number =>
  u === 'imperial' ? ydToM(val) : val;
export const distanceUnit = (u: Units): string => (u === 'imperial' ? 'yd' : 'm');

// Short distance for apex / height (m ↔ ft)
export const shortDistanceDisplay = (m: number, u: Units): number =>
  u === 'imperial' ? mToFt(m) : m;
export const shortDistanceFromDisplay = (val: number, u: Units): number =>
  u === 'imperial' ? ftToM(val) : val;
export const shortDistanceUnit = (u: Units): string => (u === 'imperial' ? 'ft' : 'm');

// Temperature (K ↔ °F / °C)
export const tempDisplay = (k: number, u: Units): number =>
  u === 'imperial' ? kToF(k) : kToC(k);
export const tempFromDisplay = (val: number, u: Units): number =>
  u === 'imperial' ? fToK(val) : cToK(val);
export const tempUnit = (u: Units): string => (u === 'imperial' ? '°F' : '°C');

// Pressure (Pa ↔ inHg / hPa)
export const pressureDisplay = (pa: number, u: Units): number =>
  u === 'imperial' ? paToInHg(pa) : pa / 100;
export const pressureFromDisplay = (val: number, u: Units): number =>
  u === 'imperial' ? inHgToPa(val) : val * 100;
export const pressureUnit = (u: Units): string => (u === 'imperial' ? 'inHg' : 'hPa');

// Altitude (m ↔ ft / m)
export const altitudeDisplay = (m: number, u: Units): number =>
  u === 'imperial' ? mToFt(m) : m;
export const altitudeFromDisplay = (val: number, u: Units): number =>
  u === 'imperial' ? ftToM(val) : val;
export const altitudeUnit = (u: Units): string => (u === 'imperial' ? 'ft' : 'm');
