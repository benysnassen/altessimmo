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
import { site, zonesBrandLabel, zonesProseFr, zonesProseEn, zonesProseAr, districtsProseFr, districtsProseEn, seoKeywords } from "@/config/site";
import { fontVariables } from "@/lib/fonts";
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
  fr: `Altessimmo ${zonesBrandLabel} - Villas, appartements et terrains`,
  en: `Altessimmo ${zonesBrandLabel} - Villas, apartments and land`,
  ar: `Altessimmo ${zonesProseAr} - فيلات وشقق وأراضٍ`,
};

const descriptions = {
  fr: `Villas, appartements et terrains à ${zonesProseFr} : ${districtsProseFr}. Un seul interlocuteur, du premier appel à la signature.`,
  en: `Villas, apartments and land in ${zonesProseEn}: ${districtsProseEn}. One person to talk to, from the first call to signing.`,
  ar: `فيلات وشقق وأراضٍ في ${zonesProseAr}. محاور واحد، من أول اتصال حتى التوقيع.`,
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
          alt: `Altessimmo ${zonesBrandLabel} - Villas, appartements et terrains`,
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
      // Le .ico est deja emis par la convention `src/app/favicon.ico`.
      icon: [{ url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" }],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
      other: [{ rel: "manifest", url: "/site.webmanifest" }],
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
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={fontVariables}>
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
