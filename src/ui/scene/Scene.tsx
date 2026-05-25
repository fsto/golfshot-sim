import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { DrivingRange } from './DrivingRange';
import { BallTrace } from './BallTrace';
import { GhostTrace } from './GhostTrace';
import { DispersionMarks } from './DispersionMarks';

export function Scene() {
  return (
    <div className="scene">
      <Canvas
        shadows
        camera={{
          position: [-18, 9, 9],  // behind and right of tee, looking down +x
          fov: 50,
          near: 0.1,
          far: 1500,
        }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#0f1218']} />
        <Sky
          distance={450000}
          sunPosition={[80, 60, -40]}
          inclination={0.49}
          azimuth={0.25}
          turbidity={6}
          rayleigh={2}
        />

        <ambientLight intensity={0.45} />
        <directionalLight
          position={[60, 80, -30]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <DrivingRange />
        <GhostTrace />
        <DispersionMarks />
        <BallTrace />

        <OrbitControls
          target={[80, 8, 0]}
          enableDamping
          dampingFactor={0.1}
          enablePan
          enableZoom
          enableRotate
          screenSpacePanning
          panSpeed={1.2}
          zoomSpeed={1.1}
          rotateSpeed={0.9}
          maxPolarAngle={Math.PI / 2 - 0.02}   // can't go under ground
          minDistance={2}
          maxDistance={600}
          keys={{ LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown' }}
        />
      </Canvas>
    </div>
  );
}
