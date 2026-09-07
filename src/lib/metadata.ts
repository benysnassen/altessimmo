import type { Metadata } from "next";
import {
  site,
  zonesBrandLabel,
  zonesProseFr,
  zonesProseEn,
  zonesProseEs,
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
    title: `Altessimmo ${zonesBrandLabel} - Immobilier de Confiance et de Qualité`,
    description: `Sélection de propriétés de qualité à ${zonesProseFr}. Villas, appartements et terrains. Confiance, transparence et accompagnement complet.`,
  },
  en: {
    title: `Altessimmo ${zonesBrandLabel} - Trusted Quality Real Estate`,
    description: `Selected quality properties in ${zonesProseEn}. Villas, apartments and land. Trust, transparency and full guidance.`,
  },
  es: {
    title: `Altessimmo ${zonesBrandLabel} - Inmobiliaria de confianza y calidad`,
    description: `Propiedades de calidad cuidadosamente seleccionadas en ${zonesProseEs}. Villas, apartamentos y terrenos. Confianza, transparencia y acompañamiento completo.`,
  },
  ar: {
    title: `Altessimmo ${zonesProseAr} - عقارات ثقة وجودة`,
    description: `عقارات ذات جودة مختارة بعناية في ${zonesProseAr}. فيلات وشقق وأراضي. ثقة، شفافية ومرافقة كاملة.`,
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
        es: `/es${path}`,
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
