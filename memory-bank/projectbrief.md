# Project Brief: Real-time Multi-Entity Dashboard

## Project Overview
This is a high-performance, real-time dashboard application designed for monitoring and controlling multiple entities (simulated drones/vehicles) with near-zero latency. The application showcases advanced frontend UI/UX development proficiency, with a focus on React, TypeScript, WebGL visualization, and real-time data handling.

## Core Requirements
- Real-time 3D visualization of 50-100 entities
- Near-zero latency for critical operations
- Sophisticated status monitoring with alerts
- Dynamic filtering and grouping capabilities
- Command and control interface with waypoint setting
- High-performance rendering (60+ FPS)

## Technologies
- Next.js 15.3.1
- React 19
- TypeScript
- Three.js/WebGL for 3D visualization
- Redux Toolkit for state management
- WebSockets for real-time communication
- Web Workers for performance optimization

## Goals
- Demonstrate technical proficiency in complex frontend development
- Create a system capable of handling high-frequency data updates
- Implement advanced 3D visualization with smooth camera controls
- Build a responsive, intuitive UI that remains performant under load
- Achieve near-zero latency for critical operations

## Performance Targets
- 60+ FPS with 100+ entities in view
- Support for 10+ updates per second per entity
- Total system capable of handling 1000+ updates per second
- UI remains responsive (< 50ms) during peak load
- Memory usage increases linearly with entity count

## Development Environment
- Development: `npm run dev` (Next.js dev server with Turbopack)
- Build: `npm run build`
- Start: `npm run start`
- Lint: `npm run lint`

## Target Audience
- Technical evaluators assessing frontend development proficiency
- Drone/vehicle fleet operators requiring real-time monitoring
- Teams managing large numbers of entities requiring visualization

## Scope and Implementation Phases
### Phase 1: Core Visualization Engine
- 3D rendering environment with Three.js/WebGL
- Camera controls and entity rendering
- WebSocket connection infrastructure
- Core state management

### Phase 2: Entity Management & Monitoring
- Entity data model implementation
- Status visualization system
- Selection and inspection tools
- Basic filtering and trajectory visualization

### Phase 3: Advanced Features
- Command and control interface
- Alert and notification system
- Geofencing and terrain visualization
- Advanced filtering and grouping

### Phase 4: Optimization & Polish
- Performance optimization for 60+ FPS
- Memory usage optimization
- Visual polish and UI refinements
- Comprehensive testing 