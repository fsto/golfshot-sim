import { describe, expect, test, beforeEach } from 'vitest';
import { useHistoryStore, MAX_HISTORY } from './historyStore';
import type { ShotResult } from '../physics/types';

const fakeResult = (carryM = 250): ShotResult => ({
  flight: { samples: [], apexM: 30, hangTimeS: 6, landingState: { pos: { x: carryM, y: 0, z: 0 }, vel: { x: 0, y: 0, z: 0 }, spin: { x: 0, y: 0, z: 0 }, t: 6 } },
  firstBounce: null,
  rollPath: [],
  carryM,
  totalM: carryM + 20,
  lateralM: 0,
  apexM: 30,
  descentAngleDeg: 40,
  hangTimeS: 6,
  derivedLaunch: { mode: 'launch', ballSpeedMps: 70, launchAngleDeg: 11, azimuthDeg: 0, backspinRpm: 2685, spinAxisDeg: 0 },
});

describe('historyStore', () => {
  beforeEach(() => useHistoryStore.getState().clear());

  test('starts empty', () => {
    expect(useHistoryStore.getState().shots).toEqual([]);
  });

  test('save adds a shot with id, label, color, and the result', () => {
    useHistoryStore.getState().save(fakeResult(275), 'Driver');
    const shots = useHistoryStore.getState().shots;
    expect(shots).toHaveLength(1);
    expect(shots[0]!.label).toBe('Driver');
    expect(shots[0]!.id).toBeTruthy();
    expect(shots[0]!.color).toMatch(/^#/);
    expect(shots[0]!.result.carryM).toBe(275);
  });

  test('saves are ordered newest first', () => {
    useHistoryStore.getState().save(fakeResult(200), 'First');
    useHistoryStore.getState().save(fakeResult(220), 'Second');
    useHistoryStore.getState().save(fakeResult(240), 'Third');
    const labels = useHistoryStore.getState().shots.map((s) => s.label);
    expect(labels).toEqual(['Third', 'Second', 'First']);
  });

  test('shots cycle through a palette of distinct colors', () => {
    useHistoryStore.getState().save(fakeResult(), 'A');
    useHistoryStore.getState().save(fakeResult(), 'B');
    useHistoryStore.getState().save(fakeResult(), 'C');
    const colors = useHistoryStore.getState().shots.map((s) => s.color);
    expect(new Set(colors).size).toBe(3);
  });

  test('cap at MAX_HISTORY (drop oldest)', () => {
    for (let i = 0; i < MAX_HISTORY + 5; i++) {
      useHistoryStore.getState().save(fakeResult(100 + i), `Shot ${i}`);
    }
    const shots = useHistoryStore.getState().shots;
    expect(shots).toHaveLength(MAX_HISTORY);
    // newest first: most recent label survives at index 0
    expect(shots[0]!.label).toBe(`Shot ${MAX_HISTORY + 4}`);
    // oldest (Shot 0) was dropped
    expect(shots.find((s) => s.label === 'Shot 0')).toBeUndefined();
  });

  test('remove deletes a specific shot by id', () => {
    useHistoryStore.getState().save(fakeResult(200), 'A');
    useHistoryStore.getState().save(fakeResult(220), 'B');
    const idB = useHistoryStore.getState().shots[0]!.id;
    useHistoryStore.getState().remove(idB);
    const remaining = useHistoryStore.getState().shots;
    expect(remaining).toHaveLength(1);
    expect(remaining[0]!.label).toBe('A');
  });

  test('clear empties the list', () => {
    useHistoryStore.getState().save(fakeResult(), 'X');
    useHistoryStore.getState().save(fakeResult(), 'Y');
    useHistoryStore.getState().clear();
    expect(useHistoryStore.getState().shots).toEqual([]);
  });
});
