import { Libre_Baskerville, Inter } from "next/font/google";

/**
 * Polices auto-hébergées par next/font.
 *
 * L'ancien `@import url(fonts.googleapis.com)` en tête de globals.css était
 * supprimé au build par Tailwind v4 : aucune police ne se chargeait en
 * production, et `font-display` retombait sur le serif par défaut du
 * navigateur. next/font sert les fichiers depuis notre propre domaine, donc
 * plus de dépendance à un @import que le bundler peut écarter.
 */
/**
 * Libre Baskerville n'existe qu'en 400 et 700 : demander une graisse plus
 * legere ne produit rien, le navigateur retombe sur 400. Les titres du site
 * utilisent donc `font-normal` et `font-bold`, jamais `font-thin`/`font-light`.
 */
const baskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-baskerville",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

/** À poser sur <html> : expose les variables consommées par @theme. */
export const fontVariables = `${baskerville.variable} ${inter.variable}`;
