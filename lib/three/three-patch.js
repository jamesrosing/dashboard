/**
 * Three.js compatibility patch loader
 * 
 * This module adds back removed constants to maintain compatibility with libraries
 * that depend on older Three.js versions like troika-3d
 */

module.exports = function(source) {
  // This is a webpack loader that will patch Three.js module before it's loaded
  console.log('🔧 Applying Three.js compatibility patch for ESM modules...');
  
  // We need to actually modify the source to add the constants back
  // This ensures they're available during the ESM import process
  const patchedSource = `
// Constants that were removed in newer Three.js versions
export const LinearEncoding = 3000;
export const sRGBEncoding = 3001;
export const NoToneMapping = 0;

${source}

// Also add them to the default export if it exists
if (typeof THREE !== 'undefined') {
  THREE.LinearEncoding = LinearEncoding;
  THREE.sRGBEncoding = sRGBEncoding;
  THREE.NoToneMapping = NoToneMapping;
}
`;
  
  return patchedSource;
}; 