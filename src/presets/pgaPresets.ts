import type { ClubId, ClubPreset } from '../physics/types';
import { mphToMps } from '../physics/units';

/**
 * PGA Tour averages, anchored from Trackman ShotLink publications.
 * Each preset is a self-consistent set: neutral delivery × smash factor
 * reproduces the tour-average ball launch (the D-plane returns these
 * values exactly at neutral delivery).
 */
export const CLUB_PRESETS: Record<ClubId, ClubPreset> = {
  driver: {
    id: 'driver',
    label: 'Driver',
    loftDeg: 10.5,
    smashFactor: 1.49,
    neutralDelivery: {
      clubSpeedMps: mphToMps(112.08),  // 167 / 1.49
      attackAngleDeg: -1.3,
      clubPathDeg: 0,
      faceAngleDeg: 0,
      dynamicLoftDeg: 12.5,
    },
    tourAvg: {
      ballSpeedMps: mphToMps(167),
      launchDeg: 10.9,
      backspinRpm: 2685,
      carryM: 251.46,                 // 275 yd
    },
  },
  '3w': {
    id: '3w',
    label: '3 Wood',
    loftDeg: 15,
    smashFactor: 1.46,
    neutralDelivery: {
      clubSpeedMps: mphToMps(108.0),
      attackAngleDeg: -2.9,
      clubPathDeg: 0,
      faceAngleDeg: 0,
      dynamicLoftDeg: 14.5,
    },
    tourAvg: {
      ballSpeedMps: mphToMps(157.7),
      launchDeg: 11.1,
      backspinRpm: 3655,
      carryM: 222.20,                 // 243 yd
    },
  },
  '5w': {
    id: '5w',
    label: '5 Wood',
    loftDeg: 18,
    smashFactor: 1.45,
    neutralDelivery: {
      clubSpeedMps: mphToMps(105.0),
      attackAngleDeg: -3.3,
      clubPathDeg: 0,
      faceAngleDeg: 0,
      dynamicLoftDeg: 17.0,
    },
    tourAvg: {
      ballSpeedMps: mphToMps(152.3),
      launchDeg: 12.1,
      backspinRpm: 4350,
      carryM: 210.31,                 // 230 yd
    },
  },
  '3i': {
    id: '3i',
    label: '3 Iron',
    loftDeg: 20,
    smashFactor: 1.45,
    neutralDelivery: {
      clubSpeedMps: mphToMps(100.0),
      attackAngleDeg: -1.5,
      clubPathDeg: 0,
      faceAngleDeg: 0,
      dynamicLoftDeg: 19.0,
    },
    tourAvg: {
      ballSpeedMps: mphToMps(145.0),
      launchDeg: 14.0,
      backspinRpm: 4437,
      carryM: 196.60,                 // 215 yd
    },
  },
  '4i': {
    id: '4i',
    label: '4 Iron',
    loftDeg: 23,
    smashFactor: 1.43,
    neutralDelivery: {
      clubSpeedMps: mphToMps(99.0),
      attackAngleDeg: -3.5,
      clubPathDeg: 0,
      faceAngleDeg: 0,
      dynamicLoftDeg: 19.5,
    },
    tourAvg: {
      ballSpeedMps: mphToMps(141.6),
      launchDeg: 14.8,
      backspinRpm: 4630,
      carryM: 185.62,                 // 203 yd
    },
  },
  '5i': {
    id: '5i',
    label: '5 Iron',
    loftDeg: 26,
    smashFactor: 1.41,
    neutralDelivery: {
      clubSpeedMps: mphToMps(96.0),
      attackAngleDeg: -3.4,
      clubPathDeg: 0,
      faceAngleDeg: 0,
      dynamicLoftDeg: 21.0,
    },
    tourAvg: {
      ballSpeedMps: mphToMps(135.4),
      launchDeg: 16.3,
      backspinRpm: 5361,
      carryM: 177.39,                 // 194 yd
    },
  },
  '6i': {
    id: '6i',
    label: '6 Iron',
    loftDeg: 30,
    smashFactor: 1.38,
    neutralDelivery: {
      clubSpeedMps: mphToMps(92.0),
      attackAngleDeg: -3.7,
      clubPathDeg: 0,
      faceAngleDeg: 0,
      dynamicLoftDeg: 22.5,
    },
    tourAvg: {
      ballSpeedMps: mphToMps(127.0),
      launchDeg: 17.1,
      backspinRpm: 6231,
      carryM: 167.34,                 // 183 yd
    },
  },
  '7i': {
    id: '7i',
    label: '7 Iron',
    loftDeg: 34,
    smashFactor: 1.337,
    neutralDelivery: {
      clubSpeedMps: mphToMps(89.0),
      attackAngleDeg: -4.0,
      clubPathDeg: 0,
      faceAngleDeg: 0,
      dynamicLoftDeg: 24.7,
    },
    tourAvg: {
      ballSpeedMps: mphToMps(119.0),
      launchDeg: 19.4,
      backspinRpm: 7097,
      carryM: 157.28,                 // 172 yd
    },
  },
  '8i': {
    id: '8i',
    label: '8 Iron',
    loftDeg: 38,
    smashFactor: 1.337,
    neutralDelivery: {
      clubSpeedMps: mphToMps(86.0),
      attackAngleDeg: -4.3,
      clubPathDeg: 0,
      faceAngleDeg: 0,
      dynamicLoftDeg: 28.0,
    },
    tourAvg: {
      ballSpeedMps: mphToMps(115.0),
      launchDeg: 20.8,
      backspinRpm: 7998,
      carryM: 146.30,                 // 160 yd
    },
  },
  '9i': {
    id: '9i',
    label: '9 Iron',
    loftDeg: 42,
    smashFactor: 1.313,
    neutralDelivery: {
      clubSpeedMps: mphToMps(83.0),
      attackAngleDeg: -4.7,
      clubPathDeg: 0,
      faceAngleDeg: 0,
      dynamicLoftDeg: 29.8,
    },
    tourAvg: {
      ballSpeedMps: mphToMps(109.0),
      launchDeg: 24.0,
      backspinRpm: 8647,
      carryM: 135.33,                 // 148 yd
    },
  },
  pw: {
    id: 'pw',
    label: 'Pitching Wedge',
    loftDeg: 46,
    smashFactor: 1.275,
    neutralDelivery: {
      clubSpeedMps: mphToMps(80.0),
      attackAngleDeg: -5.0,
      clubPathDeg: 0,
      faceAngleDeg: 0,
      dynamicLoftDeg: 31.6,
    },
    tourAvg: {
      ballSpeedMps: mphToMps(102.0),
      launchDeg: 24.2,
      backspinRpm: 9304,
      carryM: 124.36,                 // 136 yd
    },
  },
  gw: {
    id: 'gw',
    label: 'Gap Wedge',
    loftDeg: 50,
    smashFactor: 1.23,
    neutralDelivery: {
      clubSpeedMps: mphToMps(76.0),
      attackAngleDeg: -5.0,
      clubPathDeg: 0,
      faceAngleDeg: 0,
      dynamicLoftDeg: 35,
    },
    tourAvg: {
      ballSpeedMps: mphToMps(93.5),
      launchDeg: 26.5,
      backspinRpm: 9800,
      carryM: 109.7,                  // 120 yd
    },
  },
  sw: {
    id: 'sw',
    label: 'Sand Wedge',
    loftDeg: 56,
    smashFactor: 1.18,
    neutralDelivery: {
      clubSpeedMps: mphToMps(72.0),
      attackAngleDeg: -5.5,
      clubPathDeg: 0,
      faceAngleDeg: 0,
      dynamicLoftDeg: 41,
    },
    tourAvg: {
      ballSpeedMps: mphToMps(85.0),
      launchDeg: 30.0,
      backspinRpm: 10500,
      carryM: 91.4,                   // 100 yd
    },
  },
  lw: {
    id: 'lw',
    label: 'Lob Wedge',
    loftDeg: 60,
    smashFactor: 1.14,
    neutralDelivery: {
      clubSpeedMps: mphToMps(68.0),
      attackAngleDeg: -6.0,
      clubPathDeg: 0,
      faceAngleDeg: 0,
      dynamicLoftDeg: 46,
    },
    tourAvg: {
      ballSpeedMps: mphToMps(77.5),
      launchDeg: 33.0,
      backspinRpm: 11000,
      carryM: 73.2,                   // 80 yd
    },
  },
};

export const presetList: ClubPreset[] = [
  CLUB_PRESETS.driver,
  CLUB_PRESETS['3w'],
  CLUB_PRESETS['5w'],
  CLUB_PRESETS['3i'],
  CLUB_PRESETS['4i'],
  CLUB_PRESETS['5i'],
  CLUB_PRESETS['6i'],
  CLUB_PRESETS['7i'],
  CLUB_PRESETS['8i'],
  CLUB_PRESETS['9i'],
  CLUB_PRESETS.pw,
];

export function getPreset(id: ClubId): ClubPreset {
  return CLUB_PRESETS[id];
}
