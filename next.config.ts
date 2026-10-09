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

// Automatically run Cloudflare Pages artifact assembly after next build finishes,
// ensuring `dist/` is always populated even if Cloudflare runs `npx next build` directly.
if (process.argv.some((arg) => arg.includes("build"))) {
  let assembled = false;
  const triggerAssembly = () => {
    if (assembled) return;
    try {
      const fs = require("fs");
      const path = require("path");
      const serverApp = path.join(process.cwd(), ".next", "server", "app");
      if (fs.existsSync(serverApp)) {
        assembled = true;
        const scriptPath = path.join(process.cwd(), "scripts", "build-cloudflare.js");
        if (fs.existsSync(scriptPath)) {
          const mod = require(scriptPath);
          if (typeof mod.assembleCloudflareAssets === "function") {
            mod.assembleCloudflareAssets();
          }
        }
      }
    } catch (err) {
      console.warn("Cloudflare auto-assembly notice:", err);
    }
  };

  process.on("beforeExit", triggerAssembly);
  process.on("exit", triggerAssembly);
}

export default nextConfig;


