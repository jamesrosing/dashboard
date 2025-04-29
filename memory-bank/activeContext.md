# Active Context: Dashboard

## Current Work Focus
- Implementing the Real-time Multi-Entity Dashboard using Troika-based architecture with worker thread support
- Building core visualization and entity management features
- Establishing performance-optimized architecture using Troika and worker threads
- Developing proof-of-concept implementation to validate Troika performance with 100+ entities

## Recent Changes
- Implemented custom `BufferGeometryUtils` for efficient geometry operations
- Defined entity data model and state management structure
- Set up worker thread infrastructure for data processing
- Adopted Troika-based architecture for optimized 3D rendering
- Created detailed implementation plan with concrete next steps

## Next Steps

### Immediate Actions (Next 5 Days)
1. **Troika Setup (Day 1-2)** 
   - Install Troika dependencies (`troika-three-utils`, `troika-three-text`, `react-troika`)
   - Create basic Canvas3D component with scene setup
   - Implement camera controls with OrbitControls

2. **Entity Facade Implementation (Day 3-4)**
   - Create base `EntityFacade` class extending Troika's Object3DFacade
   - Implement entity type-specific facades (Drone, Vehicle, Stationary)
   - Set up instancing for similar entities
   - Connect facades to Redux store for data updates

3. **Worker Thread Integration (Day 5)**
   - Implement message passing between main and worker threads
   - Create data processing functions in worker thread
   - Set up basic spatial indexing
   - Test with synthetic data

### Phase 1: Proof-of-Concept with Troika
1. **Core Visualization Engine**
   - Integrate Troika with Canvas3D and basic scene
   - Establish entity facade pattern
   - Complete WebSocket integration for real-time updates
   - Leverage Troika's optimization features

2. **Performance Optimization**
   - Complete worker thread implementation for data processing
   - Add instancing for similar entity types
   - Benchmark with 100+ entities
   - Optimize update frequency and batching

3. **Technical Validation**
   - Create test harness with configurable entity count (10-1000)
   - Implement FPS counter and performance metrics
   - Test with varied update frequencies
   - Document performance boundaries

### Phase 2: Core Visualization System
1. **Entity Management & Monitoring**
   - Implement status visualization system
   - Create entity selection and inspection tools
   - Build filtering and grouping capabilities
   - Implement trajectory visualization
   - Add raycasting for entity selection

2. **User Interface Foundation**
   - Create responsive dashboard layout
   - Implement resizable panels
   - Build status bar with connection metrics

## Active Decisions and Considerations

### Architecture Decisions
- **Visualization Technology**: Moving forward with Troika-based architecture for optimized 3D rendering
- **Entity Rendering**: Implementing entity facade pattern with Troika for efficient updates
- **State Management**: Leveraging Redux Toolkit for efficient entity tracking (already set up)
- **Real-time Communication**: Implementing WebSockets for near-zero latency updates
- **Performance Optimization**: Using Troika's built-in optimizations and worker threads for data processing

### Technical Considerations
- Ensuring 60+ FPS with 100+ entities visible through Troika's optimization features
- Supporting 10+ updates per second per entity with efficient update batching
- Optimizing memory usage with appropriate data structures and garbage collection strategies
- Implementing efficient spatial queries and filtering via worker threads
- Creating a responsive UI that remains fluid during high data throughput

### Data Flow Architecture
```
WebSocket → Redux Store → Worker Thread → Entity Facades → Visualization
                        ↓
                  React UI Components
```

### Performance Requirements
- Near-zero latency for critical operations
- Efficient rendering for 100+ entities using Troika and instancing
- Resource usage optimization (CPU, GPU, memory)
- Responsive UI regardless of data load
- Scalability to hundreds of data streams

## Troika-based Architecture Benefits
- Automatic optimizations for rendering, matrix calculations, and raycasting
- React integration for familiar component-based development
- Offloading heavy data processing to worker threads
- Full access to Three.js API when needed
- Instancing support for similar entity types

## Current Priority
Focus on implementing the Troika proof-of-concept to validate performance capabilities with 100+ entities. This includes setting up the Troika framework, implementing the entity facade pattern, and integrating the worker thread system with the visualization engine. Benchmark the implementation to ensure it meets the 60+ FPS target with 100+ visible entities before proceeding to the full implementation.

## Risk Management
- **Performance Bottlenecks**: Early performance testing with fallback rendering options if needed
- **Worker Thread Complexity**: Establish clear data ownership boundaries with minimal state transfer
- **WebSocket Stability**: Implement robust reconnection logic and offline capability
- **Memory Management**: Set up centralized resource management and memory profiling 