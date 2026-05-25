import { useMemo } from 'react';
import { useShotStore } from '../state/shotStore';
import { simulateShot } from '../physics/shot';
import type { ShotResult } from '../physics/types';

/**
 * Recomputes the full shot on any launch/env change. A driver simulation runs in ~5 ms,
 * so direct synchronous recompute is fine; we'll introduce rAF-throttling in M3 if the
 * 3D scene + slider drag becomes janky.
 */
export function useTrajectory(): ShotResult {
  const launch = useShotStore((s) => s.launch);
  const env = useShotStore((s) => s.env);
  return useMemo(() => simulateShot(launch, env), [launch, env]);
}
