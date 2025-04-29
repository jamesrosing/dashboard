/**
 * Troika compatibility patch
 * 
 * This file provides a compatibility layer to work with troika-3d and related libraries
 * that rely on older Three.js constants that have been removed in newer versions.
 */
import * as THREE from 'three';
// Define constants that were removed from newer Three.js versions
const LinearEncoding = 3000;
const sRGBEncoding = 3001;
const NoToneMapping = 0;

// Patch THREE global object with missing constants if they don't exist
if (typeof (THREE as any).LinearEncoding === 'undefined') {
  Object.defineProperty(THREE, 'LinearEncoding', { value: LinearEncoding });
}

if (typeof (THREE as any).sRGBEncoding === 'undefined') {
  Object.defineProperty(THREE, 'sRGBEncoding', { value: sRGBEncoding });
}

if (typeof (THREE as any).NoToneMapping === 'undefined') {
  Object.defineProperty(THREE, 'NoToneMapping', { value: NoToneMapping });
}

// Export the patched THREE and the constants for direct use
export { LinearEncoding, sRGBEncoding, NoToneMapping }; 