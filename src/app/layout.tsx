import type { Metadata } from "next";
import "./globals.css";
import Footer from "./components/Footer";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Altessimmo Tétouan - Propriétés d'exception",
  description: "Sélection discrète de biens immobiliers rares à Tétouan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        {/* Script pour Google Analytics */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX`} // Remplace par ton ID
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-VDNN5GYFNP'); 
            `,
          }}
        />

        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

