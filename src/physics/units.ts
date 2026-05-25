import { KELVIN_OFFSET } from './constants';

// Speed
export const mphToMps = (mph: number): number => mph * 0.44704;
export const mpsToMph = (mps: number): number => mps / 0.44704;

// Distance
export const ydToM = (yd: number): number => yd * 0.9144;
export const mToYd = (m: number): number => m / 0.9144;
export const ftToM = (ft: number): number => ft * 0.3048;
export const mToFt = (m: number): number => m / 0.3048;

// Angular
export const rpmToRads = (rpm: number): number => (rpm * 2 * Math.PI) / 60;
export const radsToRpm = (rads: number): number => (rads * 60) / (2 * Math.PI);
export const degToRad = (deg: number): number => (deg * Math.PI) / 180;
export const radToDeg = (rad: number): number => (rad * 180) / Math.PI;

// Temperature
export const cToK = (c: number): number => c + KELVIN_OFFSET;
export const kToC = (k: number): number => k - KELVIN_OFFSET;
export const fToK = (f: number): number => ((f - 32) * 5) / 9 + KELVIN_OFFSET;
export const kToF = (k: number): number => ((k - KELVIN_OFFSET) * 9) / 5 + 32;

// Pressure
// 1 inHg = 3386.389 Pa
export const inHgToPa = (inHg: number): number => inHg * 3386.389;
export const paToInHg = (pa: number): number => pa / 3386.389;
