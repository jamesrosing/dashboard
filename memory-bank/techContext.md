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