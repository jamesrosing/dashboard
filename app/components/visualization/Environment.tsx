import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Environment component that renders terrain, grid, and skybox
export const Environment: React.FC = () => {
  const terrainRef = useRef<THREE.Mesh>(null);
  
  // Rotate grid for animation effect
  useFrame(() => {
    if (terrainRef.current) {
      // Add subtle terrain movement if desired
    }
  });

  return (
    <>
      {/* Terrain/Ground */}
      <mesh 
        ref={terrainRef}
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.1, 0]} 
        receiveShadow
      >
        <planeGeometry args={[200, 200, 100, 100]} />
        <meshStandardMaterial 
          color="#3f4550"
          wireframe={false} 
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Grid for reference */}
      <gridHelper 
        args={[200, 200, '#666666', '#444444']} 
        position={[0, 0.01, 0]} 
      />

      {/* Axes helper for reference */}
      <axesHelper args={[5]} position={[0, 0.01, 0]} />

      {/* Sky backdrop */}
      <SkyBackground />
    </>
  );
};

// Component for rendering the sky backdrop
const SkyBackground: React.FC = () => {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[150, 32, 32]} />
      <meshBasicMaterial 
        color={new THREE.Color('#101624')} 
        side={THREE.BackSide} 
        fog={false}
      />
    </mesh>
  );
};

export default Environment; 