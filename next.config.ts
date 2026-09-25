import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Next defaults this to (cores - 1) = 7 here, so a single build claims
    // almost the whole box. Agents run builds concurrently, so cap it.
    cpus: 2,
  },
};

export default nextConfig;
