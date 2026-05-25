import { describe, expect, test } from 'vitest';
import { gravityAccel, aeroAccel, bodyAccel, type AeroContext } from './forces';
import { G } from './constants';
import { ZERO } from '../lib/math/vec3';
import type { KinState } from './integrator';

const stillAir: AeroContext = { rho: 1.225, wind: ZERO };

const state = (vel: { x: number; y: number; z: number }, spin = ZERO): KinState => ({
  pos: { x: 0, y: 1, z: 0 },
  vel,
  spin,
  t: 0,
});

describe('forces', () => {
  test('gravityAccel = (0, -G, 0)', () => {
    expect(gravityAccel()).toEqual({ x: 0, y: -G, z: 0 });
  });

  test('aeroAccel in vacuum (ρ=0) is zero', () => {
    const a = aeroAccel(state({ x: 50, y: 0, z: 0 }), { rho: 0, wind: ZERO });
    expect(a).toEqual(ZERO);
  });

  test('drag opposes motion (no-spin ball)', () => {
    const a = aeroAccel(state({ x: 50, y: 0, z: 0 }), stillAir);
    expect(a.x).toBeLessThan(0);
    expect(Math.abs(a.y)).toBeLessThan(1e-12);
    expect(Math.abs(a.z)).toBeLessThan(1e-12);
  });

  test('drag scales with v² (no spin)', () => {
    const a1 = aeroAccel(state({ x: 50, y: 0, z: 0 }), stillAir);
    const a2 = aeroAccel(state({ x: 100, y: 0, z: 0 }), stillAir);
    expect(Math.abs(a2.x) / Math.abs(a1.x)).toBeCloseTo(4, 1);
  });

  test('pure backspin produces upward Magnus lift', () => {
    // backspin axis = +z, ball moving +x; Magnus = ω × v̂ → +y
    const a = aeroAccel(
      state({ x: 70, y: 0, z: 0 }, { x: 0, y: 0, z: 300 }),
      stillAir,
    );
    expect(a.y).toBeGreaterThan(0);
    expect(Math.abs(a.z)).toBeLessThan(1e-6);
  });

  test('spin-axis tilt right produces rightward Magnus (slice)', () => {
    // spin tilted toward -y (slicer): ω = (0, -sinθ, cosθ)·|ω|
    const omega = 300;
    const theta = Math.PI / 6; // 30°
    const a = aeroAccel(
      state(
        { x: 70, y: 0, z: 0 },
        { x: 0, y: -omega * Math.sin(theta), z: omega * Math.cos(theta) },
      ),
      stillAir,
    );
    expect(a.z).toBeGreaterThan(0);    // pushed right
    expect(a.y).toBeGreaterThan(0);    // still some lift
  });

  test('bodyAccel = aero + gravity', () => {
    const s = state({ x: 70, y: 0, z: 0 }, { x: 0, y: 0, z: 300 });
    const aero = aeroAccel(s, stillAir);
    const total = bodyAccel(s, stillAir);
    expect(total.x).toBeCloseTo(aero.x, 9);
    expect(total.y).toBeCloseTo(aero.y - G, 9);
    expect(total.z).toBeCloseTo(aero.z, 9);
  });

  test('wind: headwind increases relative speed → larger drag', () => {
    const noWind: AeroContext = { rho: 1.225, wind: ZERO };
    const headWind: AeroContext = { rho: 1.225, wind: { x: -5, y: 0, z: 0 } }; // 5 m/s blowing in -x
    const sNoWind = aeroAccel(state({ x: 50, y: 0, z: 0 }), noWind);
    const sHead = aeroAccel(state({ x: 50, y: 0, z: 0 }), headWind);
    expect(Math.abs(sHead.x)).toBeGreaterThan(Math.abs(sNoWind.x));
  });
});
