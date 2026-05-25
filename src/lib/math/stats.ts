export function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
}

export interface Cov2D {
  /** var(x) */
  sxx: number;
  /** var(z) */
  szz: number;
  /** cov(x, z) */
  sxz: number;
}

/** Population covariance of a set of 2D points in the (x, z) ground plane. */
export function covariance2D(points: Array<{ x: number; z: number }>): Cov2D {
  if (points.length === 0) return { sxx: 0, szz: 0, sxz: 0 };
  let mx = 0;
  let mz = 0;
  for (const p of points) {
    mx += p.x;
    mz += p.z;
  }
  mx /= points.length;
  mz /= points.length;
  let sxx = 0;
  let szz = 0;
  let sxz = 0;
  for (const p of points) {
    const dx = p.x - mx;
    const dz = p.z - mz;
    sxx += dx * dx;
    szz += dz * dz;
    sxz += dx * dz;
  }
  return { sxx: sxx / points.length, szz: szz / points.length, sxz: sxz / points.length };
}

export interface Ellipse {
  /** Semi-major axis length. */
  semiMajor: number;
  /** Semi-minor axis length. */
  semiMinor: number;
  /** Rotation of the major axis, radians, measured from +x toward +z. */
  angleRad: number;
}

/**
 * 95% confidence ellipse for a 2D normal: eigendecompose the cov matrix and scale axes
 * by √χ²₀.₀₅,₂ = √5.991. For a 1σ confidence interval, the scale would be 1 instead.
 */
const CHI2_95_2DOF = 5.991;

export function ellipseFromCovariance(cov: Cov2D, scale = CHI2_95_2DOF): Ellipse {
  const { sxx, szz, sxz } = cov;
  if (sxx === 0 && szz === 0 && sxz === 0) {
    return { semiMajor: 0, semiMinor: 0, angleRad: 0 };
  }
  // Eigenvalues of [[sxx, sxz], [sxz, szz]]
  const trace = sxx + szz;
  const det = sxx * szz - sxz * sxz;
  const disc = Math.sqrt(Math.max(0, trace * trace / 4 - det));
  const lam1 = trace / 2 + disc; // largest
  const lam2 = Math.max(0, trace / 2 - disc);

  const semiMajor = Math.sqrt(lam1 * scale);
  const semiMinor = Math.sqrt(lam2 * scale);

  // Angle of the eigenvector for lam1: [[sxx, sxz], [sxz, szz]] · v = lam1 · v
  // Solve (sxx − lam1)·vx + sxz·vz = 0  →  vz/vx = (lam1 − sxx) / sxz
  let angleRad = 0;
  if (Math.abs(sxz) > 1e-12) {
    angleRad = Math.atan2(lam1 - sxx, sxz);
  } else {
    // sxz == 0: axes already aligned. Major axis is x if sxx > szz, z otherwise.
    angleRad = sxx >= szz ? 0 : Math.PI / 2;
  }
  return { semiMajor, semiMinor, angleRad };
}
