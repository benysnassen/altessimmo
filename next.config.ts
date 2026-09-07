import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import { site } from './src/config/site';

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
    ...(process.env.NEXT_ALLOWED_DEV_ORIGIN ? [process.env.NEXT_ALLOWED_DEV_ORIGIN] : []),
  ],
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  // L'ancien domaine reste servi par ce projet : on renvoie tout vers Rabat
  // pour que les liens déjà partagés ne tombent pas en 404.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'tetouan.altessimmo.com' }],
        destination: `${site.baseUrl}/:path*`,
        permanent: true,
      },
      // La locale es a ete retiree. Sans ces regles le middleware next-intl
      // prend "es" pour un segment et renvoie vers /fr/es/*, donc en 404.
      { source: '/es', destination: '/fr', permanent: true },
      { source: '/es/:path*', destination: '/fr/:path*', permanent: true },
    ];
  }
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
