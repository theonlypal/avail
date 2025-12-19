import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Mark better-sqlite3 as external to prevent bundling the native module
  // This is needed because Railway uses Postgres, not SQLite
  serverExternalPackages: ['better-sqlite3'],
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

    // Mark better-sqlite3 as external on server too
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('better-sqlite3');
      }
    }

    return config;
  },
};

export default nextConfig;
