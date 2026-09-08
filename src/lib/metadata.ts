import type { Metadata } from "next";
import {
  site,
  zonesBrandLabel,
  zonesProseFr,
  zonesProseEn,
  zonesProseAr,
  seoKeywords,
} from "@/config/site";

type LocaleMetadata = {
  title: string;
  description: string;
};

type LocalizedMetadataOptions = {
  /** Chemin de la page, sans la locale. Ex : "/contact". */
  path?: string;
  /** Surcharges page par page ; à défaut, les valeurs du site sont utilisées. */
  title?: string;
  description?: string;
  /** Image OG relative à `baseUrl`. */
  image?: string;
  imageAlt?: string;
};

const metadata: Record<string, LocaleMetadata> = {
  fr: {
    title: `Altessimmo ${zonesBrandLabel} - Villas, appartements et terrains`,
    description: `Villas, appartements et terrains à ${zonesProseFr}. Un seul interlocuteur, du premier appel à la signature.`,
  },
  en: {
    title: `Altessimmo ${zonesBrandLabel} - Villas, apartments and land`,
    description: `Villas, apartments and land in ${zonesProseEn}. One person to talk to, from the first call to signing.`,
  },
  ar: {
    title: `Altessimmo ${zonesProseAr} - فيلات وشقق وأراضٍ`,
    description: `فيلات وشقق وأراضٍ في ${zonesProseAr}. محاور واحد، من أول اتصال حتى التوقيع.`,
  },
};

export function getLocalizedMetadata(
  locale: string,
  options: LocalizedMetadataOptions = {}
): Metadata {
  const base = metadata[locale] || metadata.fr;
  const title = options.title ?? base.title;
  const description = options.description ?? base.description;

  const baseUrl = site.baseUrl;
  const path = options.path ?? '';
  const imagePath = options.image ?? site.ogImage;
  const imageUrl = `${baseUrl}${imagePath}`;
  const imageType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
  const pageUrl = `${baseUrl}/${locale}${path}`;

  return {
    metadataBase: new URL(baseUrl),
    // Un titre de page est absolu : le template "%s | Altessimmo" du layout
    // parent s'y appliquerait sinon, d'où un « | Altessimmo » en double.
    title: options.title
      ? { absolute: options.title }
      : { default: title, template: "%s | Altessimmo" },
    description,
    keywords: seoKeywords,
    alternates: {
      canonical: pageUrl,
      languages: {
        fr: `/fr${path}`,
        en: `/en${path}`,
        ar: `/ar${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'Altessimmo',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: options.imageAlt ?? title,
          type: imageType,
        },
      ],
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}
