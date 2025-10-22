'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import { Globe } from 'lucide-react';
import Flag from 'react-world-flags';

const languages: Record<string, { code: string }> = {
  fr: { code: 'FR' },
  en: { code: 'US' },
  es: { code: 'ES' },
  ar: { code: 'MA' },
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (newLocale: string) => {
    setOpen(false);
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div ref={containerRef} className="fixed top-6 right-6 z-50">
      <div className="flex items-center transition-all duration-500">
        {/* Globe Button */}
        <button
          onClick={() => setOpen(!open)}
          aria-haspopup="true"
          aria-expanded={open}
          aria-label="Changer de langue"
          className={`bg-white/5 border border-white/10 p-2 ml-5 rounded-xl backdrop-blur hover:bg-white/10 transition-transform duration-500 ${
            open ? '-translate-x-4' : 'translate-x-0'
          }`}
        >
          <Globe size={22} strokeWidth={1.5} className="text-white" />
        </button>

        {/* Flags inline */}
        <div
          className={`
            flex items-center gap-2
            transition-all duration-900
            ${open ? 'opacity-100 scale-100 max-w-[300px]' : 'opacity-0 scale-95 max-w-0 overflow-hidden'}
          `}
        >
          {routing.locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleChange(loc)}
              className={`transition-transform hover:scale-110 border-2 rounded-md ${
                locale === loc ? 'border-white' : 'border-transparent'
              }`}
              aria-label={loc}
            >
              <Flag
                code={languages[loc].code}
                style={{ width: 21, height: 15, display: 'block' }}
                alt={`${loc} flag`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
