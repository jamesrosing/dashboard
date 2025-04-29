/**
 * Compatibility layer for Three.js in TypeScript
 * This file re-exports Three.js with any constants/types needed for Troika compatibility
 */
import * as THREE from 'three';

// Re-export everything from Three.js
export * from 'three';

// Add any missing constants needed by Troika components
(THREE as any).LinearEncoding = 3000;
(THREE as any).sRGBEncoding = 3001;
(THREE as any).NoToneMapping = 0;

// Export default for compatibility with original Three.js import pattern
export default THREE; 