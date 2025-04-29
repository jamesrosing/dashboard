# Three.js Compatibility Layer

This directory contains files related to Three.js compatibility within our application:

## Files

- **three-compat.ts**: Main compatibility layer that provides constants and classes that have been renamed or removed in Three.js 0.176.0
- **bufferGeometryUtils.ts**: Custom implementation of the Buffer Geometry Utilities
- **COMPATIBILITY_NOTES.md**: Detailed documentation of compatibility issues and solutions

## Purpose

The main purpose of these files is to enable our application to use newer Three.js versions (0.176.0) while supporting dependencies that rely on older Three.js APIs.

## How it Works

1. The `three-compat.ts` file re-exports everything from the standard Three.js library
2. Additionally, it exports constants and classes that were renamed or removed in newer versions
3. Our webpack configuration in `next.config.ts` sets up an alias so that any `import from 'three'` in our application code will use this compatibility layer instead

## Usage

When working with Three.js in our application, you should:

1. Import Three.js normally: `import * as THREE from 'three'`
2. The compatibility layer will be used automatically
3. Use standard Three.js APIs as documented in the Three.js documentation

## When to Update

This compatibility layer should be reviewed and potentially updated when:

1. Upgrading to a newer version of Three.js
2. Adding new dependencies that use Three.js
3. Experiencing unexpected behavior in 3D rendering components

## See Also

For more detailed information about the compatibility issues and how they were resolved, see `COMPATIBILITY_NOTES.md`. 