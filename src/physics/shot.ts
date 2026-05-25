import type { BallLaunchInput, EnvConditions, ShotInput, ShotResult } from './types';
import { simulateFlight } from './flight';
import { radToDeg } from './units';
import { clubToBall } from './dplane';
import { getPreset } from '../presets/pgaPresets';

/**
 * Top-level entry: simulate a complete shot (flight + future bounce + roll) from either
 * a pure ball-launch input or a club-delivery input (routed through the D-plane).
 * Bounce + roll arrive in M5.
 */
export function simulateShot(input: ShotInput, env: EnvConditions): ShotResult {
  const derivedLaunch: BallLaunchInput =
    input.mode === 'launch' ? input : clubToBall(input, getPreset(input.clubId));

  const flight = simulateFlight(derivedLaunch, env);
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
    derivedLaunch,
  };
}
