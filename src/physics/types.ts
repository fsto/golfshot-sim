// All units inside this module are SI (m, s, kg, K, Pa, rad/s).
// Conversion to/from imperial happens only at module boundaries via units.ts.

export type Vec3 = { x: number; y: number; z: number };

export type Surface = 'fairway' | 'rough' | 'green' | 'tee';

export type ClubId =
  | 'driver'
  | '3w'
  | '5w'
  | '3i'
  | '4i'
  | '5i'
  | '6i'
  | '7i'
  | '8i'
  | '9i'
  | 'pw'
  | 'gw'
  | 'sw'
  | 'lw';

export interface EnvConditions {
  tempK: number;          // K
  pressurePa: number;     // Pa
  humidityPct: number;    // 0..100 (relative humidity)
  altitudeM: number;      // m, above sea level — informs default pressure if needed
  windSpeedMps: number;   // m/s, magnitude
  windDirDeg: number;     // 0 = wind FROM 0° (north). Convention: heading the wind blows TOWARD = windDirDeg + 180. We use FROM here, standard meteorology.
  /** Ground material where the ball lands. Controls bounce/roll. */
  surface: Surface;
  coriolisLatDeg?: number | undefined; // optional latitude in degrees; if undefined, Coriolis is off
}

/** Mode A: pure ball-flight inputs (radar-style). */
export interface BallLaunchInput {
  mode: 'launch';
  ballSpeedMps: number;
  launchAngleDeg: number;     // vertical above horizontal
  azimuthDeg: number;         // horizontal start direction (+right, -left); 0 = down-target
  backspinRpm: number;        // spin magnitude
  spinAxisDeg: number;        // tilt of spin axis from pure backspin axis; +ve = ball curves right
}

/** Mode B: club-delivery inputs that derive ball-flight via D-plane + smash factor. */
export interface ClubDeliveryInput {
  mode: 'delivery';
  clubId: ClubId;
  clubSpeedMps: number;
  attackAngleDeg: number;
  clubPathDeg: number;     // +right, -left
  faceAngleDeg: number;    // absolute (vs target), +right open
  dynamicLoftDeg: number;
  strikeOffsetMm?: Vec3;   // future: gear effect; null/zero for centered strike
}

export type ShotInput = BallLaunchInput | ClubDeliveryInput;

/** Instantaneous ball state during flight. */
export interface BallState {
  pos: Vec3;       // m, world frame; y is vertical, x is down-target, z is lateral (+right)
  vel: Vec3;       // m/s
  spin: Vec3;      // rad/s, vector form (axis tilt encoded naturally)
  t: number;       // s, elapsed flight time
}

export interface Trajectory {
  samples: BallState[];
  apexM: number;
  hangTimeS: number;
  landingState: BallState;
}

export interface ShotResult {
  flight: Trajectory;
  /** Future: bounce + roll. For M1 these are null. */
  firstBounce: BallState | null;
  rollPath: Vec3[];
  carryM: number;
  totalM: number;          // carry + rollout (== carry when bounce/roll not yet implemented)
  lateralM: number;        // landing lateral offset
  apexM: number;
  descentAngleDeg: number;
  hangTimeS: number;
  /** When the input was Club Delivery, this is the derived ball launch. Else echoes input. */
  derivedLaunch: BallLaunchInput;
}

export interface ClubPreset {
  id: ClubId;
  label: string;
  /** Static loft on the club face (degrees). Informational; not used in calculations directly. */
  loftDeg: number;
  /** Efficiency factor: ballSpeed = clubSpeed × smashFactor. */
  smashFactor: number;
  /** Tour-average "neutral" delivery — the inputs that reproduce tourAvg ball-launch through the D-plane. */
  neutralDelivery: {
    clubSpeedMps: number;
    attackAngleDeg: number;
    clubPathDeg: number;
    faceAngleDeg: number;
    dynamicLoftDeg: number;
  };
  /** Tour-average ball-launch the neutral delivery produces; used for D-plane anchoring and calibration. */
  tourAvg: {
    ballSpeedMps: number;
    launchDeg: number;
    backspinRpm: number;
    carryM: number;
  };
}

export interface DispersionConfig {
  n: number;
  /** Standard deviation per input field (in the same units as the input). */
  sigmas: Record<string, number>;
  seed?: number;
}
