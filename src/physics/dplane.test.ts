import { describe, expect, test } from 'vitest';
import { clubToBall } from './dplane';
import { CLUB_PRESETS } from '../presets/pgaPresets';
import type { ClubDeliveryInput } from './types';

const deliver = (over: Partial<ClubDeliveryInput> & { clubId: ClubDeliveryInput['clubId'] }): ClubDeliveryInput => {
  const preset = CLUB_PRESETS[over.clubId];
  const n = preset.neutralDelivery;
  return {
    mode: 'delivery',
    clubId: over.clubId,
    clubSpeedMps: over.clubSpeedMps ?? n.clubSpeedMps,
    attackAngleDeg: over.attackAngleDeg ?? n.attackAngleDeg,
    clubPathDeg: over.clubPathDeg ?? n.clubPathDeg,
    faceAngleDeg: over.faceAngleDeg ?? n.faceAngleDeg,
    dynamicLoftDeg: over.dynamicLoftDeg ?? n.dynamicLoftDeg,
  };
};

describe('clubToBall (D-plane)', () => {
  test('neutral delivery reproduces tour-avg ball launch for every preset', () => {
    for (const id of ['driver', '7i', 'pw'] as const) {
      const preset = CLUB_PRESETS[id];
      const ball = clubToBall(deliver({ clubId: id }), preset);
      expect(ball.mode).toBe('launch');
      expect(ball.ballSpeedMps).toBeCloseTo(preset.tourAvg.ballSpeedMps, 2);
      expect(ball.launchAngleDeg).toBeCloseTo(preset.tourAvg.launchDeg, 6);
      expect(ball.backspinRpm).toBeCloseTo(preset.tourAvg.backspinRpm, 0);
      expect(ball.azimuthDeg).toBe(0);
      expect(ball.spinAxisDeg).toBe(0);
    }
  });

  test('ballSpeed scales linearly with clubSpeed', () => {
    const preset = CLUB_PRESETS.driver;
    const base = clubToBall(deliver({ clubId: 'driver' }), preset);
    const faster = clubToBall(
      deliver({ clubId: 'driver', clubSpeedMps: preset.neutralDelivery.clubSpeedMps + 5 }),
      preset,
    );
    expect(faster.ballSpeedMps - base.ballSpeedMps).toBeCloseTo(5 * preset.smashFactor, 6);
  });

  test('face angle dominates start direction (~85%)', () => {
    const preset = CLUB_PRESETS.driver;
    const ball = clubToBall(
      deliver({ clubId: 'driver', faceAngleDeg: 5, clubPathDeg: 0 }),
      preset,
    );
    // 0.85 × 5 + 0.15 × 0 = 4.25°
    expect(ball.azimuthDeg).toBeCloseTo(4.25, 3);
  });

  test('club path contributes 15% to start direction', () => {
    const preset = CLUB_PRESETS.driver;
    const ball = clubToBall(
      deliver({ clubId: 'driver', faceAngleDeg: 0, clubPathDeg: 5 }),
      preset,
    );
    expect(ball.azimuthDeg).toBeCloseTo(0.75, 3);
  });

  test('spin axis = face minus path', () => {
    const preset = CLUB_PRESETS.driver;
    // Open face vs path → fade (positive axis, ball curves right)
    const fade = clubToBall(
      deliver({ clubId: 'driver', faceAngleDeg: 2, clubPathDeg: -2 }),
      preset,
    );
    expect(fade.spinAxisDeg).toBeCloseTo(4, 3);
    // Closed face vs path → draw (negative axis)
    const draw = clubToBall(
      deliver({ clubId: 'driver', faceAngleDeg: -2, clubPathDeg: 2 }),
      preset,
    );
    expect(draw.spinAxisDeg).toBeCloseTo(-4, 3);
  });

  test('higher dynamic loft → higher launch angle', () => {
    const preset = CLUB_PRESETS.driver;
    const base = clubToBall(deliver({ clubId: 'driver' }), preset);
    const lofted = clubToBall(
      deliver({ clubId: 'driver', dynamicLoftDeg: preset.neutralDelivery.dynamicLoftDeg + 3 }),
      preset,
    );
    expect(lofted.launchAngleDeg).toBeGreaterThan(base.launchAngleDeg + 2);
  });

  test('more positive attack angle → higher launch (small but measurable)', () => {
    const preset = CLUB_PRESETS.driver;
    const downward = clubToBall(deliver({ clubId: 'driver', attackAngleDeg: -3 }), preset);
    const upward = clubToBall(deliver({ clubId: 'driver', attackAngleDeg: 3 }), preset);
    expect(upward.launchAngleDeg).toBeGreaterThan(downward.launchAngleDeg);
  });

  test('more spin loft → more backspin', () => {
    const preset = CLUB_PRESETS['7i'];
    const base = clubToBall(deliver({ clubId: '7i' }), preset);
    const moreSpinLoft = clubToBall(
      deliver({ clubId: '7i', dynamicLoftDeg: preset.neutralDelivery.dynamicLoftDeg + 4 }),
      preset,
    );
    expect(moreSpinLoft.backspinRpm).toBeGreaterThan(base.backspinRpm + 300);
  });

  test('backspin grows with ball speed (faster swing, more spin)', () => {
    const preset = CLUB_PRESETS['7i'];
    const slow = clubToBall(
      deliver({ clubId: '7i', clubSpeedMps: preset.neutralDelivery.clubSpeedMps - 5 }),
      preset,
    );
    const fast = clubToBall(
      deliver({ clubId: '7i', clubSpeedMps: preset.neutralDelivery.clubSpeedMps + 5 }),
      preset,
    );
    expect(fast.backspinRpm).toBeGreaterThan(slow.backspinRpm);
  });
});
