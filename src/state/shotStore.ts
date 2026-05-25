import { create } from 'zustand';
import type {
  BallLaunchInput,
  EnvConditions,
} from '../physics/types';
import { cToK, mphToMps } from '../physics/units';

export type InputMode = 'launch' | 'delivery';
export type Units = 'imperial' | 'metric';

interface ShotStore {
  mode: InputMode;
  units: Units;
  launch: BallLaunchInput;
  env: EnvConditions;
  setMode: (m: InputMode) => void;
  setUnits: (u: Units) => void;
  updateLaunch: (patch: Partial<BallLaunchInput>) => void;
  updateEnv: (patch: Partial<EnvConditions>) => void;
  reset: () => void;
}

const DEFAULT_LAUNCH: BallLaunchInput = {
  mode: 'launch',
  ballSpeedMps: mphToMps(167),
  launchAngleDeg: 10.9,
  azimuthDeg: 0,
  backspinRpm: 2685,
  spinAxisDeg: 0,
};

const DEFAULT_ENV: EnvConditions = {
  tempK: cToK(15),
  pressurePa: 101325,
  humidityPct: 0,
  altitudeM: 0,
  windSpeedMps: 0,
  windDirDeg: 0,
};

export const useShotStore = create<ShotStore>((set) => ({
  mode: 'launch',
  units: 'imperial',
  launch: DEFAULT_LAUNCH,
  env: DEFAULT_ENV,
  setMode: (mode) => set({ mode }),
  setUnits: (units) => set({ units }),
  updateLaunch: (patch) =>
    set((s) => ({ launch: { ...s.launch, ...patch, mode: 'launch' } })),
  updateEnv: (patch) => set((s) => ({ env: { ...s.env, ...patch } })),
  reset: () =>
    set({
      mode: 'launch',
      units: 'imperial',
      launch: DEFAULT_LAUNCH,
      env: DEFAULT_ENV,
    }),
}));
