import { Text } from '@react-three/drei';
import { useShotStore } from '../../state/shotStore';
import { distanceFromDisplay, distanceUnit } from '../../lib/format';

const GROUND_LENGTH_M = 500;
const GROUND_WIDTH_M = 200;
const TEE_OFFSET_M = 20;     // ground extends behind the tee a bit
// PGA fairway widths typically 30–40 yd at the landing area. 35 yd ≈ 16 m half-width.
const FAIRWAY_HALF_WIDTH_M = 16;
// "Generous landing zone" — light rough boundary at ~25 yd half-width.
const ROUGH_HALF_WIDTH_M = 23;

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

      {/* Lighter fairway band: 32 m (~35 yd) wide — typical PGA landing-area fairway width */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[GROUND_LENGTH_M / 2 - TEE_OFFSET_M, 0.005, 0]}
      >
        <planeGeometry args={[GROUND_LENGTH_M, FAIRWAY_HALF_WIDTH_M * 2]} />
        <meshBasicMaterial color="#3f7a48" transparent opacity={0.55} />
      </mesh>

      {/* Fairway edge stripes */}
      {[-FAIRWAY_HALF_WIDTH_M, FAIRWAY_HALF_WIDTH_M].map((z) => (
        <mesh
          key={`fw-${z}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[GROUND_LENGTH_M / 2 - TEE_OFFSET_M, 0.015, z]}
        >
          <planeGeometry args={[GROUND_LENGTH_M, 0.5]} />
          <meshBasicMaterial color="#f5f5f5" transparent opacity={0.55} />
        </mesh>
      ))}

      {/* Light-rough edge stripes at ~25 yd half-width */}
      {[-ROUGH_HALF_WIDTH_M, ROUGH_HALF_WIDTH_M].map((z) => (
        <mesh
          key={`rg-${z}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[GROUND_LENGTH_M / 2 - TEE_OFFSET_M, 0.012, z]}
        >
          <planeGeometry args={[GROUND_LENGTH_M, 0.35]} />
          <meshBasicMaterial color="#9aa3b2" transparent opacity={0.45} />
        </mesh>
      ))}

      {/* Tiny label at 150 yd showing the fairway width as a sanity reference */}
      <Text
        position={[
          // place near the 150-unit marker (in whichever units the user is on)
          // — use 137 m which is 150 yd; close enough for both units
          137,
          1.0,
          FAIRWAY_HALF_WIDTH_M + 2.5,
        ]}
        fontSize={1.1}
        color="#cbd5e1"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#0f1218"
      >
        35 yd fairway
      </Text>

      {/* Tee marker (small white square at origin) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      <DistanceMarkers />
    </group>
  );
}
