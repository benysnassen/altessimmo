'use client';
import Hero from '../components/Hero';
import { useTranslations } from 'next-intl';
export default function Home() {
  const t = useTranslations('home');

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
             <Hero 
        real_estate={t('real_estate')} 
        discover={t('discover')}
      />
    </div>
  );
}
