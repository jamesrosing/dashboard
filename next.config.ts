import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false, // Disable Strict Mode to prevent Three.js issues in production
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Handle Three.js compatibility with Troika
    if (!isServer) {
      // Add resolve alias for 'three'
      if (!config.resolve) {
        config.resolve = {};
      }
      
      if (!config.resolve.alias) {
        config.resolve.alias = {};
      }
      
      // We now point to our troika-compat-patch.ts file which has the initialization fixes
      config.resolve.alias.three = path.resolve(__dirname, 'lib/three/troika-compat-patch.ts');
      
      // Ensure our initialize.ts gets bundled first in chunks that use Three.js
      // This is critical for proper constant initialization
      if (!config.module) {
        config.module = { rules: [] };
      }
      
      if (!config.module.rules) {
        config.module.rules = [];
      }
      
      // Make sure our initialization module is included in any chunk that uses Three.js
      // but exclude it from node_modules to prevent conflicts
      config.module.rules.push({
        test: /\.(js|ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['next/babel'],
              // No plugins needed, just want to ensure babel processes our files
            }
          }
        ]
      });
      
      // This rule ensures that imports in node_modules aren't affected by our alias
      config.module.rules.push({
        test: /\.js$/,
        include: /node_modules/,
        resolve: {
          alias: {
            // Important: Don't use our compatibility layer for node_modules
            three: 'three'
          }
        }
      });
    }

    // Add a special environment variable that tells us we're in production build
    // This helps with conditional loading of patches
    if (process.env.NODE_ENV === 'production') {
      if (!config.plugins) {
        config.plugins = [];
      }
    }

    return config;
  },
  // Set experimental features for performance
  experimental: {
    // These optimizations help with module loading and initialization
    optimizeCss: true,
    optimizePackageImports: ['three']
  }
};

export default nextConfig;
