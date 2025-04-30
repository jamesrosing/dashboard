# Tech Context: Real-time Multi-Entity Dashboard

## Core Technologies

### Frontend Framework
- **Next.js 15.3.1**: React framework providing:
  - App Router for routing and organization
  - Optimized client-side rendering
  - Build optimization for performance
  - Development tools and hot reloading

### UI Library
- **React 19**: Latest React version with:
  - Improved rendering performance
  - Enhanced component lifecycle
  - Concurrent rendering capabilities
  - Improved hooks system

### Visualization Technologies
- **Three.js**: WebGL-based 3D library for:
  - Entity rendering in 3D space
  - Camera controls and navigation
  - WebGL acceleration and optimization
  - Shader programming and effects

- **React Three Fiber**: React bindings for Three.js:
  - Declarative Three.js scene creation
  - React component-based 3D objects
  - Integration with React component lifecycle
  - Performance optimizations for React + Three.js

### State Management
- **Redux Toolkit**: State management with:
  - Normalized entity store
  - Efficient state updates
  - Middleware for side effects
  - DevTools for debugging

### Real-time Communication
- **WebSockets**: For real-time data:
  - Bidirectional communication
  - Low-latency updates
  - Auto-reconnection handling
  - Binary data support

- **Protocol Buffers**: Data serialization:
  - Compact binary format
  - Efficient encoding/decoding
  - Strict typing for messages
  - Cross-platform compatibility

### Performance Optimization
- **Web Workers**: For background processing:
  - Offloading heavy computation
  - Parallel data processing
  - Freeing main thread for UI

- **WebGL Instancing**: For efficient rendering:
  - Rendering similar objects efficiently
  - Reducing draw calls
  - Optimizing GPU usage

## Development Tools

### Language
- **TypeScript 5**: Static typing for JavaScript:
  - Strong type definitions
  - Enhanced developer tooling
  - Better code documentation and intellisense
  - Improved refactorability

### Development Environment
- **Vite**: Modern build tooling:
  - Fast HMR (Hot Module Replacement)
  - ESM-native development
  - Optimized production builds
  - Plugin ecosystem

- **ESLint 9**: Code linting with Next.js config
- **Jest/Testing Library**: Unit and component testing
- **Cypress**: End-to-end testing

## Technical Constraints

### Performance Requirements
- Must maintain 60fps minimum for up to 100 entities
- UI must remain responsive during high-frequency updates
- Visualization must render smoothly on mid-range hardware
- Memory usage must remain reasonable for long sessions

### Browser Requirements
- Primary support: Chrome, Edge, Firefox (latest 2 versions)
- Secondary support: Safari (latest version)
- WebGL 2.0 support required
- No IE11 support required

### Network Requirements
- Minimum 1Mbps connection for real-time updates
- Must handle intermittent connectivity gracefully
- Reconnection strategy required for connection drops
- Latency display for connection quality awareness

### Compatibility Issues
- Three.js version 0.176.0 has breaking changes from earlier versions
- Some dependencies like Troika require older Three.js constants that were removed
- Need compatibility patches for constants like LinearEncoding (3000), sRGBEncoding (3001)
- Potential hydration issues due to Next.js SSR with client-only Three.js components
- Several compatibility patch files have been removed and consolidated into a single approach

## Development Setup

### Local Environment
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run unit tests
npm run test

