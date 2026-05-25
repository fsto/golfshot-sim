import { Text } from '@react-three/drei';
import { useShotStore } from '../../state/shotStore';
import { distanceFromDisplay, distanceUnit } from '../../lib/format';

const GROUND_LENGTH_M = 500;
const GROUND_WIDTH_M = 200;
const TEE_OFFSET_M = 20;     // ground extends behind the tee a bit

/**
 * Fairway dimensions follow the active unit:
 *   imperial: 35 yd wide fairway + a 10-yd buffer to the outer line
 *   metric:    35 m wide fairway +    10 m buffer to the outer line
 */
function laneWidths(units: 'imperial' | 'metric'): { fairwayHalfM: number; outerHalfM: number } {
  const FAIRWAY_DISPLAY = 35;   // in display units
  const BUFFER_DISPLAY = 10;
  const fairwayHalfM = distanceFromDisplay(FAIRWAY_DISPLAY / 2, units);
  const outerHalfM = fairwayHalfM + distanceFromDisplay(BUFFER_DISPLAY, units);
  return { fairwayHalfM, outerHalfM };
}

/**
 * Common props for overlay meshes. polygonOffset biases the depth value so coplanar overlays
 * (ground + fairway band + edge stripes + tee marker) don't z-fight when viewed from afar.
 */
const overlayMaterialProps = {
  polygonOffset: true,
  polygonOffsetFactor: -1,
  polygonOffsetUnits: -2,
  depthWrite: false as const,
};

/** Yardage / meter markers laid flat on the turf, big enough to read from the default camera. */
function DistanceMarkers() {
  const units = useShotStore((s) => s.units);
  const labelUnit = distanceUnit(units);
  const labels = [50, 100, 150, 200, 250, 300, 350];
  return (
    <group>
      {labels.map((label) => {
        const xMeters = distanceFromDisplay(label, units);
        if (xMeters > GROUND_LENGTH_M) return null;
        return (
          <group key={label} position={[xMeters, 0, 0]}>
            {/* Short ground stripe across the fairway */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
              <planeGeometry args={[2.4, 14]} />
              <meshBasicMaterial color="#f8fafc" transparent opacity={0.85} {...overlayMaterialProps} />
            </mesh>
            {/* Flat-on-ground label — visible from above, big enough to read at zoom */}
            <Text
              position={[0, 0.12, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={5.2}
              color="#fef9c3"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.18}
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
  const units = useShotStore((s) => s.units);
  const { fairwayHalfM, outerHalfM } = laneWidths(units);
  const labelUnit = distanceUnit(units);

  return (
    <group>
      {/* Main range plane: physics x = down-target, z = lateral. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[GROUND_LENGTH_M / 2 - TEE_OFFSET_M, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[GROUND_LENGTH_M, GROUND_WIDTH_M]} />
        <meshStandardMaterial color="#2f6b3a" roughness={0.95} />
      </mesh>

      {/* Inner fairway band — slightly lighter than the surrounding range */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[GROUND_LENGTH_M / 2 - TEE_OFFSET_M, 0.04, 0]}
      >
        <planeGeometry args={[GROUND_LENGTH_M, fairwayHalfM * 2]} />
        <meshBasicMaterial color="#3f7a48" transparent opacity={0.7} {...overlayMaterialProps} />
      </mesh>

      {/* Centerline strip down the middle */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[GROUND_LENGTH_M / 2 - TEE_OFFSET_M, 0.06, 0]}
      >
        <planeGeometry args={[GROUND_LENGTH_M, 0.22]} />
        <meshBasicMaterial color="#56a967" transparent opacity={0.85} {...overlayMaterialProps} />
      </mesh>

      {/* Fairway edge stripes (35 yd / 35 m boundary) */}
      {[-fairwayHalfM, fairwayHalfM].map((z) => (
        <mesh
          key={`fw-${z}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[GROUND_LENGTH_M / 2 - TEE_OFFSET_M, 0.06, z]}
        >
          <planeGeometry args={[GROUND_LENGTH_M, 0.6]} />
          <meshBasicMaterial color="#f5f5f5" transparent opacity={0.85} {...overlayMaterialProps} />
        </mesh>
      ))}

      {/* Outer stripes — 10 of the current unit beyond the fairway edges */}
      {[-outerHalfM, outerHalfM].map((z) => (
        <mesh
          key={`og-${z}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[GROUND_LENGTH_M / 2 - TEE_OFFSET_M, 0.06, z]}
        >
          <planeGeometry args={[GROUND_LENGTH_M, 0.45]} />
          <meshBasicMaterial color="#a1a1aa" transparent opacity={0.7} {...overlayMaterialProps} />
        </mesh>
      ))}

      {/* Fairway-width caption near the 150-unit marker */}
      <Text
        position={[distanceFromDisplay(150, units), 0.12, fairwayHalfM + 3]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={2.8}
        color="#e2e8f0"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.1}
        outlineColor="#0f1218"
      >
        {`35 ${labelUnit} fairway`}
      </Text>

      {/* Tee marker */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial color="#ffffff" {...overlayMaterialProps} />
      </mesh>

      <DistanceMarkers />
    </group>
  );
}
