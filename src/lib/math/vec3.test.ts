import { describe, expect, test } from 'vitest';
import { add, sub, scale, dot, cross, norm, normalize, ZERO } from './vec3';

describe('vec3', () => {
  test('add', () => {
    expect(add({ x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 })).toEqual({ x: 5, y: 7, z: 9 });
  });

  test('sub', () => {
    expect(sub({ x: 4, y: 5, z: 6 }, { x: 1, y: 2, z: 3 })).toEqual({ x: 3, y: 3, z: 3 });
  });

  test('scale', () => {
    expect(scale({ x: 1, y: 2, z: 3 }, 2)).toEqual({ x: 2, y: 4, z: 6 });
  });

  test('dot', () => {
    expect(dot({ x: 1, y: 2, z: 3 }, { x: 4, y: -5, z: 6 })).toBe(12);
  });

  test('cross right-handed: x × y = z', () => {
    expect(cross({ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 })).toEqual({ x: 0, y: 0, z: 1 });
  });

  test('norm', () => {
    expect(norm({ x: 3, y: 4, z: 0 })).toBe(5);
  });

  test('normalize zero vector → zero', () => {
    expect(normalize(ZERO)).toEqual(ZERO);
  });

  test('normalize unit length', () => {
    const n = normalize({ x: 3, y: 4, z: 0 });
    expect(Math.abs(norm(n) - 1)).toBeLessThan(1e-12);
  });
});
