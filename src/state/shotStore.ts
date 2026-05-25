import { create } from 'zustand';
import type {
  BallLaunchInput,
  ClubDeliveryInput,
  ClubId,
  EnvConditions,
} from '../physics/types';
import { cToK, mphToMps } from '../physics/units';
import { CLUB_PRESETS } from '../presets/pgaPresets';

export type InputMode = 'launch' | 'delivery';
export type Units = 'imperial' | 'metric';

interface ShotStore {
  mode: InputMode;
  units: Units;
  launch: BallLaunchInput;
  delivery: ClubDeliveryInput;
  env: EnvConditions;
  setMode: (m: InputMode) => void;
  setUnits: (u: Units) => void;
  updateLaunch: (patch: Partial<BallLaunchInput>) => void;
  updateDelivery: (patch: Partial<ClubDeliveryInput>) => void;
  setClub: (id: ClubId) => void;
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

function deliveryFromPreset(id: ClubId): ClubDeliveryInput {
  const n = CLUB_PRESETS[id].neutralDelivery;
  return {
    mode: 'delivery',
    clubId: id,
    clubSpeedMps: n.clubSpeedMps,
    attackAngleDeg: n.attackAngleDeg,
    clubPathDeg: n.clubPathDeg,
    faceAngleDeg: n.faceAngleDeg,
    dynamicLoftDeg: n.dynamicLoftDeg,
  };
}

const DEFAULT_DELIVERY: ClubDeliveryInput = deliveryFromPreset('driver');

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
  delivery: DEFAULT_DELIVERY,
  env: DEFAULT_ENV,
  setMode: (mode) => set({ mode }),
  setUnits: (units) => set({ units }),
  updateLaunch: (patch) =>
    set((s) => ({ launch: { ...s.launch, ...patch, mode: 'launch' } })),
  updateDelivery: (patch) =>
    set((s) => ({ delivery: { ...s.delivery, ...patch, mode: 'delivery' } })),
  setClub: (id) => set({ delivery: deliveryFromPreset(id) }),
  updateEnv: (patch) => set((s) => ({ env: { ...s.env, ...patch } })),
  reset: () =>
    set({
      mode: 'launch',
      units: 'imperial',
      launch: DEFAULT_LAUNCH,
      delivery: DEFAULT_DELIVERY,
      env: DEFAULT_ENV,
    }),
}));
