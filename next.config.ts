import type { NextConfig } from "next";
import path from 'path';
import fs from 'fs';

// Run the patch script for troika modules
require('./lib/three/patch-troika');

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Add a plugin to make THREE available globally
    if (!isServer) {
      const webpack = require('webpack');
      if (!config.plugins) {
        config.plugins = [];
      }
      
      config.plugins.push(
        new webpack.ProvidePlugin({
          THREE: 'three'
        })
      );
    }

    return config;
  },
};

export default nextConfig;
