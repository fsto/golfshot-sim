import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { useTrajectory } from '../../hooks/useTrajectory';

const MAX_FLIGHT_POINTS = 240;
const MAX_GROUND_POINTS = 160;

/** Flight trajectory + ground game (bounces + roll) + landing/resting ball markers. */
export function BallTrace() {
  const traj = useTrajectory();

  const flightPoints = useMemo<[number, number, number][]>(() => {
    const samples = traj.flight.samples;
    const stride = Math.max(1, Math.floor(samples.length / MAX_FLIGHT_POINTS));
    const out: [number, number, number][] = [];
    for (let i = 0; i < samples.length; i += stride) {
      const s = samples[i]!;
      out.push([s.pos.x, s.pos.y, s.pos.z]);
    }
    const last = samples[samples.length - 1];
    if (last) out.push([last.pos.x, last.pos.y, last.pos.z]);
    return out;
  }, [traj]);

  const groundPoints = useMemo<[number, number, number][]>(() => {
    const path = traj.rollPath;
    if (path.length === 0) return [];
    const stride = Math.max(1, Math.floor(path.length / MAX_GROUND_POINTS));
    const out: [number, number, number][] = [];
    // Start ground line at carry landing so the green path connects to the cyan arc
    const land = traj.flight.landingState.pos;
    out.push([land.x, land.y, land.z]);
    for (let i = 0; i < path.length; i += stride) {
      const p = path[i]!;
      out.push([p.x, p.y, p.z]);
    }
    const last = path[path.length - 1];
    if (last) out.push([last.x, last.y, last.z]);
    return out;
  }, [traj]);

  const landing = traj.flight.landingState.pos;
  const restPoint = traj.rollPath[traj.rollPath.length - 1] ?? landing;

  return (
    <group>
      {/* Carry arc */}
      <Line points={flightPoints} color="#7dd3fc" lineWidth={2.2} transparent opacity={0.9} />
      {/* Ground game line — bounces + roll, on the turf */}
      {groundPoints.length > 1 && (
        <Line points={groundPoints} color="#86efac" lineWidth={1.8} transparent opacity={0.85} />
      )}
      {/* First landing (where the ball touched down) */}
      <mesh position={[landing.x, Math.max(landing.y, 0.05), landing.z]}>
        <sphereGeometry args={[0.35, 12, 12]} />
        <meshStandardMaterial color="#86efac" emissive="#86efac" emissiveIntensity={0.4} />
      </mesh>
      {/* Final rest position */}
      <mesh position={[restPoint.x, Math.max(restPoint.y, 0.05), restPoint.z]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>
      {/* Tee */}
      <mesh position={[0, 0.06, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}
