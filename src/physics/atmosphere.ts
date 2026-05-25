import {
  ISA_LAPSE_K_PER_M, P0_PA, R_DRY, R_VAPOR, T0_K, G,
} from './constants';
import { kToC } from './units';
import type { EnvConditions } from './types';

/**
 * Saturation vapor pressure of water (Pa) via Arden Buck (1996) over liquid water.
 * Accurate to within ~0.1% from -40°C to +50°C.
 */
function saturationVaporPressure(tempK: number): number {
  const tC = kToC(tempK);
  return 611.21 * Math.exp((18.678 - tC / 234.5) * (tC / (257.14 + tC)));
}

/**
 * Air density (kg/m³) from temperature, total pressure, and relative humidity.
 * ρ = p_d / (R_d T) + p_v / (R_v T)
 * where p_v = (RH/100) · e_s(T), p_d = p - p_v.
 */
export function airDensity(env: EnvConditions): number {
  const { tempK, pressurePa, humidityPct } = env;
  const pv = (Math.max(0, Math.min(100, humidityPct)) / 100) * saturationVaporPressure(tempK);
  const pd = pressurePa - pv;
  return pd / (R_DRY * tempK) + pv / (R_VAPOR * tempK);
}

/**
 * ISA pressure at altitude h (m), troposphere model.
 * p(h) = p0 · (1 − Lh/T0)^(g/(R·L))
 */
export function isaPressure(altitudeM: number): number {
  return P0_PA * Math.pow(1 - (ISA_LAPSE_K_PER_M * altitudeM) / T0_K, G / (R_DRY * ISA_LAPSE_K_PER_M));
}
