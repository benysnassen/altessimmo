# Migration Altessimmo : Tétouan → Rabat

Spec à exécuter par Claude Code.

**Contexte** : projet Next 16 (App Router, next-intl fr/en/es/ar, Prisma/Supabase), déployé sur Vercel (`benysnassens-projects/altessimmo`). Le DNS `rabat.altessimmo.com` est déjà configuré et pointe sur ce projet.

**Objectif** : transformer ce projet **en place** en projet immobilier Rabat. Ce n'est pas un clone : Tétouan est abandonné, il ne doit rester aucune référence.

**Contrainte d'architecture** : pas de chercher/remplacer global. Centralise d'abord les valeurs liées à la ville dans un module de config, puis fais pointer chaque fichier dessus.

---

## Étape 0 — Préalables

1. `git checkout -b migration-rabat`
2. Le build de référence a déjà été validé au vert avec :
   ```bash
   npx prisma generate && npx next build
   ```
   ⚠️ N'utilise **jamais** `npm run build` : son script contient `prisma migrate deploy`, qui applique les migrations sur la base de production.
3. Note : deux arbres de routes coexistent, `src/app/[locale]/biens/` (Prisma) et `src/app/biens/` (Supabase). Ne cherche pas à les fusionner. Signale simplement si l'un contient des références à Tétouan.

---

## Étape 1 — Créer `src/config/site.ts`

Source de vérité unique.

```ts
export const site = {
  city: "Rabat",
  cityAr: "الرباط",

  zones: ["Rabat", "Salé", "Témara"],
  zonesAr: ["الرباط", "سلا", "تمارة"],

  baseUrl: "https://rabat.altessimmo.com",

  // Prix moyen du m² en MAD (MarketTicker).
  // ⚠️ À VALIDER — ne pas conserver la valeur Tétouan (15000).
  pricePerSqm: 18000,

  geo: { lat: 34.0209, lng: -6.8416 },

  districts: [
    "Agdal", "Hay Riad", "Souissi", "Hassan",
    "L'Océan", "Aviation", "Les Orangers", "Yacoub El Mansour",
  ],
} as const;

/** "Rabat • Salé • Témara" */
export const zonesLabel = site.zones.join(" • ");

/** "Rabat, Salé et Témara" */
export const zonesProseFr = site.zones.slice(0, -1).join(", ") + " et " + site.zones.at(-1);
```

Ajoute les variantes de prose EN/ES/AR selon les besoins de l'étape 2.

---

## Étape 2 — Fichiers à modifier

Dans cet ordre. Importe depuis `@/config/site` plutôt que d'écrire "Rabat" en dur.

### 2.1 `src/app/[locale]/layout.tsx` — 17 occurrences

Dans `generateMetadata()` :
- `titles` : 4 langues, toutes contiennent `"Altessimmo Tetouan, Martil & Cabo Negro - …"`. L'arabe est `"Altessimmo تطوان، مارتيل و كابو نيغرو - عقارات استثنائية"` → `الرباط، سلا و تمارة`
- `descriptions` : idem, 4 langues
- `metadataBase: new URL("https://tetouan.altessimmo.com")` → `site.baseUrl`
- `keywords` : contient `immobilier Tetouan`, `immobilier Martil`, `immobilier Cabo Negro`, `villa luxe Tetouan`, `appartement haut standing Martil`, `achat vente Cabo Negro` → régénère depuis `site.zones`
- `authors[0].url`
- `alternates.canonical`
- `openGraph.url`
- `openGraph.images[0].alt`

### 2.2 `src/app/[locale]/contact/page.tsx` — 15 occurrences

Bloc `export const metadata` (lignes ~5-43) : title, description, keywords, `openGraph.url` (`https://tetouan.altessimmo.com/contact`), `openGraph.title/description/alt`, `twitter.title/description`.

**Au passage** : ce bloc duplique `src/lib/metadata.ts`. Factorise via `getLocalizedMetadata()` plutôt que de maintenir deux blocs.

