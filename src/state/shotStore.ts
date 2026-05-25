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

/** Dispersion configuration: per-field σ in input-field units, plus N and seed. */
export interface DispersionConfig {
  // Launch-mode sigmas
  ballSpeedMps: number;
  launchAngleDeg: number;
  azimuthDeg: number;
  backspinRpm: number;
  spinAxisDeg: number;
  // Delivery-mode sigmas
  clubSpeedMps: number;
  attackAngleDeg: number;
  clubPathDeg: number;
  faceAngleDeg: number;
  // Common
  n: number;
  seed: number;
}

const DEFAULT_DISPERSION: DispersionConfig = {
  ballSpeedMps: 1.0,
  launchAngleDeg: 0.5,
  azimuthDeg: 0.5,
  backspinRpm: 150,
  spinAxisDeg: 3,
  clubSpeedMps: 1.0,
  attackAngleDeg: 0.5,
  clubPathDeg: 1.0,
  faceAngleDeg: 1.0,
  n: 100,
  seed: 1,
};

interface ShotStore {
  mode: InputMode;
  units: Units;
  launch: BallLaunchInput;
  delivery: ClubDeliveryInput;
  env: EnvConditions;
  dispersion: DispersionConfig;
  setMode: (m: InputMode) => void;
  setUnits: (u: Units) => void;
  updateLaunch: (patch: Partial<BallLaunchInput>) => void;
  updateDelivery: (patch: Partial<ClubDeliveryInput>) => void;
  setClub: (id: ClubId) => void;
  updateEnv: (patch: Partial<EnvConditions>) => void;
  updateDispersion: (patch: Partial<DispersionConfig>) => void;
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
  surface: 'fairway',
};

export const useShotStore = create<ShotStore>((set) => ({
  mode: 'delivery',
  units: 'imperial',
  launch: DEFAULT_LAUNCH,
  delivery: DEFAULT_DELIVERY,
  env: DEFAULT_ENV,
  dispersion: DEFAULT_DISPERSION,
  setMode: (mode) => set({ mode }),
  setUnits: (units) => set({ units }),
  updateLaunch: (patch) =>
    set((s) => ({ launch: { ...s.launch, ...patch, mode: 'launch' } })),
  updateDelivery: (patch) =>
    set((s) => ({ delivery: { ...s.delivery, ...patch, mode: 'delivery' } })),
  setClub: (id) => set({ delivery: deliveryFromPreset(id) }),
  updateEnv: (patch) =>
    set((s) => {
      const next = { ...s.env, ...patch };
      // Allow explicit undefined to remove the optional Coriolis latitude
      if ('coriolisLatDeg' in patch && patch.coriolisLatDeg === undefined) {
        delete next.coriolisLatDeg;
      }
      return { env: next };
    }),
  updateDispersion: (patch) =>
    set((s) => ({ dispersion: { ...s.dispersion, ...patch } })),
  reset: () =>
    set({
      mode: 'delivery',
      units: 'imperial',
      launch: DEFAULT_LAUNCH,
      delivery: DEFAULT_DELIVERY,
      env: DEFAULT_ENV,
      dispersion: DEFAULT_DISPERSION,
    }),
}));
