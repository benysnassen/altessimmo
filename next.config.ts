import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@prisma/client'],
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  }
};

export default nextConfig;
