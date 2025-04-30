# Dashboard

A real-time 3D visualization dashboard for tracking and displaying entities (drones, vehicles, stationary objects) in a three-dimensional environment.

## Project Overview

The Real-time Multi-Entity Dashboard is a high-performance application designed for monitoring and controlling multiple entities with near-zero latency. It showcases advanced frontend UI/UX development proficiency, with a focus on React, TypeScript, WebGL visualization, and real-time data handling.

### Core Requirements

- Real-time 3D visualization of 50-100 entities
- Near-zero latency for critical operations
- Sophisticated status monitoring with alerts
- Dynamic filtering and grouping capabilities
- Command and control interface with waypoint setting
- High-performance rendering (60+ FPS)

### Why This Project Exists

This dashboard addresses the need for sophisticated monitoring and control of multiple entities with near-zero latency. It serves as a demonstration of advanced frontend development capabilities, particularly in 3D visualization, real-time data handling, and high-performance UI components.

### Problems It Solves

- **Entity Monitoring at Scale**: Visualizes and tracks 50-100 entities simultaneously without performance degradation
- **Real-time Data Visualization**: Presents high-frequency data updates (10+ per second per entity) in an intuitive visual format
- **Command Latency**: Enables near-zero latency control over multiple entities
- **Information Overload**: Organizes complex multi-entity data with filtering, grouping, and intuitive visualization
- **Operational Awareness**: Provides immediate insight into entity status, issues, and spatial relationships
- **Complex Command Execution**: Simplifies the process of managing multiple entities through intuitive controls

## Features

- Real-time tracking and visualization of moving entities
- 3D environment rendering using Three.js
- Entity trajectory visualization
- Animated entity movement with smooth transitions
- Level of Detail (LOD) system for optimized rendering
- Responsive layout with shared components
- Split-Pane Layout with Resizable Containers
- Advanced entity organization with nested tree view
- Performance optimization with frustum culling and selective rendering
- SSR compatibility with ClientOnly component wrapper

## Tech Stack

### Frontend Framework
- **Next.js 15.3.1**: React framework with App Router, optimized client-side rendering, and build optimization
- **React 19**: Latest React version with improved rendering performance and enhanced component lifecycle

### Visualization Technologies
- **Three.js**: WebGL-based 3D library for entity rendering, camera controls, and shader effects
- **React Three Fiber**: React bindings for Three.js with declarative scene creation and React component integration

### State Management
- **Redux Toolkit**: State management with normalized entity store, efficient updates, and DevTools integration
- **Custom State Management**: in `/lib/state` for specific visualization needs

### Real-time Communication
- **WebSockets**: For real-time data with bidirectional communication and auto-reconnection handling
- **Protocol Buffers**: Data serialization with compact binary format and efficient encoding/decoding

### Performance Optimization
- **Web Workers**: For background processing and parallel data processing in `/lib/workers`
- **WebGL Instancing**: For efficient rendering of similar objects and reduced draw calls

## System Architecture

```
dashboard/
├── app/              # Next.js App Router files
├── components/       # React components organized by feature
│   ├── visualization/  # 3D visualization components
│   ├── controls/       # UI controls and panels
│   ├── entities/       # Entity-related components
│   └── shared/         # Shared UI components
├── lib/              # Core utilities and logic
│   ├── state/          # Redux state management
│   ├── websocket/      # WebSocket communication
│   ├── three/          # Three.js utilities and helpers
│   └── workers/        # Web Worker implementations
├── memory-bank/      # Project documentation and context
└── public/           # Static assets
```

## Implementation Approach

The dashboard implements a Troika-based architecture with worker thread support:

1. **Troika Framework**: Provides optimized 3D rendering with automatic handling of matrix calculations and raycasting
   - Efficient Object3D facade pattern for entity representation
   - Instancing support for similar entity types
   - React integration for component-based development

2. **Worker Thread Processing**: Offloading heavy data computations to background threads
   - Spatial indexing for efficient entity queries
   - Trajectory calculations
   - Data processing and filtering

3. **Optimized Data Flow**: 
   ```
   WebSocket → Redux Store → Worker Thread → Entity Facades → Visualization
                           ↓
                     React UI Components
   ```

4. **Performance Strategies**:
   - Entity instancing for similar types
   - Level of Detail (LOD) based on camera distance
   - Batched updates to minimize render calls
   - Efficient memory management with object pooling
   - Frustum culling for entities outside camera view

## Three.js Implementation Notes

The application implements several safety patterns to prevent "Cannot access before initialization" errors in production:

### Safe Component Creation Utilities

```typescript
// Safe Vector3 creation helper function
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
      // Additional methods...
    };
  }
};
```

### Comprehensive Object3D Implementation

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
  // ... more properties and methods
};
```

### MathUtils Implementation

```typescript
// Create MathUtils helper for UUID generation
const MathUtils = {
  generateUUID: function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
  // ... additional utility methods
};
```

### Enhanced Helper Functions

```typescript
// Enhanced helper function with error handling
export function positionToVector3(position: Position): any {
  if (!position) return new (THREE as any).Vector3(0, 0, 0);
  
  try {
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

### Safe Constants Access

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

### SSR Compatibility

```typescript
// ClientOnly.tsx
import { useEffect, useState, ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const ClientOnly = ({ children, fallback = null }: ClientOnlyProps) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return isClient ? <>{children}</> : <>{fallback}</>;
};
```

## Getting Started

### Prerequisites

- Node.js (v20.x or higher recommended)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd dashboard
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Production Build

```bash
npm run build
# or
yarn build
```

## Deployment Considerations

### Vercel Deployment
The application is optimized for deployment on Vercel with the following configuration:
- Output directory: `.next`
- Node.js version: 20.x
- Environment variables configured for production

### Common Issues and Solutions
1. **Missing Environment Variables**
   - Environment variables needed for Three.js rendering must be added to Vercel dashboard
   - Client-side variables must be prefixed with `NEXT_PUBLIC_`

2. **React Three Fiber Integration Issues**
   - Canvas component may need specific configuration for production
   - Proper imports of THREE namespace components are critical

3. **Dependencies Configuration**
   - Three.js and related libraries must be in "dependencies" (not "devDependencies")
   - Peer dependencies should be properly resolved

4. **React Strict Mode Conflicts**
   - Three.js may have compatibility issues with React Strict Mode
   - Consider disabling Strict Mode in production

5. **Client-Side Routing Issues**
   - Add proper redirect rules in `vercel.json` for client-side routing
   - Configure fallbacks for direct URL access

## Performance Targets

- 60+ FPS with 100+ entities in view
- Support for 10+ updates per second per entity
- Total system capable of handling 1000+ updates per second
- UI remains responsive (< 50ms) during peak load
- Memory usage increases linearly with entity count

## Memory Bank

This project utilizes a structured Memory Bank system that maintains context across development sessions through specialized files:

- `projectbrief.md` - Core requirements and goals of the dashboard project
- `productContext.md` - Why this project exists and problems it solves
- `activeContext.md` - Current work focus and next steps
- `systemPatterns.md` - System architecture and design patterns in use
- `techContext.md` - Technologies used and technical constraints
- `progress.md` - Current status and implementation progress
- `tasks.md` - Ongoing and completed tasks

## License

MIT License

Copyright (c) 2025 James Rosing (@jamesrosing)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
