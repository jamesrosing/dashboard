# Active Context: Dashboard Visualization System

## Current Project Focus

We are implementing a high-performance 3D visualization system for a real-time dashboard that displays and manages various entity types (drones, vehicles, stationary objects) in a three-dimensional environment. The visualization system now leverages Three.js for rendering with a focus on efficient instancing and performance optimization.

Current focus areas include:

1. **Enhanced UI Layout Architecture**: Implementing a Split-Pane Layout with Resizable Containers to provide a more flexible and powerful dashboard experience while maintaining a predictable structure.

2. **Trajectory and Animation Enhancement**: Refining the trajectory visualization system and entity animation to provide smooth movement and clear path visualization for entities.

3. **Advanced Entity Organization**: Developing a nested entity tree view organized by entity type with enhanced filtering capabilities and status visualization.

## Recent Implementations

### 1. ClientOnly wrapper for SSR compatibility

We have successfully implemented a ClientOnly wrapper component to handle hydration issues with Three.js components:

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

export default ClientOnly;
```

This component is now used to wrap all Three.js elements, ensuring they only render on the client side:

```tsx
<div className="absolute inset-0 w-full h-full bg-gradient-to-b from-black to-gray-900">
  <ClientOnly fallback={
    <div className="flex items-center justify-center h-full">
      <div className="text-gray-400">Initializing 3D view...</div>
    </div>
  }>
    <Canvas shadows gl={{ antialias: true }}>
      <fog attach="fog" args={['#050508', 100, 350]} />
      <EntityWorldScene onFpsChange={onFpsChange} />
    </Canvas>
  </ClientOnly>
</div>
```

### 2. Trajectory Visualization System

We've enhanced the trajectory visualization system with:

- Safe handling of entity trajectory data with proper validation
- Improved animation effects for trajectory lines
- Optimization for rendering performance
- Browser compatibility checks for SSR scenarios
- Proper error handling for edge cases
- Toggling ability to show trajectories for all entities or just selected ones

The implementation uses the `@react-three/drei` Line component with custom animations:

```tsx
// Ensure valid points arrays with minimum two distinct points
const validPastPoints = useMemo(() => ensureValidPoints(pastPoints), [pastPoints]);
const validFuturePoints = useMemo(() => ensureValidPoints(futurePoints), [futurePoints]);

