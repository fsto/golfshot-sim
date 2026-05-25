import { describe, expect, test, beforeEach } from 'vitest';
import { useShotStore } from './shotStore';

describe('shotStore', () => {
  beforeEach(() => {
    useShotStore.getState().reset();
  });

  test('default mode is launch and units is imperial', () => {
    const s = useShotStore.getState();
    expect(s.mode).toBe('launch');
    expect(s.units).toBe('imperial');
  });

  test('default ball launch input is the Tour driver preset (SI values)', () => {
    const launch = useShotStore.getState().launch;
    // 167 mph ≈ 74.66 m/s
    expect(launch.ballSpeedMps).toBeCloseTo(74.66, 1);
    expect(launch.launchAngleDeg).toBe(10.9);
    expect(launch.azimuthDeg).toBe(0);
    expect(launch.backspinRpm).toBe(2685);
    expect(launch.spinAxisDeg).toBe(0);
  });

  test('default env is sea-level ISA dry', () => {
    const env = useShotStore.getState().env;
    expect(env.tempK).toBeCloseTo(288.15, 1);
    expect(env.pressurePa).toBe(101325);
    expect(env.humidityPct).toBe(0);
    expect(env.altitudeM).toBe(0);
    expect(env.windSpeedMps).toBe(0);
    expect(env.windDirDeg).toBe(0);
  });

  test('setUnits switches between imperial and metric', () => {
    const { setUnits } = useShotStore.getState();
    setUnits('metric');
    expect(useShotStore.getState().units).toBe('metric');
    setUnits('imperial');
    expect(useShotStore.getState().units).toBe('imperial');
  });

  test('updateLaunch merges partial updates', () => {
    const { updateLaunch } = useShotStore.getState();
    updateLaunch({ backspinRpm: 3000 });
    expect(useShotStore.getState().launch.backspinRpm).toBe(3000);
    // other fields unchanged
    expect(useShotStore.getState().launch.launchAngleDeg).toBe(10.9);
  });

  test('updateEnv merges partial updates', () => {
    const { updateEnv } = useShotStore.getState();
    updateEnv({ windSpeedMps: 5, windDirDeg: 90 });
    const env = useShotStore.getState().env;
    expect(env.windSpeedMps).toBe(5);
    expect(env.windDirDeg).toBe(90);
    expect(env.pressurePa).toBe(101325); // unchanged
  });

  test('reset returns all state to defaults', () => {
    const { updateLaunch, setUnits, reset } = useShotStore.getState();
    updateLaunch({ backspinRpm: 9999 });
    setUnits('metric');
    reset();
    expect(useShotStore.getState().launch.backspinRpm).toBe(2685);
    expect(useShotStore.getState().units).toBe('imperial');
  });

  test('default delivery is the driver neutral preset', () => {
    const d = useShotStore.getState().delivery;
    expect(d.mode).toBe('delivery');
    expect(d.clubId).toBe('driver');
    expect(d.dynamicLoftDeg).toBe(12.5);
    expect(d.attackAngleDeg).toBe(-1.3);
  });

  test('setClub replaces delivery with that preset\'s neutral inputs', () => {
    const { setClub } = useShotStore.getState();
    setClub('7i');
    const d = useShotStore.getState().delivery;
    expect(d.clubId).toBe('7i');
    expect(d.dynamicLoftDeg).toBe(24.7);
    expect(d.attackAngleDeg).toBe(-4.0);
  });

  test('updateDelivery merges patches and preserves clubId', () => {
    const { updateDelivery } = useShotStore.getState();
    updateDelivery({ faceAngleDeg: 3, clubPathDeg: -2 });
    const d = useShotStore.getState().delivery;
    expect(d.faceAngleDeg).toBe(3);
    expect(d.clubPathDeg).toBe(-2);
    expect(d.clubId).toBe('driver'); // unchanged
    expect(d.dynamicLoftDeg).toBe(12.5);
  });

  test('setMode toggles which input drives the shot', () => {
    const { setMode } = useShotStore.getState();
    expect(useShotStore.getState().mode).toBe('launch');
    setMode('delivery');
    expect(useShotStore.getState().mode).toBe('delivery');
  });
});
