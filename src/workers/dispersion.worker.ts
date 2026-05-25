/// <reference lib="webworker" />

import { simulateDispersion, type DispersionSigmas, type DispersionResult } from '../physics/dispersion';
import type { EnvConditions, ShotInput } from '../physics/types';

export interface DispersionRequest {
  input: ShotInput;
  env: EnvConditions;
  sigmas: DispersionSigmas;
  n: number;
  seed: number;
}

export type DispersionResponse =
  | { type: 'result'; result: DispersionResult }
  | { type: 'error'; message: string };

self.addEventListener('message', (e: MessageEvent<DispersionRequest>) => {
  const { input, env, sigmas, n, seed } = e.data;
  try {
    const result = simulateDispersion(input, env, sigmas, n, seed);
    const message: DispersionResponse = { type: 'result', result };
    (self as unknown as Worker).postMessage(message);
  } catch (err) {
    const message: DispersionResponse = {
      type: 'error',
      message: err instanceof Error ? err.message : String(err),
    };
    (self as unknown as Worker).postMessage(message);
  }
});
