import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { useHistoryStore } from '../../state/historyStore';
import type { ShotResult } from '../../physics/types';

const MAX_FLIGHT_POINTS = 160;
const MAX_GROUND_POINTS = 100;

/** Renders saved shots as dimmed 3D traces over the driving range. */
export function GhostTrace() {
  const shots = useHistoryStore((s) => s.shots);
  return (
    <group>
      {shots.map((s) => (
        <GhostShot key={s.id} result={s.result} color={s.color} />
      ))}
    </group>
  );
}

function GhostShot({ result, color }: { result: ShotResult; color: string }) {
  const flightPoints = useMemo<[number, number, number][]>(() => {
    const samples = result.flight.samples;
    if (samples.length === 0) return [];
    const stride = Math.max(1, Math.floor(samples.length / MAX_FLIGHT_POINTS));
    const out: [number, number, number][] = [];
    for (let i = 0; i < samples.length; i += stride) {
      const s = samples[i]!;
      out.push([s.pos.x, s.pos.y, s.pos.z]);
    }
    const last = samples[samples.length - 1];
    if (last) out.push([last.pos.x, last.pos.y, last.pos.z]);
    return out;
  }, [result]);

  const groundPoints = useMemo<[number, number, number][]>(() => {
    const path = result.rollPath;
    if (path.length === 0) return [];
    const stride = Math.max(1, Math.floor(path.length / MAX_GROUND_POINTS));
    const out: [number, number, number][] = [];
    const land = result.flight.landingState.pos;
    out.push([land.x, land.y, land.z]);
    for (let i = 0; i < path.length; i += stride) {
      const p = path[i]!;
      out.push([p.x, p.y, p.z]);
    }
    const last = path[path.length - 1];
    if (last) out.push([last.x, last.y, last.z]);
    return out;
  }, [result]);

  const rest = result.rollPath[result.rollPath.length - 1] ?? result.flight.landingState.pos;

  return (
    <group>
      {flightPoints.length > 1 && (
        <Line points={flightPoints} color={color} lineWidth={1.3} transparent opacity={0.55} />
      )}
      {groundPoints.length > 1 && (
        <Line points={groundPoints} color={color} lineWidth={1.0} transparent opacity={0.45} />
      )}
      {/* Small marker at the rest point */}
      <mesh position={[rest.x, Math.max(rest.y, 0.05), rest.z]}>
        <sphereGeometry args={[0.3, 10, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}
