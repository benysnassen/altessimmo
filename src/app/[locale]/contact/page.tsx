import { Suspense } from 'react';
import ContactForm from '../../components/ContactForm';
import { Metadata } from 'next';
import { getLocalizedMetadata } from '@/lib/metadata';
import { zonesBrandLabel, zonesProseFr, zonesProseEn, zonesProseAr } from '@/config/site';

type Props = {
  params: Promise<{ locale: string }>;
};

// Titres/descriptions propres à la page ; le reste (baseUrl, OG, twitter,
// alternates, keywords) vient de getLocalizedMetadata pour éviter le doublon.
const contactTitles: Record<string, string> = {
  fr: `Contact - Altessimmo ${zonesBrandLabel} | Acheter ou vendre`,
  en: `Contact - Altessimmo ${zonesBrandLabel} | Buying or selling`,
  ar: `اتصل بنا - Altessimmo ${zonesProseAr} | شراء أو بيع`,
};

const contactDescriptions: Record<string, string> = {
  fr: `Acheter ou vendre à ${zonesProseFr} : décrivez votre projet en une minute, nous vous rappelons. Sans engagement.`,
  en: `Buying or selling in ${zonesProseEn}: describe your project in a minute and we call you back. No commitment.`,
  ar: `شراء أو بيع في ${zonesProseAr}: صف مشروعك في دقيقة وسنتصل بك. دون أي التزام.`,
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return getLocalizedMetadata(locale, {
    path: '/contact',
    title: contactTitles[locale] ?? contactTitles.fr,
    description: contactDescriptions[locale] ?? contactDescriptions.fr,
    imageAlt: `Altessimmo ${zonesBrandLabel} - Contact`,
  });
}


export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black">

      <Suspense fallback={<div>Chargement du formulaire...</div>}>
        <ContactForm />
      </Suspense>
    </div>
  );
}

