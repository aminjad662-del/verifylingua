import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: "/order/triage",
        destination: "/translate",
        permanent: false,
      },
      {
        source: "/order/triage/:path*",
        destination: "/translate",
        permanent: false,
      },
      {
        source: "/dashboard/request",
        destination: "/translate",
        permanent: false,
      },
      {
        source: "/dashboard/request/:path*",
        destination: "/translate",
        permanent: false,
      },
    ];
  },
  webpack: (config, { dev, isServer }) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@vercel/turbopack-ecmascript-runtime/browser/dev/hmr-client/hmr-client.ts": path.resolve(
        __dirname,
        "lib/shims/turbopack-hmr-shim.js"
      ),
    };
    return config;
  },
};

export default nextConfig;
