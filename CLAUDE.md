# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A real-time 3D visualization dashboard for tracking and displaying 50-100 entities (drones, vehicles, stationary objects) with near-zero latency. Built with Next.js 15, React 19, Three.js, and Troika framework for optimized 3D rendering.

## Development Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack

# Build & Production
npm run build            # Production build (skips linting, allows type errors)
npm start                # Start production server

# Linting
npm run lint             # Run Next.js linter
```

## Critical Three.js Architecture

This project implements a **custom Three.js initialization system** to prevent "Cannot access before initialization" errors in production builds. This is the most important architectural pattern to understand.

### Three.js Import Order (CRITICAL)

**Always import from the custom entry point:**
```typescript
import * as THREE from 'three';  // This uses lib/three/three-entry.ts via webpack alias
```

**Never import Three.js before initialization:**
- The `lib/three/initialize.ts` module MUST load before any Three.js usage
- Webpack config (next.config.ts:27) aliases 'three' to use our custom entry point
- This pre-initializes critical constants and Object3D stubs in the browser window

### Safe Component Creation Pattern

When creating Three.js components that might run during SSR or before full initialization:

```typescript
// Use safe creators from lib/three/safeCreators.ts
import { safeVector3, safeColor, safeEuler } from '@/lib/three/safeCreators';

// These provide fallback implementations if THREE isn't ready
const position = safeVector3(x, y, z);
const color = safeColor(0xff0000);
```

### SSR Compatibility

All Three.js components must be wrapped with `ClientOnly`:

```typescript
import ClientOnly from '@/app/components/shared/ClientOnly';

<ClientOnly fallback={<div>Loading 3D scene...</div>}>
  <Canvas3D />
</ClientOnly>
```

## State Management Architecture

### Redux Toolkit Store (lib/state/store.ts)

Normalized entity store with the following slices:
- **entitySlice**: Entity data management (add/update/remove entities)
- **entityFilterSlice**: Filtering and grouping logic
- **websocketSlice**: WebSocket connection state

### Entity Data Flow

```
WebSocket → Redux Store → React Components → Troika Facades → Three.js Scene
```

## Troika-Based Rendering System

The application uses **Troika's Object3DFacade pattern** instead of direct Three.js objects:

### EntityFacade Pattern (app/components/visualization/EntityFacade.ts)

All entity visualizations extend `Object3DFacade`:
- Automatic optimization of matrix calculations
- Built-in raycasting support
- Efficient update batching
- Instancing support for similar entity types

```typescript
export class EntityFacade extends Object3DFacade {
  // Entity data drives visual updates
  entityData: Entity | null = null;

  // afterUpdate() lifecycle hook for state changes
  afterUpdate() {
    if (this.entityData) {
      this.updateEntityState();
    }
  }
}
```

### Performance Patterns

1. **Level of Detail (LOD)**: Geometry complexity based on camera distance
2. **Frustum Culling**: Entities outside view are not rendered
3. **Instancing**: Similar entity types share geometry
4. **Batched Updates**: Redux changes trigger single render cycle
5. **Worker Thread Processing**: Heavy calculations offloaded to `lib/workers/`

## Project Structure

```
app/
├── api/websocket/          # WebSocket API route
├── components/
│   ├── visualization/      # 3D rendering components & facades
│   ├── shared/             # Reusable UI components
│   └── Dashboard.tsx       # Main dashboard component

lib/
├── state/                  # Redux Toolkit slices & hooks
├── three/                  # Three.js compatibility layer (CRITICAL)
│   ├── initialize.ts       # Pre-initialization constants
│   ├── three-entry.ts      # Custom Three.js entry point
│   ├── safeCreators.ts     # Safe object creators
│   └── geometries.ts       # Entity geometry definitions
├── workers/                # Web Worker implementations
└── utils.ts                # Utility functions

memory-bank/                # Structured documentation system
├── projectbrief.md         # Core requirements
├── activeContext.md        # Current work focus
├── systemPatterns.md       # Architecture patterns
└── progress.md             # Implementation status
```

## Build Configuration

### next.config.ts Key Settings

- **reactStrictMode: false** - Disabled to prevent Three.js double-initialization issues
- **Webpack alias** - 'three' points to `lib/three/three-entry.ts`
- **Code splitting** - Three.js bundles separately (`three-vendor` chunk)
- **ignoreBuildErrors: true** - Allows production builds with type errors

### TypeScript Configuration

- Paths alias: `@/*` maps to project root
- Target: ES2017 for broad compatibility
- Strict mode enabled for type safety

## Performance Targets

- 60+ FPS with 100+ entities
- 10+ updates/second per entity
- UI responsive < 50ms during peak load
- Linear memory scaling with entity count

## Memory Bank System

This project uses a **structured Memory Bank** for maintaining development context:

- **projectbrief.md** - Core requirements and goals
- **activeContext.md** - Current work focus and next steps
- **systemPatterns.md** - Architecture and design patterns
- **techContext.md** - Technology choices and constraints
- **progress.md** - Implementation status
- **tasks.md** - Task tracking

When working on features, consult these files for context and update them as work progresses.

## Common Issues & Solutions

### "Cannot access before initialization" in Production

This indicates Three.js constants being accessed before initialization:
1. Verify `lib/three/initialize.ts` is importing first
2. Check webpack config hasn't changed the 'three' alias
3. Ensure no direct imports from 'three/src' or 'three/examples'
4. Use safe creators from `lib/three/safeCreators.ts`

### Performance Degradation

1. Check entity count in Redux DevTools
2. Verify frustum culling is active (Canvas3D component)
3. Review LOD settings in geometry definitions
4. Profile with `r3f-perf` (PerformanceMetrics component)

### WebSocket Connection Issues

1. Check WebSocket route: `/api/websocket`
2. Verify connection state in `websocketSlice`
3. Auto-reconnection logic handles temporary failures
4. Protocol Buffers used for efficient serialization

## Testing Approach

- **No test suite configured** - Manual testing via development server
- **Browser DevTools** - Redux DevTools for state inspection
- **Performance Monitoring** - PerformanceMetrics component shows FPS
- **r3f-perf** - Three.js performance profiling

## Deployment

Optimized for **Vercel deployment**:
- Output: `.next` directory
- Node.js 20.x required
- Environment variables with `NEXT_PUBLIC_` prefix for client-side access
- Vercel configuration in `.vercel` directory
