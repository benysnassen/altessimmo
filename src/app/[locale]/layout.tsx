import type { Metadata, Viewport } from "next";
import "../globals.css";
import Footer from "../components/Footer";
import Script from "next/script";
import Image from "next/image";
import Link from "next/link";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { site, zonesBrandLabel, zonesProseFr, zonesProseEn, zonesProseAr, seoKeywords } from "@/config/site";
type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export function generateViewport(): Viewport {
  return {
    themeColor: "#ffffff",
  };
}

const titles = {
  fr: `Altessimmo ${zonesBrandLabel} - Propriétés d'exception`,
  en: `Altessimmo ${zonesBrandLabel} - Exceptional Properties`,
  ar: `Altessimmo ${zonesProseAr} - عقارات استثنائية`,
};

const descriptions = {
  fr: `Sélection discrète de biens immobiliers rares à ${zonesProseFr}. Découvrez des propriétés haut de gamme, villas et appartements de prestige avec Altessimmo.`,
  en: `Discreet selection of rare properties in ${zonesProseEn}. Discover high-end properties, luxury villas and prestigious apartments with Altessimmo.`,
  ar: `تشكيلة حصرية من العقارات النادرة في ${zonesProseAr}. اكتشف عقارات راقية وفيلات فاخرة وشقق مرموقة مع Altessimmo.`,
};

// Métadonnées internationalisées
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    metadataBase: new URL(site.baseUrl),
    title: {
      default: titles[locale as keyof typeof titles] || titles.fr,
      template: "%s | Altessimmo",
    },
    description: descriptions[locale as keyof typeof descriptions] || descriptions.fr,
    keywords: seoKeywords,
    authors: [{ name: "Altessimmo", url: site.baseUrl }],
    creator: "Altessimmo",
    publisher: "Altessimmo",
    alternates: {
      canonical: `${site.baseUrl}/${locale}`,
      languages: {
        'fr': '/fr',
        'en': '/en',
        'ar': '/ar',
      }
    },
    openGraph: {
      type: "website",
      locale: locale === 'fr' ? 'fr_FR' : locale === 'en' ? 'en_US' : 'ar_AR',
      url: `${site.baseUrl}/${locale}`,
      siteName: "Altessimmo",
      title: titles[locale as keyof typeof titles] || titles.fr,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.fr,
      images: [
        {
          url: site.ogImage,
          width: 1200,
          height: 630,
          alt: `Altessimmo ${zonesBrandLabel} - Immobilier de prestige`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titles[locale as keyof typeof titles] || titles.fr,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.fr,
      creator: "@altessimmo",
      images: [site.ogImage],
    },
    icons: {
      icon: [{ url: "/file.svg", type: "image/svg+xml" }],
      apple: [{ url: "/file.svg", sizes: "180x180", type: "image/svg+xml" }],
      other: [
        { rel: "manifest", url: "/site.webmanifest" },
        { rel: "mask-icon", url: "/file.svg", color: "#5bbad5" },
      ],
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Valider la locale
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  // Signal SEO local : décrit l'agence, sa ville et sa zone de chalandise.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Altessimmo",
    description: descriptions[locale as keyof typeof descriptions] || descriptions.fr,
    url: `${site.baseUrl}/${locale}`,
    image: `${site.baseUrl}${site.ogImage}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.city,
      addressCountry: "MA",
    },
    areaServed: site.zones.map((zone) => ({ "@type": "City", name: zone })),
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.lat,
      longitude: site.geo.lng,
    },
  };

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-VDNN5GYFNP"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-VDNN5GYFNP', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>

      <body>
        <NextIntlClientProvider messages={messages}>
          <Link
            href={`/${locale}`}
            className="fixed top-4 left-4 sm:top-6 sm:left-8 md:top-8 md:left-16 z-50 inline-flex items-center"
            aria-label="Altessimmo - Accueil"
          >
            <Image
              src="/logo-rabat-altessimmo-white.svg"
              alt="Altessimmo Rabat"
              width={284}
              height={49}
              priority
              className="h-6 w-auto sm:h-8 md:h-14"
            />
          </Link>

          <LanguageSwitcher />

          <main>{children}</main>

          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
