import type { NextConfig } from "next";

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
    // Simplified webpack configuration for Three.js
    if (!isServer) {
      // Ensure optimized chunking for Three.js - keep it in a separate vendor chunk
      if (!config.optimization) {
        config.optimization = {};
      }

      if (!config.optimization.splitChunks) {
        config.optimization.splitChunks = { cacheGroups: {} };
      }

      if (!config.optimization.splitChunks.cacheGroups) {
        config.optimization.splitChunks.cacheGroups = {};
      }

      // Single Three.js vendor chunk for all Three.js code
      config.optimization.splitChunks.cacheGroups.three = {
        test: /[\\/]node_modules[\\/](three|@react-three|troika)[\\/]/,
        name: 'three-vendor',
        priority: 10,
        enforce: true,
        chunks: 'all',
      };
    }

    return config;
  },
  // Set experimental features for performance
  experimental: {
    // Disable optimizeCss since we don't have critters installed
    optimizeCss: false,
    optimizePackageImports: ['three'],
  }
};

export default nextConfig;
