import type { Metadata } from "next";
import "./globals.css";
import Footer from "./components/Footer";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL("https://altessimmo.com"), // ton domaine réel
  title: {
    default: "Altessimmo Tétouan, Martil & Cabo Negro - Propriétés d'exception",
    template: "%s | Altessimmo",
  },
  description:
    "Sélection discrète de biens immobiliers rares à Tétouan, Martil et Cabo Negro. Découvrez des propriétés haut de gamme, villas et appartements de prestige avec Altessimmo.",
  keywords: [
    "immobilier Tétouan",
    "immobilier Martil",
    "immobilier Cabo Negro",
    "villa luxe Tétouan",
    "appartement haut standing Martil",
    "achat vente Cabo Negro",
    "investissement Maroc",
    "Altessimmo",
  ],
  authors: [{ name: "Altessimmo", url: "https://altessimmo.com" }],
  creator: "Altessimmo",
  publisher: "Altessimmo",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://tetouan.altessimmo.com",
    siteName: "Altessimmo",
    title: "Altessimmo Tétouan, Martil & Cabo Negro - Propriétés d'exception",
    description:
      "Sélection discrète de biens immobiliers rares à Tétouan, Martil et Cabo Negro. Villas et appartements haut de gamme, pour acheteurs et investisseurs exigeants.",
    images: [
      {
        url: "/og-image.jpg", // image 1200x630 dans /public
        width: 1200,
        height: 630,
        alt: "Altessimmo Tétouan, Martil & Cabo Negro - Immobilier de prestige",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Altessimmo Tétouan, Martil & Cabo Negro - Propriétés d'exception",
    description:
      "Sélection discrète de biens immobiliers rares à Tétouan, Martil et Cabo Negro. Villas et appartements haut standing.",
    creator: "@altessimmo",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "manifest", url: "/site.webmanifest" },
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#5bbad5" },
    ],
  },
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        {/* --- Google Analytics --- */}
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
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
