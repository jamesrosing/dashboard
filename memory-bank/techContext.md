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
- 60+ FPS with 100+ entities in view
- Support for 10+ updates per second per entity
- Total system capable of handling 1000+ updates per second
- UI remains responsive (< 50ms) during peak load
- Memory usage increases linearly with entity count

### Browser Requirements
- WebGL 2.0 support required
- Modern browsers with ES2020+ support
- Hardware acceleration recommended
- Minimum of 4GB RAM, 2GHz dual-core processor

### Network Requirements
- Stable WebSocket connection
- Bandwidth for frequent small updates
- Low-latency connection preferred
- Graceful degradation during connection issues

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