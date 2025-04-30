/**
 * Three.js Entry Module
 * 
 * This module is specifically designed to be the main entry point for Three.js imports.
 * It pre-defines all constants and then exports everything from Three.js.
 */

// Primitive constants - defined first before any other imports
// These are directly defined with primitive values to avoid any initialization timing issues

// Type constants
export const UnsignedByteType = 1009;
export const ByteType = 1010; 
export const ShortType = 1011;
export const UnsignedShortType = 1012;
export const IntType = 1013;
export const UnsignedIntType = 1014;
export const FloatType = 1015;
export const HalfFloatType = 1016;

// Format constants
export const RGBAFormat = 1023;
export const RGIntegerFormat = 1033;
export const RedFormat = 1028;
export const RGFormat = 1030;
export const RedIntegerFormat = 1031; 
export const RGBAIntegerFormat = 1033;

// Encoding constants (removed in Three.js r152)
export const LinearEncoding = 3000;
export const sRGBEncoding = 3001;
export const NoToneMapping = 0;

// Filter and mapping constants
export const LinearFilter = 1006;
export const NearestFilter = 1003;
export const ClampToEdgeWrapping = 1001;
export const UVMapping = 300;
export const LinearMipMapLinearFilter = 1008;

// Color spaces
export const LinearSRGBColorSpace = 'Linear';
export const SRGBColorSpace = 'srgb';

// Blending and sides
export const NoBlending = 0;
export const FrontSide = 0;
export const BackSide = 1;
export const DoubleSide = 2;

// Apply patches to global THREE if in browser
if (typeof window !== 'undefined') {
  if (!(window as any).THREE) {
    (window as any).THREE = {};
  }
  
  // Define the constants in the global THREE object
  Object.assign((window as any).THREE, {
    UnsignedByteType,
    ByteType,
    ShortType,
    UnsignedShortType,
    IntType,
    UnsignedIntType,
    FloatType,
    HalfFloatType,
    RGBAFormat,
    RGIntegerFormat,
    RedFormat,
    RGFormat,
    RedIntegerFormat,
    RGBAIntegerFormat,
    LinearEncoding,
    sRGBEncoding,
    NoToneMapping,
    LinearFilter,
    NearestFilter,
    ClampToEdgeWrapping,
    UVMapping,
    LinearMipMapLinearFilter,
    LinearSRGBColorSpace,
    SRGBColorSpace,
    NoBlending,
    FrontSide,
    BackSide,
    DoubleSide
  });
}

// Now import and export everything from Three.js
export * from 'three'; 