import type { EnvConditions, ShotInput, ShotResult } from './types';
import { simulateFlight } from './flight';
import { radToDeg } from './units';

/**
 * Top-level entry: simulate a complete shot (flight + future bounce + roll) from launch
 * conditions and environment. M1 implements only the ball-launch mode and flight phase;
 * bounce + roll arrive in M5.
 */
export function simulateShot(input: ShotInput, env: EnvConditions): ShotResult {
  if (input.mode === 'delivery') {
    throw new Error(
      'Club Delivery mode requires the D-plane model (planned for M4). ' +
        'Use Ball Launch inputs for now.',
    );
  }

  const flight = simulateFlight(input, env);
  const land = flight.landingState;
  const horizSpeed = Math.sqrt(land.vel.x * land.vel.x + land.vel.z * land.vel.z);
  const descentAngleDeg = radToDeg(Math.atan2(-land.vel.y, horizSpeed));

  return {
    flight,
    firstBounce: null,
    rollPath: [],
    carryM: land.pos.x,
    totalM: land.pos.x,
    lateralM: land.pos.z,
    apexM: flight.apexM,
    descentAngleDeg,
    hangTimeS: flight.hangTimeS,
    derivedLaunch: input,
  };
}
