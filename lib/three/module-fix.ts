/**
 * Three.js module fix
 * 
 * This module re-exports everything from three.js directly from the node_modules,
 * avoiding the TypeScript path resolution issues that occur with aliases.
 */

// Re-export everything from the original Three.js module
export * from 'three';

// Add the missing constants
export const LinearEncoding = 3000;
export const sRGBEncoding = 3001;
export const NoToneMapping = 0;

// Also provide a default export
import * as THREE from 'three';

// Add our constants to the default export
const PatchedTHREE = {
  ...THREE,
  LinearEncoding,
  sRGBEncoding,
  NoToneMapping
};

export default PatchedTHREE; 