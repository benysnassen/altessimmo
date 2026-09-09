# Altessimmo Rabat

Site immobilier de prestige à Rabat. Next 16 (App Router), next-intl, Prisma/Supabase,
déployé sur Vercel (projet `altessimmo`, `prj_SlEUIso7zvww…`) sur `rabat.altessimmo.com`.

Le projet a été migré de Tétouan vers Rabat en place — voir `MIGRATION_RABAT.md`.
Tétouan est abandonné, aucune référence ne doit revenir.

Le site ne vend pas : il **qualifie des leads** pour la diaspora marocaine qui achète à
Rabat, et la confiance se construit ensuite au téléphone. Le critère qui tranche les
arbitrages du CRM est donc toujours le même : **aucun lead perdu**.

## Pièges à connaître avant de toucher au code

Ils ont tous coûté du temps à découvrir. Lis-les.

### Toute route API du dashboard doit appeler `requireAdmin`
Le `matcher` du middleware **exclut `api`** : aucune route n'est protégée par défaut.
Sept d'entre elles ont vécu ouvertes en production — le fichier client entier était
lisible, modifiable et effaçable par qui connaissait l'URL. Toute route qui touche aux
contacts, clients ou biens commence donc par :

```ts
const acces = await requireAdmin(request);   // @/lib/adminAuth
if (!acces.ok) return acces.response;
```

Restent publiques, et seulement elles : `/api/contact` (le formulaire), `/api/auth/*`,
et `/api/admin/setup`, gardée par `MASTER_KEY`.

### Une page hors de `[locale]` doit être listée dans `ADMIN_ROUTES`
Sinon le middleware l'envoie dans next-intl, qui la préfixe d'une locale, et la page
n'existant pas sous `[locale]`, elle répond 404. C'est ce qui a rendu `/admin-setup`
inaccessible. `ADMIN_ROUTES` vit dans `src/middleware.ts` : `/login`, `/dashboard`,
`/admin-setup`. Ces pages ne sont pas traduites — `/fr/login` est un 404 normal.

### N'utilise jamais `npm run build:deploy` en local
Il contient `prisma migrate deploy`, qui applique les migrations **sur la base de
production**. Pour builder : `npx prisma generate && npx next build`, ou `npm run build`
qui fait exactement ça.

`vercel.json` fixe la Build Command à `npm run build`, sans migration. Si tu la remets
un jour, garde-la derrière `VERCEL_ENV` : Vercel applique une seule Build Command à tous
les déploiements, donc un `build:deploy` nu ferait tourner `migrate deploy` depuis
**chaque preview**, contre la base de prod.

### Les mots de passe de connexion s'encodent en pourcentage
Le mot de passe Supabase contient des `$`. Saisi échappé (`N\$\$\$`), les antislashs
partent tels quels vers Postgres : `Authentication failed against database server`, sans
autre indice. Et un `$` nu dans un `.env` passe par l'expansion de variables de Next.
Dans `DATABASE_URL` et `DIRECT_URL`, les caractères spéciaux doivent être **encodés**
(`$` → `%24`), jamais échappés.

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
Prisma lit `.env`, Next privilégie `.env.local`. `.env.local` porte les bonnes valeurs
depuis la bascule ; `.env` contient encore un `HOST` placeholder pour `DATABASE_URL` et
un `MASTER_KEY` différent de celui de Vercel. À aligner. Non résolu.

Pour connaître les valeurs qui font foi, celles de la production :
`npx vercel env pull <fichier> --environment=production`.

## Base de données

### Deux projets Supabase, un seul en service
- **`swhuiedqouerdpxluthr`** (`aws-1-eu-west-1`) — celui du site, depuis le 2026-09-08.
  C'est aussi celui de `.env.local` et du serveur MCP `supabase`.
- **`zbmlybokhlkevqjjohmy`** (`aws-0-eu-west-1`) — l'ancien. Intact, avec les leads,
  fiches et biens d'avant la bascule, **volontairement non repris**. Ne pas y écrire.

Le MCP agit donc sur la base qui sert le site : une migration appliquée là touche la
production, avec la prudence que cela suppose.

### Appliquer une migration
`prisma migrate dev` interroge la base et peut décider de la **réinitialiser** : il ne
doit jamais viser la production. `migrate deploy` et `db push` sont interdits pour la
même raison. La marche à suivre, éprouvée trois fois :

