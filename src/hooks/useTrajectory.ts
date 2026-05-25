import { useMemo } from 'react';
import { useShotStore } from '../state/shotStore';
import { simulateShot } from '../physics/shot';
import type { ShotResult } from '../physics/types';

/**
 * Recomputes the full shot on any input/env change. A driver simulation runs in ~5 ms,
 * so direct synchronous recompute is fine; rAF-throttling would land in M7 if the 3D
 * scene + slider drag becomes janky with dispersion clouds.
 */
export function useTrajectory(): ShotResult {
  const mode = useShotStore((s) => s.mode);
  const launch = useShotStore((s) => s.launch);
  const delivery = useShotStore((s) => s.delivery);
  const env = useShotStore((s) => s.env);
  const input = mode === 'launch' ? launch : delivery;
  return useMemo(() => simulateShot(input, env), [input, env]);
}
