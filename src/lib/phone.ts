// src/lib/phone.ts
// Source unique pour tout ce qui touche au telephone.
// Ajouter un pays ici le rend disponible dans TOUS les composants.

export const COUNTRY_OPTIONS = [
  { code: "MA", dialCode: "+212", flag: "🇲🇦", label: "Maroc" },
  { code: "FR", dialCode: "+33",  flag: "🇫🇷", label: "France" },
  { code: "BE", dialCode: "+32",  flag: "🇧🇪", label: "Belgique" },
  { code: "ES", dialCode: "+34",  flag: "🇪🇸", label: "Espagne" },
  { code: "CH", dialCode: "+41",  flag: "🇨🇭", label: "Suisse" },
  { code: "NL", dialCode: "+31",  flag: "🇳🇱", label: "Pays-Bas" },
  { code: "IT", dialCode: "+39",  flag: "🇮🇹", label: "Italie" },
  { code: "DE", dialCode: "+49",  flag: "🇩🇪", label: "Allemagne" },
  { code: "GB", dialCode: "+44",  flag: "🇬🇧", label: "Royaume-Uni" },
  { code: "CA", dialCode: "+1",   flag: "🇨🇦", label: "Canada" },
  { code: "US", dialCode: "+1",   flag: "🇺🇸", label: "États-Unis" },
  { code: "AE", dialCode: "+971", flag: "🇦🇪", label: "Émirats arabes unis" },
  { code: "SA", dialCode: "+966", flag: "🇸🇦", label: "Arabie saoudite" },
  { code: "TR", dialCode: "+90",  flag: "🇹🇷", label: "Turquie" },
  { code: "DZ", dialCode: "+213", flag: "🇩🇿", label: "Algérie" },
  { code: "TN", dialCode: "+216", flag: "🇹🇳", label: "Tunisie" },
  { code: "EG", dialCode: "+20",  flag: "🇪🇬", label: "Égypte" },
  { code: "ZA", dialCode: "+27",  flag: "🇿🇦", label: "Afrique du Sud" },
  { code: "AR", dialCode: "+54",  flag: "🇦🇷", label: "Argentine" },
  { code: "AU", dialCode: "+61",  flag: "🇦🇺", label: "Australie" },
  { code: "BR", dialCode: "+55",  flag: "🇧🇷", label: "Brésil" },
  { code: "CN", dialCode: "+86",  flag: "🇨🇳", label: "Chine" },
  { code: "IN", dialCode: "+91",  flag: "🇮🇳", label: "Inde" },
  { code: "JP", dialCode: "+81",  flag: "🇯🇵", label: "Japon" },
  { code: "KR", dialCode: "+82",  flag: "🇰🇷", label: "Corée du Sud" },
  { code: "RU", dialCode: "+7",   flag: "🇷🇺", label: "Russie" },
] as const;

// Derive du precedent : une seule liste a maintenir.
const DIAL_CODE_TO_ISO: Record<string, string> = COUNTRY_OPTIONS.reduce(
  (acc, c) => {
    if (!acc[c.dialCode]) acc[c.dialCode] = c.code;
    return acc;
  },
  {} as Record<string, string>,
);

// Codes regionaux canadiens (source : CRTC)
const CANADIAN_AREA_CODES = new Set([
  "204","226","236","249","250","263","289","306","343","354","365","367",
  "368","382","387","403","416","418","428","431","437","438","450","468",
  "474","506","514","519","548","579","581","584","587","604","613","639",
  "647","672","683","705","709","742","753","778","780","782","807","819",
  "825","867","873","879","902","905",
]);

export const DEFAULT_COUNTRY = COUNTRY_OPTIONS[0];

/**
 * Extrait dialCode / country / digits d'un numero, quel que soit son format.
 * - "+212|MA|612345678"  -> format maison
 * - "+212612345678"      -> E.164
 * - ""                   -> defaut (MA, vide)
 */
export function extractPhoneParts(value?: string) {
  const raw = (value || "").trim();
  if (!raw) {
    return {
      dialCode: DEFAULT_COUNTRY.dialCode,
      country: DEFAULT_COUNTRY.code,
      digits: "",
    };
  }

  if (raw.includes("|")) {
    const [
      dialCode = DEFAULT_COUNTRY.dialCode,
      country = DEFAULT_COUNTRY.code,
      digits = "",
    ] = raw.split("|");
    return { dialCode, country, digits: digits.replace(/\D/g, "") };
  }

  return {
    dialCode: DEFAULT_COUNTRY.dialCode,
    country: DEFAULT_COUNTRY.code,
    digits: raw.replace(/\D/g, ""),
  };
}

export function toPhoneStorage(dialCode: string, country: string, digits: string) {
  return `${dialCode}|${country}|${digits.replace(/\D/g, "").slice(0, 12)}`;
}

/**
 * Numero au format international sans separateur : 212600000001.
 * C'est ce qu'attendent tel: et wa.me.
 */
export function numeroInternational(phone: string): string {
  const { dialCode, digits } = extractPhoneParts(phone);
  return `${dialCode.replace(/\D/g, "")}${digits}`;
}

/**
 * Code ISO du pays d'un numero.
 * - Format maison : lu directement dans la 2e partie.
 * - Cas +1 : distingue CA vs US via area code.
 * - Sinon : prefixe le plus long d'abord.
 */
export function getCountryCode(phone: string): string {
  if (!phone) return DEFAULT_COUNTRY.code;

  if (phone.includes("|")) {
    const parts = phone.split("|");
    if (parts.length >= 2 && parts[1]) return parts[1];
  }

  if (phone.startsWith("+1")) {
    const digits = phone.replace(/\D/g, "");
    const areaCode = digits.slice(1, 4);
    return CANADIAN_AREA_CODES.has(areaCode) ? "CA" : "US";
  }

  const prefixes = Object.keys(DIAL_CODE_TO_ISO).sort(
    (a, b) => b.length - a.length,
  );
  for (const prefix of prefixes) {
    if (phone.startsWith(prefix)) return DIAL_CODE_TO_ISO[prefix];
  }

  return DEFAULT_COUNTRY.code;
}

/**
 * Formate une suite de chiffres avec des tirets : 612345678 -> 612-345-678.
 */
export function formatDigitsWithDashes(digits: string): string {
  const clean = digits.replace(/\D/g, "");
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  if (clean.length <= 9)
    return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
  return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6, 9)}-${clean.slice(9, 12)}`;
}

/**
 * "+212|MA|612345678" -> "+212 612-345-678"
 * "+212612345678"     -> "+212 612-345-678"
 */
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return "";
  const { dialCode, digits } = extractPhoneParts(phone);
  return `${dialCode} ${formatDigitsWithDashes(digits)}`;
}

/** 612345678 -> "612 345 678" (pour les inputs, espaces) */
export function formatPhoneNumber(value: string): string {
  const cleaned = value.replace(/\D/g, "").slice(0, 12);
  const groups = cleaned.match(/.{1,3}/g);
  return groups ? groups.join(" ") : "";
}

/** "+212|MA|612345678" -> { code: "+212", number: "612345678" } */
export function splitPhoneParts(phone: string): { code: string; number: string } {
  if (phone.includes("|")) {
    const [code, , rawNumber = ""] = phone.split("|");
    return { code, number: rawNumber.replace(/\D/g, "") };
  }

  const match = phone.match(/^(\+\d+)\s*(.*)$/);
  if (match) {
    return { code: match[1], number: match[2].replace(/\D/g, "") };
  }

  return { code: "", number: phone.replace(/\D/g, "") };
}
