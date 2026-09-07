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
  fr: `Contact - Altessimmo ${zonesBrandLabel} | Achetez ou vendez un bien d’exception`,
  en: `Contact - Altessimmo ${zonesBrandLabel} | Buy or sell an exceptional property`,
  ar: `اتصل بنا - Altessimmo ${zonesProseAr} | اشترِ أو بع عقاراً استثنائياً`,
};

const contactDescriptions: Record<string, string> = {
  fr: `Vous souhaitez acheter ou vendre une propriété rare à ${zonesProseFr} ? Contactez Altessimmo pour un accompagnement discret et personnalisé.`,
  en: `Looking to buy or sell a rare property in ${zonesProseEn}? Contact Altessimmo for discreet, personalized guidance.`,
  ar: `هل ترغب في شراء أو بيع عقار نادر في ${zonesProseAr}؟ تواصل مع Altessimmo لمرافقة سرية وشخصية.`,
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

