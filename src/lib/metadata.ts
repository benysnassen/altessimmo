import type { Metadata } from "next";

type LocaleMetadata = {
  title: string;
  description: string;
};

const metadata: Record<string, LocaleMetadata> = {
  fr: {
    title: "Altessimmo Tétouan, Martil & Cabo Negro - Immobilier de Confiance et de Qualité",
    description: "Sélection de propriétés de qualité à Tétouan, Martil et Cabo Negro. Villas, appartements et terrains. Confiance, transparence et accompagnement complet.",
  },
  en: {
    title: "Altessimmo Tétouan, Martil & Cabo Negro - Trusted Quality Real Estate",
    description: "Selected quality properties in Tétouan, Martil and Cabo Negro. Villas, apartments and land. Trust, transparency and full guidance.",
  },
  es: {
    title: "Altessimmo Tétouan, Martil & Cabo Negro - Inmobiliaria de confianza y calidad",
    description: "Propiedades de calidad cuidadosamente seleccionadas en Tétouan, Martil y Cabo Negro. Villas, apartamentos y terrenos. Confianza, transparencia y acompañamiento completo.",
  },
  ar: {
    title: "Altessimmo تطوان، مارتيل و كابو نيغرو - عقارات ثقة وجودة",
    description: "عقارات ذات جودة مختارة بعناية في تطوان ومارتيل وكابو نيغرو. فيلات وشقق وأراضي. ثقة، شفافية ومرافقة كاملة.",
  },
};

export function getLocalizedMetadata(locale: string): Metadata {
  const { title, description } = metadata[locale] || metadata.fr;

  const baseUrl = 'https://tetouan.altessimmo.com';
  const imageUrl = `${baseUrl}/og-image-altessimmo.png`;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: "%s | Altessimmo",
    },
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        fr: '/fr',
        en: '/en',
        es: '/es',
        ar: '/ar',
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}`,
      siteName: 'Altessimmo',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/png', // 👈 AJOUTE CETTE LIGNE
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