# Run E2E tests
npm run cypress
```

### Required Tools
- Node.js 20.x or higher
- npm 10.x or higher
- Git for version control
- Modern browser with WebGL support

## Dependencies Overview

### Core Production Dependencies
- `next`: 15.3.1
- `react`: 19.0.0
- `react-dom`: 19.0.0
- `three`: Latest version
- `@react-three/fiber`: React bindings for Three.js
- `@react-three/drei`: Useful helpers for React Three Fiber
- `@reduxjs/toolkit`: State management
- `react-redux`: React bindings for Redux
- `socket.io-client`: WebSocket client
- `protobufjs`: Protocol Buffers for JavaScript

### Development Dependencies
- `typescript`: 5.x
- `eslint`: 9.x
- `vite`: For fast builds
- `jest`: Unit testing
- `@testing-library/react`: Component testing
- `cypress`: E2E testing
- `@types/three`: TypeScript types for Three.js 

## Deployment Considerations

### Vercel Deployment
The application is deployed on Vercel with the following configuration:
- Output directory: `.next`
- Node.js version: 20.x
- Environment variables configured for production

### Environment Variables
- `NEXT_PUBLIC_API_URL`: API endpoint URL
- `NEXT_PUBLIC_WS_URL`: WebSocket endpoint URL
- `NEXT_PUBLIC_MOCK_DATA`: Enable mock data in production (true/false)

### Scaling Considerations
- WebSocket connections are scaled horizontally
- Static assets are cached at the edge
- API requests use serverless functions with auto-scaling

## Vercel Deployment Troubleshooting for Three.js Applications

### Common Issues
1. **Missing Environment Variables**
   - Environment variables needed for Three.js rendering must be added to Vercel dashboard
   - Client-side variables must be prefixed with `NEXT_PUBLIC_`
   - Ensure variables are enabled for all environments (Production, Preview, Development)

2. **React Three Fiber Integration Issues**
   - Errors like "Link is not part of the THREE namespace! Did you forget to extend?"
   - Canvas component may need specific configuration for production
   - Proper imports of THREE namespace components are critical

3. **Dependencies Configuration**
   - Three.js and related libraries must be in "dependencies" (not "devDependencies")
   - Peer dependencies should be properly resolved

4. **React Strict Mode Conflicts**
   - Three.js may have compatibility issues with React Strict Mode
   - Consider disabling Strict Mode in production:
     ```js
     // next.config.js
     const nextConfig = {
       reactStrictMode: false,
       // other config
     };
     module.exports = nextConfig;
     ```

5. **Client-Side Routing Issues**
   - Add proper redirect rules in `vercel.json` for client-side routing
   - Configure fallbacks for direct URL access

### Troubleshooting Steps
1. Check browser console for specific error messages
2. Verify all environment variables in Vercel dashboard
3. Review dependencies in package.json
4. Check for React Three Fiber compatibility issues
5. Implement proper error boundaries around Three.js components
6. Use ClientOnly wrapper for Three.js components to prevent SSR issues

### Performance Optimization for Production
1. Enable code splitting for Three.js components
2. Implement dynamic imports for large Three.js modules
3. Optimize 3D models and textures for production
4. Configure proper caching headers for static assets
5. Use CDN for large model or texture files

## Technical Debt and Limitations

### Known Issues
- Limited browser compatibility with older browsers
- Performance degradation with >500 entities
- Mobile device performance varies significantly

### Future Improvements
- WebGL 2.0 optimizations for performance
- WebAssembly for computation-intensive tasks
- OffscreenCanvas for improved worker thread rendering
- GPU-based particle systems for large entity counts 

## Three.js Compatibility

### Consolidated Compatibility Approach

We've implemented a comprehensive compatibility solution to handle various Three.js version issues:

```typescript
// lib/three/troika-compat-patch.ts
/**
 * Consolidated compatibility module for Three.js and Troika
 * 
 * This file provides all necessary constants, classes, and patches
 * to ensure compatibility between Three.js, React Three Fiber, and Troika.
 * 
 * It consolidates multiple compatibility files into a single source of truth.
 */

// Add missing constants removed in Three.js r152
export const LinearEncoding = 3000;
export const sRGBEncoding = 3001;
export const NoToneMapping = 0;

