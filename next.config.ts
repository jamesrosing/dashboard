import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
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
    }

    return config;
  },
};

export default nextConfig;
