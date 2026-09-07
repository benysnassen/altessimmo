import type { MetadataRoute } from 'next';
import { site } from '@/config/site';
import { routing } from '@/i18n/routing';

/**
 * Routes publiques, hors dashboard/login/api (voir robots.ts).
 * `trailingSlash: true` dans next.config.ts : les URLs se terminent par "/",
 * sinon chaque entrée du sitemap déclencherait une redirection 308.
 */
const publicRoutes = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/biens', changeFrequency: 'daily', priority: 0.9 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.8 },
] as const;

const urlFor = (locale: string, path: string) => `${site.baseUrl}/${locale}${path}/`;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routing.locales.flatMap((locale) =>
    publicRoutes.map(({ path, changeFrequency, priority }) => ({
      url: urlFor(locale, path),
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((alt) => [alt, urlFor(alt, path)])
        ),
      },
    }))
  );
}
