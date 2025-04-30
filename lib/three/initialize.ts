/**
 * Three.js Initialization Module
 * 
 * This file provides early initialization for Three.js compatibility.
 * It should be imported as early as possible in the application lifecycle,
 * ideally in _app.tsx or a similar entry point.
 */

import { applyThreeCompatibilityPatches } from './troika-compat-patch';

// Immediately apply patches when this module is imported
if (typeof window !== 'undefined') {
  // Only run on client side
  console.log('Applying Three.js compatibility patches');
  applyThreeCompatibilityPatches();
}

// Export a no-op function that can be called to ensure the module is imported
export function ensureThreeJsPatched() {
  // This function exists just to provide an explicit way to import this file
  return true;
}

export default ensureThreeJsPatched; 