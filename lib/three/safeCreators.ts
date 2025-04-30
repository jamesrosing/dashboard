/**
 * Safe Three.js Object Creation Utilities
 * 
 * This module provides safe creation methods for Three.js objects,
 * with graceful fallbacks if the objects aren't properly initialized yet.
 */

import * as THREE from 'three';

/**
 * Creates a Vector3 safely, with fallback to a compatible object if Three.js isn't initialized
 */
export const safeVector3 = (x: number = 0, y: number = 0, z: number = 0): THREE.Vector3 => {
  try {
    return new THREE.Vector3(x, y, z);
  } catch (e) {
    console.warn('Fallback to Vector3 object', e);
    return {
      x,
      y, 
      z,
      isVector3: true,
      set: function(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
      },
      copy: function(v: any) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
      },
      add: function(v: any) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
      },
      sub: function(v: any) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
      },
      multiplyScalar: function(s: number) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
      },
      length: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
      },
      normalize: function() {
        const length = this.length();
        if (length > 0) {
          this.x /= length;
          this.y /= length;
          this.z /= length;
        }
        return this;
      },
      clone: function() {
        return { x: this.x, y: this.y, z: this.z, isVector3: true };
      }
    } as THREE.Vector3;
  }
};

/**
 * Creates a Euler safely, with fallback to a compatible object if Three.js isn't initialized
 */
export const safeEuler = (x: number = 0, y: number = 0, z: number = 0, order: THREE.EulerOrder = 'XYZ'): THREE.Euler => {
  try {
    return new THREE.Euler(x, y, z, order);
  } catch (e) {
    console.warn('Fallback to Euler object', e);
    return {
      x,
      y,
      z,
      order,
      isEuler: true,
      set: function(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
      },
      copy: function(e: any) {
        this.x = e.x;
        this.y = e.y;
        this.z = e.z;
        this.order = e.order;
        return this;
      },
      clone: function() {
        return { x: this.x, y: this.y, z: this.z, order: this.order, isEuler: true };
      }
    } as THREE.Euler;
  }
};

/**
 * Creates a Color safely, with fallback to a compatible object if Three.js isn't initialized
 */
export const safeColor = (r: number | string = 0, g: number = 0, b: number = 0): THREE.Color => {
  try {
    return new THREE.Color(r as any, g, b);
  } catch (e) {
    console.warn('Fallback to Color object', e);
    // Simple fallback for common case
    if (typeof r === 'string') {
      // Very basic color parsing for hex
      if (r.startsWith('#')) {
        const hex = parseInt(r.substring(1), 16);
        return {
          r: ((hex >> 16) & 255) / 255,
          g: ((hex >> 8) & 255) / 255,
          b: (hex & 255) / 255,
          isColor: true
        } as THREE.Color;
      }
      // Add more color parsing as needed
      return { r: 1, g: 1, b: 1, isColor: true } as THREE.Color;
    }
    
    return {
      r: r || 0,
      g: g || 0,
      b: b || 0,
      isColor: true,
      copy: function(c: any) {
        this.r = c.r;
        this.g = c.g;
        this.b = c.b;
        return this;
      },
      clone: function() {
        return { r: this.r, g: this.g, b: this.b, isColor: true };
      }
    } as THREE.Color;
  }
};

/**
 * Safe Math utilities
 */
export const safeMathUtils = {
  lerp: (x: number, y: number, t: number): number => {
    try {
      return THREE.MathUtils.lerp(x, y, t);
    } catch (e) {
      return x + (y - x) * t;
    }
  },
  clamp: (value: number, min: number, max: number): number => {
    try {
      return THREE.MathUtils.clamp(value, min, max);
    } catch (e) {
      return Math.max(min, Math.min(max, value));
    }
  },
  randFloat: (min: number, max: number): number => {
    try {
      return THREE.MathUtils.randFloat(min, max);
    } catch (e) {
      return min + Math.random() * (max - min);
    }
  }
};

/**
 * Safe constant access functions
 */
export const getBackSide = (): number => {
  try {
    return THREE.BackSide;
  } catch (e) {
    return 1; // BackSide constant value
  }
};

export const getDoubleSide = (): number => {
  try {
    return THREE.DoubleSide;
  } catch (e) {
    return 2; // DoubleSide constant value
  }
};

export default {
  safeVector3,
  safeEuler,
  safeColor,
  safeMathUtils,
  getBackSide,
  getDoubleSide
}; 