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
import {
  site,
  zonesBrandLabel,
  zonesProseFr,
  zonesProseEn,
  zonesProseAr,
  districtsProseFr,
  districtsProseEn,
  seoKeywords,
} from "@/config/site";
import { fontVariables } from "@/lib/fonts";

type Locale = (typeof routing.locales)[number];

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const GA_ID = "G-VDNN5GYFNP";

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export function generateViewport(): Viewport {
  return {
    themeColor: "#ffffff",
  };
}

const titles: Record<Locale, string> = {
  fr: `Snassen ${zonesBrandLabel} - Villas, appartements et terrains`,
  en: `Snassen ${zonesBrandLabel} - Villas, apartments and land`,
  ar: `Snassen ${zonesProseAr} - فيلات وشقق وأراضٍ`,
};

const descriptions: Record<Locale, string> = {
  fr: `Villas, appartements et terrains à ${zonesProseFr} : ${districtsProseFr}. Un seul interlocuteur, du premier appel à la signature.`,
  en: `Villas, apartments and land in ${zonesProseEn}: ${districtsProseEn}. One person to talk to, from the first call to signing.`,
  ar: `فيلات وشقق وأراضٍ في ${zonesProseAr}. محاور واحد، من أول اتصال حتى التوقيع.`,
};

// Codes Open Graph : ar_MA plutot que ar_AR, qui n'est pas une locale valide.
const ogLocales: Record<Locale, string> = {
  fr: "fr_FR",
  en: "en_US",
  ar: "ar_MA",
};

// Metadonnees internationalisees.
// Toutes les URLs sont relatives : Next les resout contre metadataBase,
// ce qui garantit des URLs absolues sans redirection pour WhatsApp et les crawlers.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const current = isLocale(locale) ? locale : routing.defaultLocale;

  const title = titles[current];
  const description = descriptions[current];

  return {
    metadataBase: new URL(site.baseUrl),
    title: {
      default: title,
      template: "%s | Snassen",
    },
    description,
    keywords: seoKeywords,
    authors: [{ name: "Snassen", url: site.baseUrl }],
    creator: "Snassen",
    publisher: "Snassen",
    alternates: {
      canonical: `/${current}`,
      languages: {
        fr: "/fr",
        en: "/en",
        ar: "/ar",
        "x-default": `/${routing.defaultLocale}`,
      },
    },
    openGraph: {
      type: "website",
      locale: ogLocales[current],
      alternateLocale: routing.locales
        .filter((l) => l !== current)
        .map((l) => ogLocales[l]),
      url: `/${current}`,
      siteName: "Snassen",
      title,
      description,
      images: [
        {
          url: site.ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@Snassen",
      images: [site.ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
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

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = await getMessages();
  const isRtl = locale === "ar";

  // Signal SEO local : decrit l'agence, sa ville et sa zone de chalandise.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Snassen",
    description: descriptions[locale],
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
    <html lang={locale} dir={isRtl ? "rtl" : "ltr"} className={fontVariables}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <NextIntlClientProvider messages={messages}>
          <Link
            href={`/${locale}`}
            className="fixed top-4 left-4 sm:top-6 sm:left-8 md:top-8 md:left-16 z-50 inline-flex items-center"
            aria-label={`Snassen ${zonesBrandLabel} - ${locale === "en" ? "Home" : "Accueil"}`}
          >
            <Image
              src="/logo-snassen-white.svg"
              alt={`Snassen ${zonesBrandLabel}`}
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

        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
