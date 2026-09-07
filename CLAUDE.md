# Altessimmo Rabat

Site immobilier de prestige à Rabat. Next 16 (App Router), next-intl, Prisma/Supabase,
déployé sur Vercel (projet `altessimmo`, `prj_SlEUIso7zvww…`) sur `rabat.altessimmo.com`.

Le projet a été migré de Tétouan vers Rabat en place — voir `MIGRATION_RABAT.md`.
Tétouan est abandonné, aucune référence ne doit revenir.

## Pièges à connaître avant de toucher au code

Ils ont tous coûté du temps à découvrir. Lis-les.

### N'utilise jamais `npm run build:deploy` en local
Il contient `prisma migrate deploy`, qui applique les migrations **sur la base de
production**. Pour builder : `npx prisma generate && npx next build`, ou `npm run build`
qui fait exactement ça.

### `DIRECT_URL` est cassée
Le session pooler Supabase la rejette :

```
FATAL: (ENOTFOUND) tenant/user postgres.<ref> not found
at aws-0-eu-west-1.pooler.supabase.com:5432
```

L'application n'est pas affectée : elle passe par `DATABASE_URL` sur le transaction
pooler en 6543, qui fonctionne. Seul `prisma migrate` utilise `DIRECT_URL`. Toute
migration de schéma butera dessus tant que la chaîne n'est pas corrigée dans Supabase
(Settings → Database) puis dans les variables Vercel.

C'est pourquoi `vercel.json` fixe la Build Command à `npm run build`, sans migration.
Si tu la remets un jour, garde-la derrière `VERCEL_ENV` : Vercel applique une seule
Build Command à tous les déploiements, donc un `build:deploy` nu ferait tourner
`migrate deploy` depuis **chaque preview**, contre la base de prod.

### Les polices passent par `next/font`, jamais par `@import`
Un `@import url(fonts.googleapis.com)` en tête de `globals.css` est **supprimé au build**
par Tailwind v4. Le site a tourné des mois en Times New Roman en croyant afficher
Playfair Display. Les polices sont maintenant dans `src/lib/fonts.ts` et les variables
posées sur les **cinq** layouts qui portent une balise `<html>`.

Si tu ajoutes une police, vérifie qu'elle arrive vraiment : compte les `@font-face` dans
le CSS servi et les `.woff2` dans `.next/static/media/`. Zéro = elle ne se charge pas.

### Deux arbres de routes coexistent
`src/app/[locale]/biens/` (Prisma) et `src/app/biens/` (Supabase). **Ne pas fusionner.**

### `.env` et `.env.local` divergent
Prisma lit `.env`, Next privilégie `.env.local`. `JWT_SECRET` et `MASTER_KEY` ont des
valeurs **différentes** dans les deux, et `.env` contient un `HOST` placeholder pour
`DATABASE_URL`. À aligner. Non résolu.

## Architecture

### `src/config/site.ts` — source de vérité
Tout ce qui dépend de la ville y est centralisé : `city`, `zones`, `baseUrl`,
`pricePerSqm`, `geo`, `districts`, `ogImage`, plus les helpers de prose par locale et
les mots-clés SEO. **N'écris jamais « Rabat » en dur** : importe depuis `@/config/site`.

Les zones sont réduites à `["Rabat"]`. Les helpers gèrent 1, 2 ou n zones — en ajouter
ne demande que d'éditer `site.zones`. Le Hero affiche les quartiers (`districtsLabel`)
et non les zones, qui répéteraient le titre.

`ogImage` est composée à partir du logo vectoriel et son sous-titre est figé dans le
pixel : si `districts` change, l'image est à régénérer.

### Locales
`fr`, `en`, `ar` — définies dans `src/i18n/routing.ts`. L'espagnol a été retiré ;
`next.config.ts` redirige `/es/*` vers `/fr/*`, sinon le middleware next-intl prend
`es` pour un segment de chemin et renvoie vers `/fr/es/`, donc en 404.

`sitemap.ts` et les `hreflang` dérivent de `routing.locales`, ils suivent tout seuls.
`/ar` est en RTL, à vérifier visuellement après toute modification du Hero.

### Métadonnées
`src/lib/metadata.ts` expose `getLocalizedMetadata(locale, options)`. Un titre de page
passe en `title.absolute`, sinon le template `"%s | Altessimmo"` du layout parent s'y
applique et produit un `| Altessimmo` en double.

`trailingSlash: true` : les URLs du sitemap se terminent par `/`, sinon chaque entrée
déclenche un 308.

## Commandes

```bash
npm run dev                          # Turbopack
npx prisma generate && npx next build # build de référence
npm test                             # Jest
npm run test:e2e                     # Playwright
```

### Échecs de test préexistants, sans rapport avec une modification
- `ContactForm.test.tsx` : Jest ne transpile pas l'ESM de `next-intl`
  (`SyntaxError: Unexpected token 'export'`). Il manque un `transformIgnorePatterns`.
- `npx tsc --noEmit` : ~48 erreurs dans `tests/` et `__tests__/` (`@types/jest` absent,
  API Playwright désalignée). **Zéro erreur hors tests** — c'est le seuil à tenir.

## Vérifier une modification

Le build qui passe ne prouve pas grand-chose sur ce projet : les métadonnées, le
JSON-LD, les redirections et les polices ne se voient qu'à l'exécution. Lance le serveur
et regarde le HTML réellement servi.

```bash
npx next start -p 4000
curl -s localhost:4000/fr/ | grep -o '<title>[^<]*</title>'
```

## Déploiement

Push sur `main` → production. Toute autre branche → preview. Le domaine est attaché à
la production.

## Points ouverts

- **Bot Telegram** : `@immo_notif_tetouan_bot`, « Notif Tetouan Immo Formulaire ».
  À renommer via BotFather (le `@username` n'est pas modifiable, il faudrait un nouveau
  bot). `TELEGRAM_CHAT_ID` pointe sur une conversation privée, pas un canal — c'est
  voulu, ne pas y toucher.
- **Vestiges Hostinger** : `.htaccess`, `server.js`, `output: 'standalone'`,
  `create-admin-hostinger.php`, les guides `HOSTINGER_*.md`, `SUBDOMAIN_*.md`,
  `MIGRATION_GUIDE.md`, et `scripts/{sync,migrate}-to-hostinger.js` qui contiennent
  encore une chaîne MySQL Tétouan. Le projet tourne sur Vercel, tout cela est mort.
- **Route `/test`** publique et buildée en production. En `Disallow` dans `robots.ts`,
  mais accessible.
- **`middleware` déprécié** en Next 16 au profit de `proxy`. Warning au build.
- **Scripts jetables à la racine** : `test-*.js`, `check-admins.js`.
- **`prisma/dev.db`** a été désindexée mais reste dans l'historique git, avec 4 contacts
  réels et un hash admin. Le secret est à considérer comme compromis.
- **Icônes du manifest et favicon** pointent sur `/file.svg` (placeholder Next) alors
  que `favicon.svg`, `apple-touch-icon.png` et `web-app-manifest-*.png` existent.

## Conventions

- Messages de commit en français, sans accents.
- Ne pas toucher à `prisma/migrations/`, ne jamais lancer `prisma migrate deploy` ni
  `prisma db push`.
- Pas de `git push --force`, pas de réécriture d'historique.
- Ne pas supprimer de `.md` ni les vestiges Hostinger sans demander.
