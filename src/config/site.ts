/**
 * Source de vérité unique pour tout ce qui dépend de la ville.
 * Aucun fichier ne doit écrire "Rabat" en dur : importer depuis `@/config/site`.
 */
export const site = {
  city: "Rabat",
  cityAr: "الرباط",

  zones: ["Rabat"],
  zonesAr: ["الرباط"],

  baseUrl: "https://rabat.altessimmo.com",

  /** Prix moyen du m² en MAD, affiché par le MarketTicker. */
  pricePerSqm: 18000,

  geo: { lat: 34.0209, lng: -6.8416 },

  /**
   * Image Open Graph unique du site (1200x630), composée à partir du logo
   * vectoriel. Le sous-titre y est figé : régénérer si `districts` change.
   */
  ogImage: "/og-rabat-altessimmo.png",

  districts: [
    "Agdal", "Hay Riad", "Souissi", "Hassan",
    "L'Océan", "Aviation", "Les Orangers", "Yacoub El Mansour",
  ],
} as const;

/** Joint une liste avec une conjonction : ["a","b","c"] + "et" → "a, b et c" */
function joinList(items: readonly string[], conjunction: string): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} ${conjunction} ${items[items.length - 1]}`;
}

/** Arabe : la conjonction « و » se colle au mot suivant. */
function joinListAr(items: readonly string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join("، ")} و${items[items.length - 1]}`;
}

/**
 * Sous-titre du Hero : "Agdal • Hay Riad • Souissi".
 * Avec une seule zone, afficher les zones répéterait le titre : on descend
 * d'un cran, sur les quartiers phares.
 */
export const districtsLabel = site.districts.slice(0, 3).join(" • ");

/** Libellé de marque des titres SEO : "Rabat" (ou "Rabat, Salé & Témara") */
export const zonesBrandLabel =
  site.zones.length <= 1
    ? site.zones[0]
    : `${site.zones.slice(0, -1).join(", ")} & ${site.zones[site.zones.length - 1]}`;

/** Prose courante, par locale : "Rabat" (ou "Rabat, Salé et Témara") */
export const zonesProseFr = joinList(site.zones, "et");
export const zonesProseEn = joinList(site.zones, "and");
export const zonesProseEs = joinList(site.zones, "y");
export const zonesProseAr = joinListAr(site.zonesAr);

export const zonesProse: Record<string, string> = {
  fr: zonesProseFr,
  en: zonesProseEn,
  es: zonesProseEs,
  ar: zonesProseAr,
};

/** Mots-clés SEO dérivés des zones et des quartiers. */
export const seoKeywords: string[] = [
  ...site.zones.flatMap((zone) => [
    `immobilier ${zone}`,
    `villa luxe ${zone}`,
    `appartement haut standing ${zone}`,
    `achat vente ${zone}`,
  ]),
  ...site.districts.map((district) => `immobilier ${district} ${site.city}`),
  "investissement Maroc",
  "Altessimmo",
];
