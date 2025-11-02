import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Safe wrapper functions to prevent initialization errors
const safeColor = (color: string): any => {
  try {
    return new (THREE as any).Color(color);
  } catch (e) {
    // Return a simple object with color properties
    return { r: 0, g: 0, b: 0 };
  }
};

// Get constants safely
const getBackSide = (): any => {
  try {
    return (THREE as any).BackSide;
  } catch (e) {
    return 1; // BackSide constant value
  }
};

// Environment component that renders terrain, grid, and skybox
export const Environment: React.FC = () => {
  const terrainRef = useRef<any>(null);
  
  // Rotate grid for animation effect
  useFrame(() => {
    if (terrainRef.current) {
      // Add subtle terrain movement if desired
    }
  });

  return (
    <>
      {/* Terrain/Ground - More realistic color */}
      <mesh
        ref={terrainRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.1, 0]}
        receiveShadow
      >
        <planeGeometry args={[1000, 1000, 100, 100]} />
        <meshStandardMaterial
          color="#2a2a35"
          wireframe={false}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Grid for reference - More visible */}
      <gridHelper
        args={[1000, 100, '#5a5a6a', '#3a3a4a']}
        position={[0, 0.01, 0]}
      />

      {/* Axes helper for reference */}
      <axesHelper args={[20]} position={[0, 0.01, 0]} />

      {/* Sky backdrop */}
      <SkyBackground />
    </>
  );
};

// Component for rendering the sky backdrop
const SkyBackground: React.FC = () => {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[800, 32, 32]} />
      <meshBasicMaterial
        color={safeColor('#1a1a2e')}
        side={getBackSide()}
        fog={false}
      />
    </mesh>
  );
};

export default Environment; 