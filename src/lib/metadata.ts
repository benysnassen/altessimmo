import type { Metadata } from "next";

type LocaleMetadata = {
  title: string;
  description: string;
};

const metadata: Record<string, LocaleMetadata> = {
  fr: {
    title: "Altessimmo Tétouan, Martil & Cabo Negro - Propriétés d'exception",
    description: "Sélection discrète de biens immobiliers de qualité à Tétouan, Martil et Cabo Negro. Découvrez des propriétés haut de gamme, villas et appartements avec Altessimmo.",
  },
  en: {
    title: "Altessimmo Tétouan, Martil & Cabo Negro - Exceptional Properties",
    description: "Discreet selection of rare properties in Tétouan, Martil and Cabo Negro. Discover high-end properties, villas and apartments with Altessimmo.",
  },
  es: {
    title: "Altessimmo Tétouan, Martil & Cabo Negro - Propiedades excepcionales",
    description: "Selección discreta de propiedades exclusivas en Tétouan, Martil y Cabo Negro. Descubra propiedades de alta gama, villas de lujo y apartamentos de prestigio con Altessimmo.",
  },
  ar: {
    title: "Altessimmo تطوان، مارتيل و كابو نيغرو - عقارات استثنائية",
    description: "تشكيلة حصرية من العقارات النادرة في تطوان ومارتيل وكابو نيغرو. اكتشف عقارات راقية وفيلات فاخرة وشقق مرموقة مع Altessimmo.",
  },
};

export function getLocalizedMetadata(locale: string): Metadata {
  const { title, description } = metadata[locale] || metadata.fr;
  
  return {
    title: {
      default: title,
      template: "%s | Altessimmo",
    },
    description,
    metadataBase: new URL('https://tetouan.altessimmo.com'), // ← AJOUTE CETTE LIGNE
    alternates: {
      canonical: `https://tetouan.altessimmo.com/${locale}`,
      languages: {
        'fr': '/fr',
        'en': '/en',
        'es': '/es',
        'ar': '/ar',
      }
    },
    openGraph: {
      title,
      description,
      url: `https://tetouan.altessimmo.com/${locale}`,
      siteName: 'Altessimmo',
      images: [
        {
          url: 'https://tetouan.altessimmo.com/images/og-image.png', // ← Peut redevenir relatif avec metadataBase
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://tetouan.altessimmo.com/images/og-image.png'],
    },
  };
}
