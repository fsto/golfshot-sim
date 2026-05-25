import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { useTrajectory } from '../../hooks/useTrajectory';

const MAX_POINTS = 240;

/** Trajectory line + landing-point ball. Renders in physics coordinates directly. */
export function BallTrace() {
  const traj = useTrajectory();

  const points = useMemo<[number, number, number][]>(() => {
    const samples = traj.flight.samples;
    const stride = Math.max(1, Math.floor(samples.length / MAX_POINTS));
    const out: [number, number, number][] = [];
    for (let i = 0; i < samples.length; i += stride) {
      const s = samples[i]!;
      out.push([s.pos.x, s.pos.y, s.pos.z]);
    }
    const last = samples[samples.length - 1];
    if (last) out.push([last.pos.x, last.pos.y, last.pos.z]);
    return out;
  }, [traj]);

  const landing = traj.flight.landingState.pos;

  return (
    <group>
      <Line
        points={points}
        color="#7dd3fc"
        lineWidth={2.2}
        transparent
        opacity={0.9}
      />
      {/* Ball at landing point */}
      <mesh position={[landing.x, Math.max(landing.y, 0.05), landing.z]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#7dd3fc" emissiveIntensity={0.25} />
      </mesh>
      {/* Tee-ball (always at origin to mark the launch point) */}
      <mesh position={[0, 0.06, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}
