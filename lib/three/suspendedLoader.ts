/**
 * Suspense-enabled asset loading utilities for Three.js
 * Uses suspend-react to properly handle asset loading with React Suspense
 */

import { suspend } from 'suspend-react';
import * as THREE from 'three';
import { safeColor } from './safeCreators';

// Cache key generator
const createCacheKey = (url: string, type: string) => [`${url}`, type];

/**
 * Load a texture with suspense support
 * @param url The URL of the texture to load
 * @param options Optional loader options
 */
export const useTexture = (url: string, options: { 
  anisotropy?: number,
  colorSpace?: THREE.ColorSpace
} = {}) => {
  return suspend(async () => {
    const loader = new THREE.TextureLoader();
    
    // Create a loading promise
    const texture = await new Promise<THREE.Texture>((resolve, reject) => {
      loader.load(
        url,
        (texture) => {
          // Apply options
          if (options.anisotropy) {
            texture.anisotropy = options.anisotropy;
          }
          
          if (options.colorSpace) {
            texture.colorSpace = options.colorSpace;
          }
          
          resolve(texture);
        },
        undefined,
        (error) => reject(error)
      );
    });
    
    return texture;
  }, createCacheKey(url, 'texture'));
};

/**
 * Load a cubemap with suspense support
 * @param urls Array of 6 URLs for the cubemap faces
 */
export const useCubeTexture = (urls: [string, string, string, string, string, string]) => {
  return suspend(async () => {
    const loader = new THREE.CubeTextureLoader();
    
    // Create a loading promise
    const texture = await new Promise<THREE.CubeTexture>((resolve, reject) => {
      loader.load(
        urls,
        (texture) => resolve(texture),
        undefined,
        (error) => reject(error)
      );
    });
    
    return texture;
  }, createCacheKey(urls.join('|'), 'cubetexture'));
};

/**
 * Load a GLB/GLTF model with suspense support
 * Requires installing additional @react-three/drei package for GLTFLoader
 */
export const useGLTF = (url: string) => {
  return suspend(async () => {
    // Dynamic import to avoid bundling issues
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const loader = new GLTFLoader();
    
    // Create a loading promise
    const gltf = await new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => resolve(gltf),
        undefined,
        (error) => reject(error)
      );
    });
    
    return gltf;
  }, createCacheKey(url, 'gltf'));
};

/**
 * Helper for creating a safe material with texture suspense
 */
export const useMaterialWithTexture = (textureUrl: string, materialType: 'basic' | 'standard' = 'standard') => {
  const texture = useTexture(textureUrl, { colorSpace: THREE.SRGBColorSpace });
  
  return suspend(async () => {
    try {
      // Create appropriate material based on type
      if (materialType === 'basic') {
        return new THREE.MeshBasicMaterial({ map: texture });
      } else {
        return new THREE.MeshStandardMaterial({ 
          map: texture,
          roughness: 0.7,
          metalness: 0.2
        });
      }
    } catch (e) {
      console.error('Error creating material with texture', e);
      // Fallback to basic colored material
      return new THREE.MeshBasicMaterial({ color: safeColor('#ff0000') });
    }
  }, createCacheKey(textureUrl, `material-${materialType}`));
};

export default {
  useTexture,
  useCubeTexture,
  useGLTF,
  useMaterialWithTexture
}; 