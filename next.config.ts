import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/Wealth-Strategy-Planner',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
