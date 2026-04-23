import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@prisma/client'],
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  allowedDevOrigins: [
    'localhost:3000',
    '127.0.0.1:3000',
    '28bb-105-155-59-58.ngrok-free.app',
    ...(process.env.NEXT_ALLOWED_DEV_ORIGIN ? [process.env.NEXT_ALLOWED_DEV_ORIGIN] : []),
  ],
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  }
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);