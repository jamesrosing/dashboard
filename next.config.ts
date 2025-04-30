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
      
      // Use our simplified entry module that defines constants before importing
      config.resolve.alias.three = path.resolve(__dirname, 'lib/three/three-entry.ts');
      
      // Ensure optimized chunking for Three.js
      if (!config.optimization) {
        config.optimization = {};
      }
      
      if (!config.optimization.splitChunks) {
        config.optimization.splitChunks = { cacheGroups: {} };
      }
      
      // Ensure Three.js is properly chunked
      if (!config.optimization.splitChunks.cacheGroups) {
        config.optimization.splitChunks.cacheGroups = {};
      }
      
      config.optimization.splitChunks.cacheGroups.three = {
        test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
        name: 'three-vendor',
        priority: 10,
        enforce: true,
        chunks: 'all',
      };
      
      // Ensure our initialize.ts gets bundled first in chunks that use Three.js
      if (!config.module) {
        config.module = { rules: [] };
      }
      
      if (!config.module.rules) {
        config.module.rules = [];
      }
      
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
    // Disable optimizeCss since we don't have critters installed
    optimizeCss: false,
    optimizePackageImports: ['three']
  }
};

export default nextConfig;
