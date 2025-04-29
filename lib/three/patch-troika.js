/**
 * Patch script for troika-3d module
 * 
 * This script directly modifies the troika-3d ESM file to add the missing Three.js constants
 * that were removed in newer versions. This approach is more reliable than trying to use
 * Webpack aliases or other indirect methods.
 */

const fs = require('fs');
const path = require('path');

// Constants from older Three.js versions
const CONSTANTS = {
  LinearEncoding: 3000,
  sRGBEncoding: 3001,
  NoToneMapping: 0
};

/**
 * Patch troika-3d ESM file
 */
function patchTroikaEsm() {
  try {
    const modulesPaths = [
      // Main troika-3d module
      './node_modules/troika-3d/dist/troika-3d.esm.js',
      // Text module
      './node_modules/troika-three-text/dist/troika-three-text.esm.js'
    ];

    modulesPaths.forEach(modulePath => {
      const fullPath = path.resolve(modulePath);
      
      if (!fs.existsSync(fullPath)) {
        console.warn(`Could not find ${modulePath} to patch`);
        return;
      }
      
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Check if already patched
      if (content.includes('// PATCHED FOR THREE.JS COMPATIBILITY')) {
        console.log(`${modulePath} already patched`);
        return;
      }
      
      // Add our constants before the imports
      const patch = `// PATCHED FOR THREE.JS COMPATIBILITY
const LinearEncoding = ${CONSTANTS.LinearEncoding};
const sRGBEncoding = ${CONSTANTS.sRGBEncoding};
const NoToneMapping = ${CONSTANTS.NoToneMapping};

`;
      
      // Insert the patch at the beginning of the file
      const patchedContent = patch + content;
      
      // Write back the patched file
      fs.writeFileSync(fullPath, patchedContent);
      console.log(`✅ Successfully patched ${modulePath}`);
    });
    
    console.log('Troika patching complete');
  } catch (err) {
    console.error('Error patching troika modules:', err);
  }
}

// Execute the patch
patchTroikaEsm(); 