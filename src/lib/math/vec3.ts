import type { Vec3 } from '../../physics/types';

export const ZERO: Vec3 = { x: 0, y: 0, z: 0 };

export const v = (x: number, y: number, z: number): Vec3 => ({ x, y, z });

export const add = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
export const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
export const scale = (a: Vec3, s: number): Vec3 => ({ x: a.x * s, y: a.y * s, z: a.z * s });
export const dot = (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z;
export const cross = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});
export const norm = (a: Vec3): number => Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
export const normalize = (a: Vec3): Vec3 => {
  const n = norm(a);
  return n === 0 ? ZERO : scale(a, 1 / n);
};

/** Linear combination: s_a · a + s_b · b. Avoids allocating intermediates. */
export const lincomb2 = (a: Vec3, sa: number, b: Vec3, sb: number): Vec3 => ({
  x: a.x * sa + b.x * sb,
  y: a.y * sa + b.y * sb,
  z: a.z * sa + b.z * sb,
});
