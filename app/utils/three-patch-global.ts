/**
 * Three.js global namespace patch
 * 
 * This module adds the missing constants to the THREE global namespace
 * after import. Import this file once in your app's entry point.
 */

import * as THREE from 'three';
import { LinearEncoding, sRGBEncoding, NoToneMapping } from './three-compat';

// Patch THREE global namespace with missing constants
(THREE as any).LinearEncoding = LinearEncoding;
(THREE as any).sRGBEncoding = sRGBEncoding;
(THREE as any).NoToneMapping = NoToneMapping;

// Fix path alias issues
// This ensures apps importing from 'three' get the patched THREE with all exports
if (typeof window !== 'undefined') {
  (window as any).THREE = THREE;
}

// Verify the patch was applied
console.log('🔧 THREE.js global patch applied:', 
  'LinearEncoding=', (THREE as any).LinearEncoding,
  'sRGBEncoding=', (THREE as any).sRGBEncoding,
  'NoToneMapping=', (THREE as any).NoToneMapping
); 