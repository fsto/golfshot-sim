import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { useDispersionStore } from '../../state/dispersionStore';
import { covariance2D, ellipseFromCovariance } from '../../lib/math/stats';

const ELLIPSE_SEGMENTS = 80;

/** Landing-point cloud + 95% rest-point covariance ellipse on the ground. */
export function DispersionMarks() {
  const result = useDispersionStore((s) => s.result);

  const ellipse = useMemo(() => {
    if (!result || result.rests.length < 3) return null;
    const cov = covariance2D(result.rests);
    const e = ellipseFromCovariance(cov);
    let cx = 0;
    let cz = 0;
    for (const p of result.rests) {
      cx += p.x;
      cz += p.z;
    }
    cx /= result.rests.length;
    cz /= result.rests.length;

    const points: [number, number, number][] = [];
    const cos = Math.cos(e.angleRad);
    const sin = Math.sin(e.angleRad);
    for (let i = 0; i <= ELLIPSE_SEGMENTS; i++) {
      const theta = (i / ELLIPSE_SEGMENTS) * 2 * Math.PI;
      const ex = Math.cos(theta) * e.semiMajor;
      const ez = Math.sin(theta) * e.semiMinor;
      const x = cx + ex * cos - ez * sin;
      const z = cz + ex * sin + ez * cos;
      points.push([x, 0.06, z]);
    }
    return { points, center: [cx, 0.06, cz] as [number, number, number] };
  }, [result]);

  if (!result) return null;

  return (
    <group>
      {/* Landing cloud */}
      {result.landings.map((p, i) => (
        <mesh key={`l-${i}`} position={[p.x, 0.04, p.z]}>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.85} />
        </mesh>
      ))}
      {/* Rest cloud, dimmer + behind */}
      {result.rests.map((p, i) => (
        <mesh key={`r-${i}`} position={[p.x, 0.04, p.z]}>
          <sphereGeometry args={[0.14, 8, 8]} />
          <meshBasicMaterial color="#86efac" transparent opacity={0.55} />
        </mesh>
      ))}
      {/* 95% ellipse around rest points */}
      {ellipse && (
        <>
          <Line points={ellipse.points} color="#facc15" lineWidth={2} transparent opacity={0.9} />
          <mesh position={ellipse.center}>
            <sphereGeometry args={[0.35, 12, 12]} />
            <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.6} />
          </mesh>
        </>
      )}
    </group>
  );
}
