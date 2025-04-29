import { 
  UnsignedByteType, 
  HalfFloatType, 
  UnsignedIntType, 
  ByteType, 
  ShortType 
} from './threeConstants';

// Patch the window object to provide constants for gainmap-js
declare global {
  interface Window {
    THREE?: {
      UnsignedByteType: number;
      HalfFloatType: number;
      UnsignedIntType: number;
      ByteType: number;
      ShortType: number;
    };
  }
}

// If THREE doesn't exist on window, add it with required constants
if (typeof window !== 'undefined' && !window.THREE) {
  window.THREE = {
    UnsignedByteType,
    HalfFloatType,
    UnsignedIntType,
    ByteType,
    ShortType
  };
}

export default function applyGainmapPatch() {
  // This function exists to ensure the patch is applied when imported
  // It doesn't need to do anything as the side effects happen on import
  console.log('Gainmap compatibility patch applied');
} 