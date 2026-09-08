/**
 * Qualification des leads : ce que le formulaire, l'API et la notification
 * Telegram partagent.
 *
 * Aucun pays n'est demande ni stocke : l'indicatif telephonique saisi dans
 * `phone` ("+33|FR|numero") porte deja l'information, on la lit au moment
 * d'ecrire la notification.
 */

export const HORIZONS = ['IMMEDIATE', 'SIX_MONTHS', 'EXPLORING'] as const;
export type Horizon = (typeof HORIZONS)[number];

/** Cle de traduction du libelle d'une echeance. */
export const HORIZON_LABEL_KEYS: Record<Horizon, string> = {
  IMMEDIATE: 'horizon_immediate',
  SIX_MONTHS: 'horizon_six_months',
  EXPLORING: 'horizon_exploring',
};

/**
 * Libelles cote agent — notification Telegram et dashboard. Ils ne sont pas
 * traduits : seul l'admin les lit, et il lit le francais.
 */
export const HORIZON_BADGES: Record<Horizon, { emoji: string; label: string }> = {
  IMMEDIATE: { emoji: '🔥', label: 'Sous 3 mois' },
  SIX_MONTHS: { emoji: '🟠', label: '6 a 12 mois' },
  EXPLORING: { emoji: '⚪️', label: 'Se renseigne' },
};

export function isHorizon(value: unknown): value is Horizon {
  return typeof value === 'string' && (HORIZONS as readonly string[]).includes(value);
}

/** Code pays de l'indicatif choisi : "+33|FR|612345678" donne "FR". */
export function countryFromPhone(phone: unknown): string | null {
  if (typeof phone !== 'string' || !phone.includes('|')) return null;
  const code = phone.split('|')[1] || '';
  return /^[A-Za-z]{2}$/.test(code) ? code.toUpperCase() : null;
}

/**
 * Fuseau principal par indicatif, pour savoir s'il est decent d'appeler.
 * Les pays a plusieurs fuseaux sont dans `AMBIGUOUS_TIMEZONES` : on affiche
 * le fuseau le plus peuple, signale comme approximatif, plutot qu'une heure
 * fausse donnee pour vraie.
 */
export const COUNTRY_TIMEZONES: Record<string, string> = {
  MA: 'Africa/Casablanca',
  FR: 'Europe/Paris',
  ES: 'Europe/Madrid',
  BE: 'Europe/Brussels',
  NL: 'Europe/Amsterdam',
  IT: 'Europe/Rome',
  CA: 'America/Toronto',
  DE: 'Europe/Berlin',
  GB: 'Europe/London',
  US: 'America/New_York',
  AE: 'Asia/Dubai',
  SA: 'Asia/Riyadh',
  DZ: 'Africa/Algiers',
  TN: 'Africa/Tunis',
  EG: 'Africa/Cairo',
  TR: 'Europe/Istanbul',
  RU: 'Europe/Moscow',
  CN: 'Asia/Shanghai',
  JP: 'Asia/Tokyo',
  KR: 'Asia/Seoul',
  IN: 'Asia/Kolkata',
  BR: 'America/Sao_Paulo',
  AR: 'America/Argentina/Buenos_Aires',
  AU: 'Australia/Sydney',
  ZA: 'Africa/Johannesburg',
};

/** Pays couvrant plusieurs fuseaux : l'heure affichee est indicative. */
export const AMBIGUOUS_TIMEZONES = new Set(['US', 'CA', 'RU', 'AU', 'BR', 'ES']);

/** Drapeau emoji derive du code ISO, sans table de correspondance. */
export function countryFlag(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return '🌍';
  return String.fromCodePoint(
    ...code.toUpperCase().split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}
