import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { site } from "@/config/site";

const title = "Snassen Rabat - Villas, appartements et terrains";
const description =
  "Villas, appartements et terrains à Rabat : Agdal, Hay Riad et Souissi. Un seul interlocuteur, du premier appel à la signature.";

export const metadata: Metadata = {
  metadataBase: new URL(site.baseUrl),
  title,
  description,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "Snassen",
    title,
    description,
    images: [{ url: site.ogImage, width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [site.ogImage],
  },
};

export default function RootPage() {
  redirect("/fr/");
}