### 2.3 `src/lib/metadata.ts` — 7 occurrences

- `const baseUrl = 'https://tetouan.altessimmo.com'` → `site.baseUrl`
- Objet `metadata` : 4 paires titre/description

### 2.4 `src/app/components/Hero.tsx` — 2 occurrences

- ligne ~95 : le grand mot `Tetouan` dans un `motion.span` → `{site.city}`
- ligne ~142 : `Tetouan • Martil • Cabo Negro` → `{zonesLabel}`

⚠️ Élément visuel majeur. `Rabat` (5 caractères) contre `Tetouan` (7) : vérifie que la typo ne casse pas en responsive, surtout mobile.

### 2.5 `src/app/components/MarketTicker.tsx` — 2 occurrences + valeurs

- ligne ~21 : `{ id: 'sqm', label: "Prix m² Tetouan", value: 15000, prev: 14900, display: '15 000 MAD' }`
- ligne ~116 : `label: 'Prix m² Tetouan'` et le fallback `?? 15000`

Le label **et** les trois valeurs numériques viennent de `site.pricePerSqm`. Ne laisse pas 15000, c'est le prix Tétouan.

### 2.6 `src/app/components/Footer.tsx` — 1 occurrence

ligne ~29 : `© {new Date().getFullYear()} Altessimmo Tetouan`

### 2.7 `src/app/components/SectionWhyAltessimmo.tsx` — 1 occurrence

ligne ~58, carte "Présence Locale Forte" : `"Tetouan, Martil, Cabo Negro — nous connaissons chaque quartier, chaque opportunité."`

### 2.8 `messages/fr.json` et `messages/en.json` — 1 chacun

Clé `help_find_dream` (ligne ~10).

⚠️ **Vérifie si la clé existe dans `es.json` et `ar.json`** — le grep ne l'y a pas trouvée. Fallback silencieux ou clé manquante ? Signale.

### 2.9 `src/lib/telegram.ts` — notifications de leads

Aucune occurrence textuelle, mais à traiter : chaque formulaire déclenche une notification Telegram.

Dans `formatFormData()`, préfixe le message par la ville :
```ts
let message = `🔔 <b>Nouveau formulaire — ${site.city}</b>\n\n`;
```

⚠️ **Action hors code, à faire par l'utilisateur** : `TELEGRAM_CHAT_ID` pointe sur le canal Tétouan. Créer un canal Rabat, y ajouter le bot comme admin, récupérer le nouveau `chat_id`, mettre à jour la variable sur Vercel. Le `TELEGRAM_BOT_TOKEN` reste identique.

### 2.10 `package.json` — 1 occurrence

`"name": "altessimmo-tetouan"` → `"altessimmo-rabat"`

Découple aussi les scripts, pour qu'un build local ne puisse plus migrer la prod :
```json
"build": "prisma generate && next build",
"build:deploy": "prisma generate && prisma migrate deploy && next build"
```
(sur Vercel, régler la Build Command sur `npm run build:deploy` si les migrations doivent tourner au déploiement)

### 2.11 `prisma/schema.prisma` — 2 occurrences

Lignes ~49 et ~85, commentaires du champ `location` : `// Tétouan, Cabo Negro, Martil, etc.`

Commentaires seulement — **aucune migration de schéma**.

### 2.12 `scripts/create-test-data.js` — 8 occurrences

Données de seed → quartiers de Rabat (`site.districts`).

---

## Étape 3 — Ce que le grep ne trouve pas

1. **`next.config.ts`** : `allowedDevOrigins` contient une URL ngrok morte (`28bb-105-155-59-58.ngrok-free.app`). Supprime.

2. **Redirection de l'ancien domaine**, pour que les liens déjà partagés ne tombent pas en 404 :
   ```ts
   async redirects() {
     return [{
       source: '/:path*',
       has: [{ type: 'host', value: 'tetouan.altessimmo.com' }],
       destination: 'https://rabat.altessimmo.com/:path*',
       permanent: true,
     }];
   }
   ```

