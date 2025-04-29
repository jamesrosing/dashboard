# Active Context: Dashboard

## Current Work Focus
- Implementing the Real-time Multi-Entity Dashboard using Troika-based architecture with worker thread support
- Building core visualization and entity management features
- Establishing performance-optimized architecture using Troika and worker threads

## Recent Changes
- Implemented custom `BufferGeometryUtils` for efficient geometry operations
- Defined entity data model and state management structure
- Set up worker thread infrastructure for data processing
- Adopted Troika-based architecture for optimized 3D rendering

## Next Steps
1. **Core Visualization Engine (Phase 1)**
   - Integrate Troika with Canvas3D and basic scene
   - Establish entity facade pattern
   - Complete WebSocket integration for real-time updates
   - Leverage Troika's optimization features

2. **Performance Optimization**
   - Complete worker thread implementation for data processing
   - Add instancing for similar entity types
   - Benchmark with 100+ entities
   - Optimize update frequency and batching

3. **Entity Management & Monitoring (Phase 2)**
   - Implement status visualization system
   - Create entity selection and inspection tools
   - Build filtering and grouping capabilities
   - Implement trajectory visualization

4. **Advanced Features (Phase 3)**
   - Develop advanced filtering and grouping system
   - Implement command and control interface
   - Create alert and notification system
   - Add geofencing and spatial awareness tools
   - Implement terrain visualization

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
Continue implementing the core visualization engine using the Troika-based architecture. Develop a proof-of-concept implementation to validate Troika's performance with our specific requirements before committing to the full implementation. Focus on integrating the worker thread system with the visualization engine. 