1. éditer `prisma/schema.prisma` ;
2. écrire le SQL **à la main** dans `prisma/migrations/<horodatage>_<nom>/migration.sql`,
   en suivant les conventions Prisma (guillemets doubles, `TIMESTAMP(3)`) ;
3. `npx prisma generate` — valide le schéma sans toucher à la base ;
4. appliquer par le MCP (`apply_migration`), en ajoutant dans la même requête la ligne
   de journal Prisma :

```sql
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, started_at, applied_steps_count)
VALUES (gen_random_uuid()::text, '<sha256 du fichier>', now(), '<nom du dossier>', now(), 1);
```

Sans cette ligne, un futur `prisma migrate` croirait la base vierge et tenterait de
rejouer `0_init` sur un schéma déjà en place.

`DIRECT_URL` était rejetée par le session pooler de l'ancien projet
(`tenant/user not found`). Elle pointe désormais sur le nouveau et n'a pas été
retestée — ça n'a pas d'importance tant que les migrations passent par le MCP.

### RLS
Le déclencheur `rls_auto_enable` du projet active RLS sur toute table créée. Les onze
tables l'ont, sans policy : l'API REST publique ne peut rien lire, ce qui compte pour
`contacts` et `admins`. Prisma se connecte en `postgres`, propriétaire, et n'y est pas
soumis. Ne pas « corriger » cette absence de policy en ouvrant l'accès.

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

### Le parcours d'un lead
`src/lib/leads.ts` porte ce que le formulaire, l'API, la notification et le dashboard
partagent : échéances (`HORIZONS`, `HORIZON_BADGES`), pays et fuseau déduits de
l'indicatif, états de relance (`etatRelance`, `RANG_RELANCE`, `RELANCE_STYLES`).

**Le téléphone est stocké en trois morceaux** : `indicatif|codePays|numéro`, par
exemple `+212|MA|65413987`. Lu brut en base, ça ressemble à une corruption ; c'est le
format que le sélecteur de pays du formulaire écrit, et c'est le `codePays` qui permet à
`leads.ts` de déduire pays et fuseau (`phone.split('|')[1]`). `formatPhoneDisplay` et
`numeroInternational` le recomposent pour l'affichage, `tel:` et `wa.me`. Ne pas
« réparer » ce champ, et ne jamais le concaténer à la main.

**Deux étages, reliés par le téléphone normalisé.** Le formulaire écrit dans `contacts` ;
le CRM travaille sur `buyers` / `sellers`. `GET /api/contacts` fusionne les trois,
déduplique sur `type + phoneNormalized`, rattache la qualification restée sur le contact,
et expose `origin` (`buyer` | `seller` | `contact`) pour savoir qui reste convertible.
`POST /api/contacts/convert` crée la fiche depuis le lead en reportant le statut — les
trois modèles ont des enums différents, et à défaut d'équivalent on retombe sur
`CONTACTED`, **jamais** sur `NEW`, qui effacerait le suivi.

**Rien ne s'écrase.** Chaque envoi du formulaire crée une ligne `contact_submissions`,
en ajout seul. La fiche porte l'état courant, la table porte le passé. À la
resoumission, une valeur absente ne remplace pas une valeur connue, le `status` est
conservé, et seul un lead `ARCHIVED` revient à `NEW` puisqu'il se manifeste à nouveau.

**Aucun oubli.** `nextActionAt` existe sur les trois tables — une fiche créée à la main
n'a pas de ligne `contacts` où ranger la date. `PATCH /api/contacts/next-action` la pose,
l'efface, ou marque « rappelé » (`markContacted`, qui fait aussi passer un `NEW` en
`CONTACTED`). La liste trie par urgence avant toute autre considération.

**Le dashboard est le canal de secours.** Si Telegram échoue, `sendTelegramNotification`
renvoie `false` : la route pose alors `nextActionAt` au jour même, et le lead remonte en
tête plutôt que de dormir. Ne pas retirer ce repli.

### Le formulaire ne doit jamais échouer en silence
`ContactForm.tsx` ne traitait que le cas `response.ok`. Un 500 ne produisait rien : le
visiteur repartait en croyant avoir envoyé, sans laisser de trace. L'échec est
maintenant annoncé (`submit_error`, en `role="alert"`) et les réponses sont conservées
pour réessayer. Même règle dans le dashboard : un enregistrement raté se dit.

