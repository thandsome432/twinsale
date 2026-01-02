import type { NextConfig } from "next";

const nextConfig: any = {
  // We deleted the 'eslint' part. Do NOT put it back.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;