import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix for Docker on Windows hot-reloading
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,   // Check for changes every second
      aggregateTimeout: 300,
    }
    return config
  },
};

export default nextConfig;