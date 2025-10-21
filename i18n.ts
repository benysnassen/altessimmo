// i18n.ts
export const locales = ['fr', 'en', 'es', 'ar'] as const;
export const defaultLocale = 'fr';

export type Locale = (typeof locales)[number];