// Apply patches at application initialization
export function applyThreeCompatibilityPatches() {
  if (typeof window !== 'undefined') {
    (window as any).THREE = {
      ...THREE,
      LinearEncoding,
      sRGBEncoding,
      NoToneMapping,
    };
  }
  return true;
}
```

This consolidated approach replaces multiple separate compatibility files:
- `lib/three/three-compat.ts`
- `lib/three/three-patch.js`
- `lib/three/patch-troika.js`
- `app/utils/three-patch-global.ts`

All compatibility constants, classes, and utilities are now in a single location, making maintenance and updates simpler.

### Three.js Initialization Safety Pattern

To address production build issues where Three.js objects are accessed before they're fully initialized ("Cannot access 'o', 'l', 'C' before initialization" errors), we've implemented a robust pattern:

1. **Proper Inheritance Hierarchy Implementation**
```typescript
// First define EventDispatcher for inheritance
if (!(window as any).THREE.EventDispatcher) {
  (window as any).THREE.EventDispatcher = function() {};
  (window as any).THREE.EventDispatcher.prototype = {
    constructor: (window as any).THREE.EventDispatcher,
    addEventListener: function() { return this; },
    hasEventListener: function() { return false; },
    removeEventListener: function() { return this; },
    dispatchEvent: function() { return this; }
  };
}

// Create Object3D with proper inheritance
(window as any).THREE.Object3D = function() {
  // Properties initialization
  // ...
};

// Inherit from EventDispatcher
(window as any).THREE.Object3D.prototype = Object.create((window as any).THREE.EventDispatcher.prototype);
(window as any).THREE.Object3D.prototype.constructor = (window as any).THREE.Object3D;

