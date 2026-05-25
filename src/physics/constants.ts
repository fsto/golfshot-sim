// Physical constants. All SI.

export const G = 9.80665; // m/s², standard gravity

// USGA-conforming golf ball
export const BALL_MASS_KG = 0.04593; // 45.93 g, USGA max
export const BALL_RADIUS_M = 0.021335; // 1.680 in / 2
export const BALL_AREA_M2 = Math.PI * BALL_RADIUS_M * BALL_RADIUS_M;

// Atmosphere: ISA + humidity
export const R_DRY = 287.058; // J/(kg·K), specific gas constant for dry air
export const R_VAPOR = 461.495; // J/(kg·K), specific gas constant for water vapor
export const T0_K = 288.15; // K, ISA sea-level temperature (15°C)
export const P0_PA = 101325; // Pa, ISA sea-level pressure
export const ISA_LAPSE_K_PER_M = 0.0065; // K/m, ISA troposphere lapse rate
export const KELVIN_OFFSET = 273.15;

// Earth
export const EARTH_OMEGA = 7.2921159e-5; // rad/s, sidereal rotation rate
