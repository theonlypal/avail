import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  webpack: (config, { isServer }) => {
    // Externalize server-only modules on the client
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'better-sqlite3': false,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
