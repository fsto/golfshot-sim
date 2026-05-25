import type { BallLaunchInput, EnvConditions, ShotInput, ShotResult, Vec3 } from './types';
import { simulateFlight, simulateFlightFromState } from './flight';
import { radToDeg } from './units';
import { clubToBall } from './dplane';
import { getPreset } from '../presets/pgaPresets';
import { bounceImpact } from './bounce';
import { simulateRoll } from './roll';

const MAX_BOUNCES = 6;
const MIN_BOUNCE_VY = 0.5;   // m/s — below this we treat post-bounce as a roll-only continuation

/**
 * Top-level entry: simulate a complete shot (flight + bounce + roll) from either a pure
 * ball-launch input or a club-delivery input (routed through the D-plane).
 */
export function simulateShot(input: ShotInput, env: EnvConditions): ShotResult {
  const derivedLaunch: BallLaunchInput =
    input.mode === 'launch' ? input : clubToBall(input, getPreset(input.clubId));

  // 1. Primary flight from tee to first ground contact
  const flight = simulateFlight(derivedLaunch, env);
  const land = flight.landingState;
  const horizSpeed = Math.sqrt(land.vel.x * land.vel.x + land.vel.z * land.vel.z);
  const descentAngleDeg = radToDeg(Math.atan2(-land.vel.y, horizSpeed));

  // 2. Bounce loop — first bounce, then secondary flights and bounces until vy is small
  const surface = env.surface;
  const groundPath: Vec3[] = [];
  let state = land;
  let firstBounce = null as ShotResult['firstBounce'];

  for (let i = 0; i < MAX_BOUNCES; i++) {
    state = bounceImpact(state, surface);
    if (i === 0) firstBounce = state;
    groundPath.push({ ...state.pos });
    if (state.vel.y < MIN_BOUNCE_VY) break;
    // Secondary flight — short arc until the ball touches down again
    const arc = simulateFlightFromState(state, env);
    // Append every ~10th sample of the arc so the side-profile shows the bounce shape
    for (let j = 0; j < arc.samples.length; j += 10) {
      groundPath.push({ ...arc.samples[j]!.pos });
    }
    state = arc.landingState;
    groundPath.push({ ...state.pos });
  }

  // 3. Roll until the ball stops
  const roll = simulateRoll(state, surface);
  for (const s of roll.samples) groundPath.push({ ...s.pos });
  const finalState = roll.samples[roll.samples.length - 1] ?? state;

  return {
    flight,
    firstBounce,
    rollPath: groundPath,
    carryM: land.pos.x,
    totalM: finalState.pos.x,
    lateralM: finalState.pos.z,
    apexM: flight.apexM,
    descentAngleDeg,
    hangTimeS: flight.hangTimeS,
    derivedLaunch,
  };
}
