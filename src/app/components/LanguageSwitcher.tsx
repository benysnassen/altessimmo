'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import { Globe } from 'lucide-react';
import Flag from 'react-world-flags';

const languages: Record<string, { code: string; name: string }> = {
  fr: { code: 'FR', name: 'Français' },
  en: { code: 'US', name: 'English' },
  es: { code: 'ES', name: 'Español' },
  ar: { code: 'MA', name: 'العربية' },
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fermer au scroll (optionnel, améliore l'UX)
  useEffect(() => {
    const handleScroll = () => setOpen(false);
    if (open) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [open]);

  const handleChange = (newLocale: string) => {
    if (newLocale === locale) {
      setOpen(false);
      return;
    }
    
    setOpen(false);
    // Changement immédiat sans délai
    router.replace(pathname, { locale: newLocale });
  };

  // Langue actuelle en premier
  const orderedLocales = [locale, ...routing.locales.filter(loc => loc !== locale)];

  return (
    <div ref={containerRef} className="fixed top-6 right-6 z-50" dir="ltr">
      <div className="flex items-center gap-3 transition-all duration-500">
        {/* Flags inline (apparaissent à gauche) */}
        <div
          className={`
            flex items-center gap-2
            transition-all duration-500 ease-out
            ${open ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-4 pointer-events-none'}
          `}
        >
          {orderedLocales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleChange(loc)}
              disabled={locale === loc}
              className={`
                relative group
                transition-all duration-300
                hover:scale-110 
                disabled:cursor-default
                ${locale === loc ? 'scale-110' : 'hover:scale-125'}
              `}
              aria-label={languages[loc].name}
              title={languages[loc].name}
            >
              {/* Border effect */}
              <div className={`
                absolute inset-0 rounded-md border-2 transition-all duration-300
                ${locale === loc 
                  ? 'border-white scale-110' 
                  : 'border-transparent group-hover:border-white/50'}
              `} />
              
              {/* Flag */}
              <Flag
                code={languages[loc].code}
                style={{ 
                  width: 24, 
                  height: 16, 
                  display: 'block',
                  borderRadius: '2px'
                }}
                alt={`${languages[loc].name}`}
              />
            </button>
          ))}
        </div>

        {/* Globe Button */}
        <button
          onClick={() => setOpen(!open)}
          aria-haspopup="true"
          aria-expanded={open}
          aria-label="Changer de langue"
          className={`
            bg-white/5 border border-white/10 
            p-2 rounded-xl backdrop-blur-sm
            hover:bg-white/10 hover:border-white/20
            transition-all duration-300
            ${open ? 'bg-white/10 border-white/20 scale-105' : ''}
          `}
        >
          <Globe 
            size={22} 
            strokeWidth={1.5} 
            className={`text-white transition-transform duration-500 ${
              open ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}