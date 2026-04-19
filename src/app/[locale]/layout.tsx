import type { Metadata, Viewport } from "next";
import "../globals.css";
import Footer from "../components/Footer";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import LanguageSwitcher from "../components/LanguageSwitcher";
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

// Métadonnées internationalisées
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    fr: "Altessimmo Tetouan, Martil & Cabo Negro - Propriétés d'exception",
    en: "Altessimmo Tetouan, Martil & Cabo Negro - Exceptional Properties",
    es: "Altessimmo Tetouan, Martil & Cabo Negro - Propiedades excepcionales",
    ar: "Altessimmo تطوان، مارتيل و كابو نيغرو - عقارات استثنائية"
  };

  const descriptions = {
    fr: "Sélection discrète de biens immobiliers rares à Tetouan, Martil et Cabo Negro. Découvrez des propriétés haut de gamme, villas et appartements de prestige avec Altessimmo.",
    en: "Discreet selection of rare properties in Tetouan, Martil and Cabo Negro. Discover high-end properties, luxury villas and prestigious apartments with Altessimmo.",
    es: "Selección discreta de propiedades exclusivas en Tetouan, Martil y Cabo Negro. Descubra propiedades de alta gama, villas de lujo y apartamentos de prestigio con Altessimmo.",
    ar: "تشكيلة حصرية من العقارات النادرة في تطوان ومارتيل وكابو نيغرو. اكتشف عقارات راقية وفيلات فاخرة وشقق مرموقة مع Altessimmo."
  };

  return {
    metadataBase: new URL("https://tetouan.altessimmo.com"),
    title: {
      default: titles[locale as keyof typeof titles] || titles.fr,
      template: "%s | Altessimmo",
    },
    description: descriptions[locale as keyof typeof descriptions] || descriptions.fr,
    keywords: [
      "immobilier Tetouan",
      "immobilier Martil",
      "immobilier Cabo Negro",
      "villa luxe Tetouan",
      "appartement haut standing Martil",
      "achat vente Cabo Negro",
      "investissement Maroc",
      "Altessimmo",
    ],
    authors: [{ name: "Altessimmo", url: "https://tetouan.altessimmo.com" }],
    creator: "Altessimmo",
    publisher: "Altessimmo",
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
      type: "website",
      locale: locale === 'fr' ? 'fr_FR' : locale === 'en' ? 'en_US' : locale === 'es' ? 'es_ES' : 'ar_AR',
      url: `https://tetouan.altessimmo.com/${locale}`,
      siteName: "Altessimmo",
      title: titles[locale as keyof typeof titles] || titles.fr,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.fr,
      images: [
        {
          url: "/window.svg",
          width: 1200,
          height: 630,
          alt: "Altessimmo Tetouan, Martil & Cabo Negro - Immobilier de prestige",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titles[locale as keyof typeof titles] || titles.fr,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.fr,
      creator: "@altessimmo",
      images: ["/window.svg"],
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

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <head>
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
          <LanguageSwitcher />

          <main>{children}</main>

          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
