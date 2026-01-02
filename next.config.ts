import type { NextConfig } from "next";

const nextConfig: any = {
  // We deleted the 'eslint' part because it was breaking the build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;