import type { NextConfig } from "next";
import { execSync } from "child_process";

// Ensure Prisma Client is generated before Next.js compiles and typechecks
try {
  execSync("npx prisma generate", { stdio: "inherit" });
} catch (error) {
  console.warn("Notice: Prisma Client auto-generation warning:", error);
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