// Skip animations during SSR
useFrame(({ clock }) => {
  if (!isBrowser) return;
  
  // Animation effects for trajectory lines
  // ...
});
```

### 3. Entity Animation Implementation

We've created an `AnimatedEntityMovement` component that handles:

- Smooth position transitions using lerp interpolation
- Proper rotation based on movement direction
- Type-specific animation behavior (e.g., different for drones vs vehicles)
- Performance optimizations for distant entities
- Client-side only execution for SSR compatibility

```tsx
// Animation loop for entity movement
useFrame((_, delta) => {
  if (!groupRef.current) return;
  
  // Only animate moving entities
  if (entity.type !== 'stationary') {
    // Smoothly interpolate position with lerp
    const newPosition = new THREE.Vector3();
    newPosition.x = THREE.MathUtils.lerp(currentPosition.x, targetPosition.x, settings.positionLerpFactor);
    // ...

    // Calculate rotation based on movement direction
    // ...
  }
});
```

### 4. SSR Hydration Issue Resolution

We've successfully resolved the SSR hydration issues:

- Added ClientOnly wrapper component for Three.js elements
- Implemented safe browser detection with `typeof window !== 'undefined'`
- Added proper useEffect guards for initialization code
- Deferred Three.js canvas initialization until after hydration
- Added type assertions for safely accessing DOM-specific properties
- Fixed "Cannot access 'o' before initialization" errors in Vercel deployment

## Creative Phase Outcomes

We've completed five key creative phases that have defined our implementation approach:

1. **3D Environment Design:** 
   - Selected a stylized topographic environment approach
   - Designed a three-point lighting system (key, fill, rim)
   - Created a visual design with low-poly terrain, atmospheric effects, and dynamic grid
   - Established performance optimization strategy with LOD and efficient rendering
   - Designed a color palette and atmospheric elements for depth perception

2. **Entity Visualization Design:**
   - Selected a stylized iconic representation approach for entities
   - Designed a visual hierarchy with clear type differentiation
   - Created a status visualization system using colored rings and animations
   - Established a comprehensive LOD system with three detail levels
   - Defined performance optimization strategies including instancing

3. **Vehicle Entity Facade Design:**
   - Created a specialized facade for vehicle entities with appropriate geometries
   - Implemented wheel animations and direction indicators
   - Designed status visualization specific to ground vehicles
   - Established three detail levels with progressive simplification
   - Added vehicle-specific color coding and effects

4. **Stationary Entity Facade Design:**
   - Developed a stylized infrastructure model approach
   - Created distinct visual types for different station categories
   - Implemented animated active elements to show operational activity
   - Designed status visualization appropriate for fixed infrastructure
   - Established specialized LOD system for stationary objects

5. **UI Layout Design:**
   - Selected Split-Pane Layout with Resizable Containers
   - Designed ClientOnly wrapper implementation for hydration issues
   - Created panel organization with entity list adjacent to details panel
   - Established collapsible/expandable panel design
   - Designed nested entity tree view organized by type
   - Added panel state persistence approach

## Implementation Plan Status

Based on our Level 3 planning assessment, we are currently in Phase 1 of our implementation plan, focusing on the core entity visualization system. The project has been organized into three key phases:

1. **Phase 1: Core Entity Visualization (90% Complete)** 
   - ✅ Completed EntityWorld component with proper scene setup
   - ✅ Implemented ClientOnly wrapper for SSR compatibility
   - ✅ Added trajectory visualization with safe handling
   - ✅ Created entity animation system with smooth transitions
   - ✅ Resolved SSR hydration issues with Three.js components
   - 🔷 Implementing remaining performance optimizations

2. **Phase 2: Real-time Data Integration (Next)** 
   - WebSocket integration for live entity updates
   - State management optimization for efficient updates
   - Entity selection and interaction capabilities
   - Advanced visualization features for status monitoring

3. **Phase 3: User Interface Components (Final)** 
   - Dashboard layout with responsive design
   - Entity management panels with filtering and sorting
   - Detail views with property editing
   - Command and control interface with waypoint setting

## Active Decisions

1. **Rendering Architecture**
   - Using React Three Fiber for declarative scene management
   - Implementing instanced rendering for efficient entity visualization
   - Using component-based architecture for maintainable code
   - Separating environment and entity rendering for better organization

2. **Entity Visualization Strategy**
   - Using geometry-based visualization with type-specific models
   - Implementing color-coding for entity status
   - Creating efficient position and rotation updates
   - Using Vector3 conversion for Three.js compatibility

3. **State Management Approach**
   - Using Redux Toolkit for centralized state management
   - Implementing normalized entity store with byId and allIds
   - Creating efficient selectors for entity access
   - Adding optimized batch updates for performance

4. **Performance Optimization Strategy**
   - Using instanced rendering for similar entities
   - Implementing LOD system for distance-based detail levels
   - Creating efficient update cycles with React hooks
   - Measuring performance with FPS tracking
   - Adding safe handling for trajectory data with validation

5. **UI Layout Architecture**
   - Implementing Split-Pane Layout with Resizable Containers
   - Making entity details panel directly adjacent to the entities panel
   - Supporting collapsible/expandable panels with minimized states
   - Creating a nested entity tree view organized by type
   - Adding panel state persistence in localStorage

6. **Hydration Strategy**
   - ✅ Created ClientOnly wrapper component for Three.js elements
   - ✅ Implemented consistent state initialization between server and client
   - ✅ Deferred Three.js rendering until after hydration
   - ✅ Added browser detection with typeof window checks
   - ✅ Using safe type assertions for DOM properties

## Current Challenges

1. **TypeScript Integration**
   - ✅ Resolved typing issues for Three.js and React Three Fiber components
   - ✅ Fixed type errors in trajectory and animation components
   - Maintaining type safety in component props
   - Fixing remaining linting errors for cleaner code

2. **Performance with Large Entity Counts**
   - ✅ Implemented LOD system for distance-based detail reduction
   - ✅ Added efficient entity animation system
   - ✅ Created optimized trajectory visualization
   - Optimizing for 100+ entities without performance degradation
   - Adding frustum culling for off-screen entities

3. **Real-time Data Integration**
   - Designing efficient data flow for entity updates
   - Implementing optimized state updates
   - Ensuring UI responsiveness during frequent updates
   - Creating proper WebSocket integration

4. **Hydration Issues**
   - ✅ Resolved "Cannot access 'o' before initialization" errors
   - ✅ Fixed Redux store initialization for consistent server/client rendering
   - ✅ Resolved Three.js component hydration warnings
   - ✅ Added safe initialization for browser-specific code
   - ✅ Created proper loading states during hydration

## Immediate Next Steps

1. **Complete Entity Visualization**
   - Add frustum culling for off-screen entities
   - Add entity type-specific animation effects
   - Optimize memory usage for large entity sets

2. **Add Filtering and Grouping**
   - Implement entity filtering by type and status
   - Create grouping capabilities for collective operations
   - Add saved filter configurations
   - Implement visual distinction for filtered entities

3. **Implement UI Layout Architecture**
   - Create Split-Pane container system
   - Develop resizable and collapsible panels
   - Create nested entity tree view by type
   - Add panel state persistence
   - Implement panel maximization and restore

4. **Prepare for WebSocket Integration**
   - Design WebSocket message protocol
   - Create connection management system
   - Implement message serialization/deserialization
   - Add connection health monitoring

## Implementation Details

1. **SSR Compatibility Components**
   ```tsx
   // ClientOnly.tsx
   const ClientOnly = ({ children, fallback = null }: ClientOnlyProps) => {
     const [isClient, setIsClient] = useState(false);
     
     useEffect(() => {
       setIsClient(true);
     }, []);
     
     return isClient ? <>{children}</> : <>{fallback}</>;
   };
   ```

2. **Entity Movement Animation**
   ```tsx
   // AnimatedEntityMovement.tsx
   const AnimatedEntityMovement: React.FC<AnimatedEntityMovementProps> = ({ 
     entity, 
     children 
   }) => {
     // Animation settings and refs
     // ...
     
     // Animation loop
     useFrame((_, delta) => {
       // Smooth position interpolation
       // Direction-based rotation
       // Type-specific behavior
     });
     
     return (
       <group ref={groupRef} position={positionToVector3(entity.position)}>
         {children}
       </group>
     );
   };
   ```

3. **Trajectory Visualization**
   ```tsx
   // EntityTrajectory.tsx
   const EntityTrajectory: React.FC<EntityTrajectoryProps> = ({ 
     entity, 
     settings
   }) => {
     // Calculate and validate trajectory points
     // ...
     
     return (
       <group>
         {/* Past trajectory line */}
         <Line
           ref={pastLineRef}
           points={validPastPoints}
           color={settings.pastColor}
           lineWidth={settings.width}
           transparent
           opacity={settings.opacity}
         />
         
         {/* Future trajectory line */}
         {settings.showFuture && (
           <Line
             ref={futureLineRef}
             points={validFuturePoints}
             color={settings.futureColor}
             lineWidth={settings.width * 0.8}
             transparent
             opacity={settings.opacity * 0.7}
             dashed={true}
             dashSize={0.5}
             dashScale={10}
           />
         )}
       </group>
     );
   };
   ```

## Current Technical Stack

- **Framework**: Next.js 15.3 with React 19
- **Rendering**: Three.js with React Three Fiber
- **Components**: @react-three/drei for convenience utilities
- **State Management**: Redux Toolkit with normalized stores
- **Styling**: Tailwind CSS for responsive design
- **Performance**: Instanced rendering, custom BufferGeometryUtils

## Implementation Details

1. **Entity Rendering System**
   ```
   EntityWorld
     ├── Environment
     │     ├── Terrain/Ground
     │     ├── Grid
     │     ├── Axes
     │     └── SkyBackground
     │
     └── EntityRenderer (by type)
           ├── DRONE instances
           ├── VEHICLE instances
           └── STATIONARY instances
   ```

2. **State Management**
   ```
   Store
     └── Entities Slice
           ├── byId: Record<id, Entity>
           ├── allIds: string[]
           ├── selectedIds: string[]
           └── filteredIds: string[]
   ```

3. **UI Components**
   ```
   Dashboard
     ├── Header (title, connection status, entity count, FPS)
     ├── Main Content
     │     ├── EntityList Panel
     │     ├── EntityWorld (3D visualization)
     │     └── EntityDetails Panel
     └── Footer (StatusBar)
   ```

4. **Entity Data Model**
   ```
   Entity
     ├── Basic Properties (id, type, position, rotation)
     ├── Status Information (operational, standby, warning, etc.)
     ├── Health Metrics (battery, temperature, etc.)
     ├── Tasks (assigned operations)
     └── Sensors (readings from various sensors)
   ```

## Implementation Progress

We have successfully implemented several core components of the visualization system:

1. **3D Entity Visualization**
   - Created a working EntityWorld component with proper scene setup
   - Implemented the EntityRenderer component using Three.js instanced rendering
   - Established EntityInstance system for efficient entity rendering
   - Implemented a performance monitoring system with FPS tracking

2. **Environment Rendering**
   - Implemented an Environment component with terrain, grid, and skybox
   - Created efficient lighting setup with ambient, directional, and hemisphere lighting
   - Added helper visualizations (grid, axes) for spatial reference
   - Implemented a SkyBackground component for atmosphere

3. **Data Model and State Management**
   - Created a comprehensive entity data model with TypeScript interfaces
   - Implemented Redux store with normalized entity state
   - Added actions for entity management (add, update, remove, select)
   - Created selectors for efficient entity access and filtering

4. **UI Components**
   - Implemented the Dashboard layout with responsive design
   - Created the EntityList component for entity browsing and selection
   - Implemented the EntityDetails component with comprehensive entity information
   - Added StatusBar component for system metrics display

5. **Performance Optimizations**
   - Implemented custom BufferGeometryUtils for efficient geometry operations
   - Created compatibility fixes for Three.js integration
   - Used instanced rendering for similar entity types
   - Established performance monitoring with FPS tracking

## Current Focus
Our current focus is on implementing the high-performance visualization layer for the real-time multi-entity dashboard. This includes:

1. **Core Entity Visualization System**
   - Completing the implementation of the Troika-based entity visualization system
   - Setting up worker thread communication for efficient data processing
   - Implementing all entity facade types based on completed creative phase designs
   - Connecting the visualization layer to the Redux state management system

2. **Entity Representation Strategy**
   - We've completed creative phases for all entity types (drones, vehicles, stationary)
   - The VehicleEntityFacade and StationaryEntityFacade designs implement the stylized iconic representation approach
   - Each entity type has specialized visualization with appropriate LOD and animations
   - All designs emphasize clear status visualization and distinctive appearance

3. **UI Layout Implementation**
   - Implementing the Split-Pane Layout with Resizable Containers from our UI Layout creative phase
   - Creating the ClientOnly wrapper component to solve hydration issues
   - Building nested entity tree view organized by type
   - Adding panel state persistence in localStorage
   - Ensuring consistent state between server and client rendering

4. **Performance Optimization**
   - Implementation of instancing for similar entity types
   - Worker thread data processing to keep the main thread responsive
   - Level of Detail (LOD) system based on distance for all entity types
   - Shared geometry and material usage for efficient rendering

## Recent Work

Recent work has primarily focused on the core visualization architecture:

1. **Foundational Components**
   - Set up core Canvas3D component with Three.js integration
   - Implemented base EntityFacade with shared functionality
   - Created DroneEntityFacade with drone-specific visualization
   - Completed creative phases for all entity types (drone, vehicle, stationary)
   - Designed specialized facades for each entity type with appropriate LOD and animations

2. **Compatibility and Integration**
   - Fixed Three.js compatibility issues with Troika components
   - Implemented webpack module aliasing for cleaner imports
   - Created custom BufferGeometryUtils for Three.js geometry operations
   - Integrated type-safe wrappers for Troika components

## Next Steps

1. **Immediate Tasks**
   - Implement VehicleEntityFacade according to completed creative phase design
   - Implement StationaryEntityFacade according to completed creative phase design
   - Complete EntityWorld component with environment setup
   - Implement entity instancing for performance with large entity counts
   - Create the Split-Pane layout system based on UI Layout creative phase
   - Implement the ClientOnly wrapper component for hydration resolution
   - Develop the nested entity tree view with type-based organization 