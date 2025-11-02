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
      {/* Terrain/Ground */}
      <mesh 
        ref={terrainRef}
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.1, 0]} 
        receiveShadow
      >
        <planeGeometry args={[500, 500, 100, 100]} />
        <meshStandardMaterial 
          color="#151515"
          wireframe={false} 
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Grid for reference */}
      <gridHelper 
        args={[500, 500, '#444444', '#222222']} 
        position={[0, 0.01, 0]} 
      />

      {/* Axes helper for reference */}
      <axesHelper args={[10]} position={[0, 0.01, 0]} />

      {/* Sky backdrop */}
      <SkyBackground />
    </>
  );
};

// Component for rendering the sky backdrop
const SkyBackground: React.FC = () => {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[400, 32, 32]} />
      <meshBasicMaterial 
        color={safeColor('#050508')} 
        side={getBackSide()} 
        fog={false}
      />
    </mesh>
  );
};

export default Environment; 