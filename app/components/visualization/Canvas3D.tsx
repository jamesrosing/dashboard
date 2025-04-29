'use client';

// Reference the type declaration file for troika-3d
/// <reference path="./troika.d.ts" />
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
// Import from our type-safe wrapper
import { Canvas3D as TroikaCanvas3D, TroikaObject3DFacade } from './troika-imports';
// Import OrbitControls from drei instead of directly from three
import { OrbitControls } from '@react-three/drei';
// Use our typed hooks
import { useAppSelector } from '../../../lib/state/hooks';
import { selectFilteredEntities } from '../../../lib/state/entitySlice';

interface Canvas3DProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

/**
 * Canvas3D component using Troika for optimized 3D rendering
 * This is the main visualization container for the dashboard
 */
export function Canvas3D({ width = '100%', height = '100%', className = '' }: Canvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const [initialized, setInitialized] = useState(false);
  
  // Get entities from Redux store 
  const entities = useAppSelector(selectFilteredEntities);

  // Initialize scene, camera, and renderer
  useEffect(() => {
    if (!containerRef.current || initialized) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      60, // FOV
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near clipping plane
      10000 // Far clipping plane
    );
    camera.position.set(0, 100, 200);
    camera.lookAt(0, 0, 0);

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    
    // Add renderer to DOM
    containerRef.current.appendChild(renderer.domElement);

    // Setup orbit controls
    const controls = new (OrbitControls as any)(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = 1000;
    controls.maxPolarAngle = Math.PI / 2;
    controlsRef.current = controls;

    // Add grid helper
    const gridHelper = new THREE.GridHelper(1000, 50, 0x555555, 0x333333);
    scene.add(gridHelper);

    // Setup axes helper for orientation
    const axesHelper = new THREE.AxesHelper(50);
    scene.add(axesHelper);

    // Create Troika Canvas3D
    const canvas3d = new (TroikaCanvas3D as any)(containerRef.current);
    canvas3d.scene = scene;
    canvas3d.camera = camera;
    canvas3d.renderer = renderer;
    canvas3d.renderOptions = { 
      antialias: true,
      alpha: false,
      clearColor: new THREE.Color(0x1a1a2e),
      clearAlpha: 1,
      shadowMap: true
    };
    
    // Setup animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      canvas3d.render();
    };
    
    // Start animation loop
    animate();
    
    // Set Canvas3D instance ref
    canvasRef.current = canvas3d;
    setInitialized(true);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup on unmount
    return () => {
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      
      if (canvasRef.current) {
        canvasRef.current.dispose();
      }
    };
  }, [initialized]);

  // Update entities in Troika world when they change
  useEffect(() => {
    if (!canvasRef.current || !initialized) return;

    // Here is where we would update the entities in the Troika world
    // This will be implemented in the EntityFacade component
    console.log('Entities updated:', entities.length);
    
    // Example of how we'll add objects to the world:
    // const world = canvasRef.current.getChildByKey('world');
    // if (world) {
    //   world.children = entities.map(entity => ({
    //     key: entity.id,
    //     facade: EntityFacade,
    //     entityData: entity
    //   }));
    // }
  }, [entities, initialized]);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Canvas will be added here programmatically */}
    </div>
  );
}

export default Canvas3D; 