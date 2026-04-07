import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { ReactNode } from 'react';

/**
 * Standard R3F canvas layout with orbit controls, camera, and lighting.
 */
export function R3FLayout({ children }: { children: ReactNode }) {
  return (
    <Canvas
      camera={{ position: [30, -30, 10], up: [0, 0, 1], fov: 75, near: 0.1, far: 1000 }}
      style={{ width: '100%', height: '100%', background: '#1a1a2e' }}
    >
      <ambientLight intensity={0.7} />
      <pointLight position={[0, 100, 0]} intensity={0.25} />
      <pointLight position={[100, 200, 100]} intensity={0.25} />
      <pointLight position={[-100, -200, -100]} intensity={0.25} />
      <OrbitControls />
      {children}
    </Canvas>
  );
}
