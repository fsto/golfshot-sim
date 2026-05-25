// Public API of the physics module. Everything inside src/physics/** is SI internally;
// callers should convert at the boundary using ./units.
export * from './types';
export { simulateShot } from './shot';
export { simulateFlight } from './flight';
export { airDensity, isaPressure } from './atmosphere';
export { cd, cl, reynoldsNumber, spinRatio } from './aero';
export { decaySpin, SPIN_DECAY_TAU_S } from './spin';
export * as units from './units';
export {
  G,
  BALL_MASS_KG,
  BALL_RADIUS_M,
  BALL_AREA_M2,
} from './constants';
