import React, { Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ClientOnly from '../shared/ClientOnly';

// Safe browser detection
const isBrowser = typeof window !== 'undefined';

// Dynamically import Three.js components with SSR disabled
const ThreeCanvas = dynamic(
  () => import('@react-three/fiber').then(mod => mod.Canvas),
  { ssr: false }
);

// Create a simpler dynamic import that skips type checking
// @ts-ignore - Ignore type check for dynamic import
const DynamicEntityWorldScene = dynamic(() => import('./EntityWorldScene'), {
  ssr: false,
});

interface EntityWorldProps {
  onFpsChange?: (fps: number) => void;
}

// Main EntityWorld container that sets up the Three.js canvas
export const EntityWorld: React.FC<EntityWorldProps> = ({ onFpsChange }) => {
  return (
    <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-black to-gray-900">
      <ClientOnly fallback={
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400">Initializing 3D view...</div>
        </div>
      }>
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Loading 3D components...</div>
          </div>
        }>
          <ThreeCanvas shadows gl={{ antialias: true, powerPreference: 'high-performance' }}>
            <fog attach="fog" args={['#050508', 100, 350]} />
            {/* @ts-ignore - Ignore type check for props */}
            <DynamicEntityWorldScene onFpsChange={onFpsChange} />
          </ThreeCanvas>
        </Suspense>
      </ClientOnly>
    </div>
  );
};

export default EntityWorld; 