### Locales
`fr`, `en`, `ar` — définies dans `src/i18n/routing.ts`. L'espagnol a été retiré ;
`next.config.ts` redirige `/es/*` vers `/fr/*`, sinon le middleware next-intl prend
`es` pour un segment de chemin et renvoie vers `/fr/es/`, donc en 404.

`sitemap.ts` et les `hreflang` dérivent de `routing.locales`, ils suivent tout seuls.
`/ar` est en RTL, à vérifier visuellement après toute modification du Hero.

Toute clé ajoutée doit l'être dans les **trois** fichiers de `messages/`. Les libellés
côté agent (Telegram, dashboard) ne sont pas traduits : seul l'admin les lit.

### Métadonnées
`src/lib/metadata.ts` expose `getLocalizedMetadata(locale, options)`. Un titre de page
passe en `title.absolute`, sinon le template `"%s | Altessimmo"` du layout parent s'y
applique et produit un `| Altessimmo` en double.

`trailingSlash: true` : les URLs du sitemap se terminent par `/`, sinon chaque entrée
déclenche un 308. Les routes API aussi : `POST /api/contact` sans le `/` final renvoie
un 308 avant d'atteindre le code.

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

Pour une route protégée, il faut une session. Signer un jeton court avec le
`JWT_SECRET` local sur le compte admin existant suffit, et reste sur la machine :

```bash
T=$(node -e "require('dotenv').config({path:'.env.local'});
const {PrismaClient}=require('@prisma/client');const jwt=require('jsonwebtoken');
const p=new PrismaClient();
p.admin.findFirst({select:{id:true,username:true}}).then(a=>process.stdout.write(
  jwt.sign({adminId:a.id,username:a.username},process.env.JWT_SECRET,{expiresIn:'5m'})
)).finally(()=>p.\$disconnect());")
curl -s localhost:4000/api/contacts/ -H "Cookie: admin-token=$T"
```

⚠️ Le serveur local parle à la base de **production**. Un `POST /api/contact` y crée un
vrai lead et notifie Telegram. Pour tester le parcours sans déranger personne, lancer
avec `TELEGRAM_BOT_TOKEN= TELEGRAM_CHAT_ID=` — le helper renvoie `false` sans appeler
l'API — puis supprimer les lignes de test.

## Déploiement

Push sur `main` → production. Toute autre branche → preview. Le domaine est attaché à
la production. Les previews sont protégées par l'authentification Vercel : elles ne
répondent qu'à un navigateur connecté au compte, pas à `curl`.

Vercel n'injecte les variables d'environnement qu'au **déploiement** : les modifier ne
change rien tant qu'un nouveau build n'est pas parti.

## Points ouverts

- **Bot Telegram** : `@immo_notif_tetouan_bot`, « Notif Tetouan Immo Formulaire ».
  À renommer via BotFather (le `@username` n'est pas modifiable, il faudrait un nouveau
  bot). `TELEGRAM_CHAT_ID` pointe sur une conversation privée, pas un canal — c'est
  voulu, ne pas y toucher.
- **`visits`, `offers`, `notes`** existent au schéma et ne sont utilisés nulle part.
- **Pas d'alerte automatique** pour les leads laissés sans date de rappel : le compteur
  du dashboard suppose qu'on l'ouvre.
- **La liste des contacts est chargée entière côté navigateur** puis paginée en mémoire.
  Tient pour un fichier de taille humaine, pas au-delà de quelques milliers de fiches.
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

## Conventions

- Messages de commit en français, sans accents.
- Toute route API du dashboard commence par `requireAdmin`.
- Ne pas toucher à `prisma/migrations/` déjà appliquées, ne jamais lancer
  `prisma migrate dev`, `migrate deploy` ni `db push` : migrations à la main + MCP.
- Le bouton WhatsApp du `Footer`, le `LanguageSwitcher` et le curseur de budget du
  formulaire sont **intouchables** — ce sont les dispositifs de conversion du site.
  Demander avant, même si un document du dépôt prescrit le contraire.
- Pas de `git push --force`, pas de réécriture d'historique.
- Ne pas supprimer de `.md` ni les vestiges Hostinger sans demander.
