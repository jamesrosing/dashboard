/**
 * Three.js initialization module
 * 
 * This module must be imported BEFORE any other Three.js imports
 * to ensure compatibility constants are properly defined.
 */

// Immediately define critical constants to prevent "Cannot access before initialization" errors
if (typeof window !== 'undefined') {
  // Define THREE global if it doesn't exist
  if (!(window as any).THREE) {
    (window as any).THREE = {};
  }
  
  // Directly assign primitive values to THREE globals
  // This ensures they're available before any module tries to access them
  Object.assign((window as any).THREE, {
    // Type constants
    UnsignedByteType: 1009,
    ByteType: 1010,
    ShortType: 1011,
    UnsignedShortType: 1012,
    IntType: 1013,
    UnsignedIntType: 1014,
    FloatType: 1015,
    HalfFloatType: 1016,
    
    // Format constants
    RGBAFormat: 1023,
    RGIntegerFormat: 1033,
    RedFormat: 1028,
    RGFormat: 1030,
    RedIntegerFormat: 1031,
    RGBAIntegerFormat: 1033,
    
    // Encoding constants
    LinearEncoding: 3000,
    sRGBEncoding: 3001,
    
    // Filter constants
    LinearFilter: 1006,
    NearestFilter: 1003,
    ClampToEdgeWrapping: 1001,
    UVMapping: 300,
    LinearMipMapLinearFilter: 1008,
    
    // Other constants
    NoToneMapping: 0,
    LinearSRGBColorSpace: 'Linear',
    SRGBColorSpace: 'srgb',
    NoBlending: 0,
    FrontSide: 0,
    BackSide: 1,
    DoubleSide: 2
  });

  console.log('Critical Three.js constants pre-initialized');
}

export const initializeThreeConstants = true; 