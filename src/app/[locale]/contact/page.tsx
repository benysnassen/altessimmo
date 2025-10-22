import { Suspense } from 'react';
import ContactForm from '../../components/ContactForm';
import { Metadata } from 'next';


export const metadata: Metadata = {
  title: "Contact - Altessimmo Tétouan, Martil & Cabo Negro | Achetez ou vendez un bien d’exception",
  description:
    "Vous souhaitez acheter ou vendre une propriété rare à Tétouan, Martil ou Cabo Negro ? Contactez Altessimmo pour un accompagnement discret et personnalisé.",
  keywords: [
    "immobilier Tétouan",
    "immobilier Martil",
    "immobilier Cabo Negro",
    "achat villa Tétouan",
    "vente appartement Martil",
    "estimation bien Cabo Negro",
    "Altessimmo",
    "investir Maroc",
    "luxe Tétouan",
  ],
  openGraph: {
    title: "Contact - Altessimmo Tétouan, Martil & Cabo Negro",
    description:
      "Achetez ou vendez un bien d’exception à Tétouan, Martil ou Cabo Negro avec Altessimmo. Estimation et accompagnement discret pour acheteurs et vendeurs.",
    url: "https://tetouan.altessimmo.com/contact",
    siteName: "Altessimmo",
    images: [
      {
        url: "/og-contact.jpg", // image 1200x630 px
        width: 1200,
        height: 630,
        alt: "Altessimmo Tétouan, Martil & Cabo Negro - Contact",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact - Altessimmo Tétouan, Martil & Cabo Negro",
    description:
      "Achetez ou vendez un bien d’exception à Tétouan, Martil ou Cabo Negro avec Altessimmo. Estimation et accompagnement discret.",
    images: ["/og-contact.jpg"],
  },
};


export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black">
      <Suspense fallback={<div>Chargement du formulaire...</div>}>
        <ContactForm />
      </Suspense>
    </div>
  );
}

