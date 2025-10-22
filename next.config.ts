import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@prisma/client'],
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  i18n: {
    locales: ['fr', 'en', 'es', 'ar'],
    defaultLocale: 'fr',  // <--- Ici, on définit français par défaut
  }
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