3. **Images Open Graph incohérentes** : `layout.tsx` pointe vers `/window.svg` (placeholder Next par défaut, pas une vraie image OG), `metadata.ts` vers `/og-image-altessimmo.png`, `contact/page.tsx` vers `/og-contact.jpg`. Unifie les références et signale que les visuels doivent être refaits — tu ne peux pas les générer.

4. **`public/site.webmanifest`** : vérifie `name` et `short_name`.

5. **Pas de `sitemap.ts` ni `robots.ts`**. Crée-les :
   - `src/app/sitemap.ts` : 4 locales × routes publiques (`/`, `/biens`, `/contact`), depuis `site.baseUrl`
   - `src/app/robots.ts` : `disallow: ['/dashboard', '/login', '/admin-setup', '/api', '/test']`

6. **Pas de JSON‑LD**. Ajoute un `RealEstateAgent` dans `layout.tsx` : `addressLocality: site.city`, `areaServed: site.zones`, `geo` depuis `site.geo`. C'est le signal SEO local le plus important en immobilier, et son absence est le plus gros manque actuel du projet.

---

## Étape 4 — À signaler sans corriger

Liste ces points dans ton rapport final. **Ne les modifie pas** dans cette passe.

1. **Vestiges Hostinger** : le projet tourne sur Vercel mais contient `.htaccess`, `server.js`, `output: 'standalone'` dans `next.config.ts`, et 5 guides `HOSTINGER_*.md` / `SUBDOMAIN_DEPLOYMENT_GUIDE.md` décrivant un déploiement FTP vers MySQL. Tout cela est mort.

2. **Route `/test` publique** : `src/app/test/` est buildée et accessible en production. Candidate à la suppression.

3. **`middleware` déprécié** en Next 16.2 au profit de `proxy` (`src/middleware.ts`). Warning au build, fonctionne encore.

4. **Doublon `.env` / `.env.local`** : les deux existent. Prisma lit `.env`, Next privilégie `.env.local`. Vérifie qu'ils pointent la même base et signale toute divergence.

5. **Scripts jetables à la racine** : `test-salt.js`, `test-rating-*.js`, `test-personal-note.js`, `test-star-display.js`, `check-admins.js`, `test-hostinger-insert.js`.

---

## Étape 5 — Hygiène du repo

Celle-ci, tu peux l'appliquer :

```bash
echo -e "\n# databases locales\n*.db\ndev.db\nprisma/dev.db\n\n# artefacts de test\n/test-results/\n/playwright-report/" >> .gitignore
git rm -r --cached dev.db prisma/dev.db test-results/
```

`prisma/dev.db` est un vestige SQLite qui ne correspond plus au schéma (passé à postgresql) et contient des contacts réels ainsi qu'un hash admin.

---

## Étape 6 — Validation

```bash
# 1. Aucune référence résiduelle (ne doit rien retourner sauf ce fichier)
grep -rniE "tetouan|tétouan|martil|cabo.?negro" \
  --include="*.{ts,tsx,js,json,mjs,css}" src/ messages/ prisma/ scripts/ *.json *.ts

# 2. Build sans toucher à la base
npx prisma generate && npx next build

# 3. Tests unitaires
npm test
```

Puis `npm run dev` et vérification visuelle des 4 locales (`/fr`, `/en`, `/es`, `/ar`), avec attention particulière à `/ar` (RTL + Hero).

---

## Demander avant d'agir

- `site.pricePerSqm` : 18000 est une estimation
- Zones définitives : Rabat seul, ou Rabat + Salé + Témara ?
- Les nouvelles images OG (hors code)
- Toute modification du schéma Prisma ou des migrations

## Ne pas faire

- Pas de `git push --force`, pas de réécriture d'historique
- Ne touche pas à `prisma/migrations/`
- Ne lance jamais `prisma migrate deploy` ni `prisma db push`
- Ne fusionne pas les deux arbres de routes
- Ne supprime aucun fichier `.md` ni les vestiges Hostinger sans demander
