import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
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
      
      // Add alias for Three.js - updated to use the .ts file
      config.resolve.alias.three = path.resolve(__dirname, 'lib/three/three-compat.ts');
      
      // Important: Don't apply the alias for modules in node_modules
      // This lets @react-three/drei use the original three module
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

    return config;
  },
};

export default nextConfig;
