import type { Metadata } from "next";
import "./globals.css";
import Footer from "./components/Footer";

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
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
