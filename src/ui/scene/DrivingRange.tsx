import { Text } from '@react-three/drei';
import { useShotStore } from '../../state/shotStore';
import { distanceFromDisplay, distanceUnit } from '../../lib/format';

const GROUND_LENGTH_M = 500;
const GROUND_WIDTH_M = 200;
const TEE_OFFSET_M = 20;     // ground extends behind the tee a bit

/** Yardage/meter markers along the target line. Spacing follows the current units. */
function DistanceMarkers() {
  const units = useShotStore((s) => s.units);
  const labelUnit = distanceUnit(units);
  // 50-unit spacing in the current display unit
  const labels = [50, 100, 150, 200, 250, 300, 350];
  return (
    <group>
      {labels.map((label) => {
        const xMeters = distanceFromDisplay(label, units);
        if (xMeters > GROUND_LENGTH_M) return null;
        return (
          <group key={label} position={[xMeters, 0, 0]}>
            {/* Short stripe across the fairway */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
              <planeGeometry args={[1.5, 6]} />
              <meshBasicMaterial color="#e6ebf4" transparent opacity={0.55} />
            </mesh>
            {/* Floating label */}
            <Text
              position={[0, 1.4, 0]}
              fontSize={1.6}
              color="#e6ebf4"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.04}
              outlineColor="#0f1218"
            >
              {`${label} ${labelUnit}`}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

export function DrivingRange() {
  return (
    <group>
      {/* Sky-blue ambient backdrop done via Canvas color; here just the ground+features */}

      {/* Main fairway plane: physics x = down-target, z = lateral. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[GROUND_LENGTH_M / 2 - TEE_OFFSET_M, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[GROUND_LENGTH_M, GROUND_WIDTH_M]} />
        <meshStandardMaterial color="#2f6b3a" roughness={0.95} />
      </mesh>

      {/* Centerline (very thin strip down the middle of the fairway) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[GROUND_LENGTH_M / 2 - TEE_OFFSET_M, 0.01, 0]}
      >
        <planeGeometry args={[GROUND_LENGTH_M, 0.18]} />
        <meshBasicMaterial color="#3d8a4a" transparent opacity={0.65} />
      </mesh>

      {/* Tee marker (small white square at origin) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      <DistanceMarkers />
    </group>
  );
}
