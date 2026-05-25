import { describe, expect, test, beforeEach } from 'vitest';
import { encodeShareState, decodeShareState, applyShareState } from './shareState';
import { useShotStore } from '../state/shotStore';

beforeEach(() => {
  useShotStore.getState().reset();
});

describe('share state', () => {
  test('encode → decode round-trip preserves all fields', () => {
    const store = useShotStore.getState();
    store.setMode('delivery');
    store.setUnits('metric');
    store.setClub('7i');
    store.updateDelivery({ faceAngleDeg: 2, attackAngleDeg: -3.5 });
    store.updateEnv({ windSpeedMps: 4, windDirDeg: 45, surface: 'green' });
    store.updateDispersion({ ballSpeedMps: 1.5, n: 200 });

    const hash = encodeShareState();
    expect(hash).toMatch(/^s=/);

    // Mutate the store to confirm decode actually restores
    store.reset();
    expect(useShotStore.getState().mode).toBe('launch');
    expect(useShotStore.getState().units).toBe('imperial');

    const parsed = decodeShareState(hash);
    expect(parsed).not.toBeNull();
    applyShareState(parsed!);

    const s = useShotStore.getState();
    expect(s.mode).toBe('delivery');
    expect(s.units).toBe('metric');
    expect(s.delivery.clubId).toBe('7i');
    expect(s.delivery.faceAngleDeg).toBe(2);
    expect(s.delivery.attackAngleDeg).toBe(-3.5);
    expect(s.env.windSpeedMps).toBe(4);
    expect(s.env.windDirDeg).toBe(45);
    expect(s.env.surface).toBe('green');
    expect(s.dispersion.n).toBe(200);
    expect(s.dispersion.ballSpeedMps).toBe(1.5);
  });

  test('decode returns null for empty or malformed hash', () => {
    expect(decodeShareState('')).toBeNull();
    expect(decodeShareState('#x=junk')).toBeNull();
    expect(decodeShareState('s=%%%')).toBeNull();
  });

  test('decode tolerates leading # and ?', () => {
    const hash = encodeShareState();
    expect(decodeShareState(`#${hash}`)).not.toBeNull();
    expect(decodeShareState(`?${hash}`)).not.toBeNull();
  });

  test('coriolisLatDeg survives the round-trip when set, and stays unset otherwise', () => {
    const store = useShotStore.getState();
    store.updateEnv({ coriolisLatDeg: 40 });
    const hash1 = encodeShareState();
    store.reset();
    applyShareState(decodeShareState(hash1)!);
    expect(useShotStore.getState().env.coriolisLatDeg).toBe(40);

    store.reset();
    const hash2 = encodeShareState();
    applyShareState(decodeShareState(hash2)!);
    expect(useShotStore.getState().env.coriolisLatDeg).toBeUndefined();
  });
});