// Group inherits from Object3D
(window as any).THREE.Group.prototype = Object.create((window as any).THREE.Object3D.prototype);
(window as any).THREE.Group.prototype.constructor = (window as any).THREE.Group;
```

2. **Comprehensive Object3D Implementation**
```typescript
// CRITICAL: Object3D stub implementation
constants.Object3D = function() {
  this.isObject3D = true;
  this.id = Math.floor(Math.random() * 100000);
  this.uuid = constants.MathUtils.generateUUID();
  this.name = '';
  this.type = 'Object3D';
  this.parent = null;
  this.children = [];
  this.up = { x: 0, y: 1, z: 0, isVector3: true };
  this.position = { x: 0, y: 0, z: 0, isVector3: true };
  this.rotation = { x: 0, y: 0, z: 0, order: 'XYZ', isEuler: true };
  this.quaternion = { x: 0, y: 0, z: 0, w: 1, isQuaternion: true };
  this.scale = { x: 1, y: 1, z: 1, isVector3: true };
  this.modelViewMatrix = { elements: [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1], isMatrix4: true };
  this.normalMatrix = { elements: [1,0,0, 0,1,0, 0,0,1], isMatrix3: true };
  this.matrix = { elements: [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1], isMatrix4: true };
  this.matrixWorld = { elements: [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1], isMatrix4: true };
  this.matrixAutoUpdate = true;
  this.matrixWorldNeedsUpdate = false;
  this.layers = { mask: 1 };
  this.visible = true;
  this.castShadow = false;
  this.receiveShadow = false;
  this.frustumCulled = true;
  this.renderOrder = 0;
  this.userData = {};
  this.listeners = {};
  
  // Apply EventDispatcher properties
  constants.EventDispatcher.call(this);
  
  // Method implementations for add, remove, traverse, etc.
  this.add = function(object) { 
    // Full implementation with proper child/parent handling
    // ...
  };
  this.remove = function(object) {
    // Full implementation with proper child/parent handling
    // ...
  };
  // Additional methods...
};
```

3. **Safe Component Creation Utilities**
```typescript
// Safe Vector3 creation helper function to prevent initialization errors
const safeVector3 = (x: number, y: number, z: number): any => {
  try {
    return new (THREE as any).Vector3(x || 0, y || 0, z || 0);
  } catch (e) {
    // Fallback if THREE.Vector3 is not available
    return {
      x: x || 0,
      y: y || 0,
      z: z || 0,
      isVector3: true,
      copy: function(v: any) { 
        this.x = v.x; this.y = v.y; this.z = v.z; 
        return this; 
      },
      equals: function(v: any) {
        return this.x === v.x && this.y === v.y && this.z === v.z;
      },
      // Additional methods...
    };
  }
};
```

4. **MathUtils Implementation to Prevent Circular References**
```typescript
// Create MathUtils helper for UUID generation
const MathUtils = {
  generateUUID: function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
  clamp: function(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  },
  lerp: function(x: number, y: number, t: number) {
    return (1 - t) * x + t * y;
  },
  DEG2RAD: Math.PI / 180,
  RAD2DEG: 180 / Math.PI
};
```

5. **Enhanced Helper Functions**
```typescript
// Enhanced helper function with error handling
export function positionToVector3(position: Position): any {
  // Null check as first line of defense
  if (!position) return new (THREE as any).Vector3(0, 0, 0);
  
  try {
    // Primary implementation
    return new (THREE as any).Vector3(
      position.x || 0,
      position.y || 0,
      position.z || 0
    );
  } catch (e) {
    // Fallback object with identical interface
    return {
      x: position.x || 0,
      y: position.y || 0,
      z: position.z || 0,
      isVector3: true,
      // Methods implemented to match THREE.Vector3
    };
  }
}
```

6. **Safe Constants Access**
```typescript
// Safe constant access function
const getBackSide = (): any => {
  try {
    return (THREE as any).BackSide;
  } catch (e) {
    return 1; // Known constant value for BackSide
  }
};
```

This comprehensive approach ensures Three.js objects and their prototype chains are properly established before they're accessed during initialization, preventing the "Cannot access 'o', 'l', 'C' before initialization" errors in production builds. By creating the complete inheritance hierarchy early in the initialization process, we ensure all required classes and their relationships are properly defined at the right time.

### Performance Optimization

We've implemented several performance optimizations for handling large entity counts:

1. **Frustum Culling**: Entities outside the camera's view frustum are now culled to reduce rendering overhead:
   ```typescript
   // Update frustum for culling test
   projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
   frustum.setFromProjectionMatrix(projScreenMatrix);
   
   // Perform frustum culling
   const visible = entities.filter(entity => {
     // Create a bounding sphere for this entity
     const boundingSphere = new THREE.Sphere(position, radius);
     
     // Test if the entity is in view frustum
     return frustum.intersectsSphere(boundingSphere);
   });
   ```

2. **Level of Detail (LOD)**: Entities use different geometry and material complexity based on distance:
   ```typescript
   // Update LOD based on distance
   if (distance > 5000 && currentLOD !== 2) {
     setCurrentLOD(2); // Low detail
   } else if (distance > 1000 && distance <= 5000 && currentLOD !== 1) {
     setCurrentLOD(1); // Medium detail
   } else if (distance <= 1000 && currentLOD !== 0) {
     setCurrentLOD(0); // High detail
   }
   ```

3. **Selective Trajectory Rendering**: Trajectories are only calculated for important/visible entities:
   ```typescript
   // If showing all trajectories, limit to a reasonable number
   if (showAllTrajectories) {
     // Take at most 30 entities for all trajectories to avoid overwhelming the GPU
     const maxEntities = Math.min(entities.length, 30);
     setEntitiesWithTrajectories(entities.slice(0, maxEntities));
   } else {
     // Only show trajectory for selected entity
     const selectedEntity = entities.find(e => e.id === selectedEntityId);
     setEntitiesWithTrajectories(selectedEntity ? [selectedEntity] : []);
   }
   ```

4. **Frame-based Update Frequency**: Entities are updated at different frequencies based on distance:
   ```typescript
   const UPDATE_FREQUENCY = {
     HIGH_DETAIL: 1,      // Update every frame
     MEDIUM_DETAIL: 2,    // Update every 2 frames
     LOW_DETAIL: 5,       // Update every 5 frames
     VERY_FAR: 10         // Update every 10 frames
   };
   ```

### Performance Monitoring

We've added comprehensive performance monitoring:

1. **PerformanceMetrics Component**: A new component that visualizes:
   - FPS counter with color coding
   - Entity count statistics
   - Memory usage tracking (Chrome only)
   - Type-specific entity breakdowns

2. **StatusBar Integration**: The status bar now shows real-time FPS and can expand to show detailed metrics.

### SSR Compatibility Best Practices

For server-side rendering compatibility with Three.js:

1. Use the `ClientOnly` wrapper component for all Three.js elements
2. Implement explicit browser detection with `typeof window !== 'undefined'`
3. Use safe useEffect guards to prevent server-side execution
4. Defer Three.js initialization until after hydration
5. Use compatibility constants for missing Three.js values 