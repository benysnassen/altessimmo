import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  // Toutes les locales supportées
  locales: ['fr', 'en', 'ar'],
  
  // Locale par défaut
  defaultLocale: 'fr',
  
  // Stratégie de préfixe : toujours afficher la locale dans l'URL
  localePrefix: 'always',
  
  // Détection automatique de la locale
  localeDetection: false
});

// Navigation helpers typés
export const {Link, redirect, usePathname, useRouter, getPathname} = 
  createNavigation(routing);

export type Locale = (typeof routing.locales)[number];