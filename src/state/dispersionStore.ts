import { create } from 'zustand';
import { useShotStore } from './shotStore';
import type { DispersionResult, DispersionSigmas } from '../physics/dispersion';
import type { DispersionRequest, DispersionResponse } from '../workers/dispersion.worker';

interface DispersionStore {
  result: DispersionResult | null;
  running: boolean;
  error: string | null;
  run: (sigmas: DispersionSigmas, n: number, seed?: number) => void;
  clear: () => void;
}

let worker: Worker | null = null;

function ensureWorker(onMessage: (e: MessageEvent<DispersionResponse>) => void): Worker {
  if (worker) return worker;
  worker = new Worker(new URL('../workers/dispersion.worker.ts', import.meta.url), {
    type: 'module',
  });
  worker.addEventListener('message', onMessage);
  return worker;
}

export const useDispersionStore = create<DispersionStore>((set) => {
  const handleMessage = (e: MessageEvent<DispersionResponse>) => {
    if (e.data.type === 'result') {
      set({ result: e.data.result, running: false, error: null });
    } else {
      set({ result: null, running: false, error: e.data.message });
    }
  };

  return {
    result: null,
    running: false,
    error: null,

    run: (sigmas, n, seed = Date.now() & 0xffff) => {
      const { mode, launch, delivery, env } = useShotStore.getState();
      const input = mode === 'launch' ? launch : delivery;
      try {
        const w = ensureWorker(handleMessage);
        set({ running: true, error: null });
        const req: DispersionRequest = { input, env, sigmas, n, seed };
        w.postMessage(req);
      } catch (err) {
        set({
          running: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    },

    clear: () => set({ result: null, error: null }),
  };
});
