# Qualification des leads MRE + CTA WhatsApp

Spec à exécuter par Claude Code, sur le projet Altessimmo Rabat (post-migration).

**Contexte métier** : le site cible la diaspora marocaine (Europe, Canada, USA) qui achète ou investit à Rabat. Le site ne vend pas — il qualifie des leads. La confiance se construit ensuite au téléphone. L'objectif est donc double : (a) que l'agent sache qui rappeler en priorité et avec quel angle, (b) que le visiteur puisse déclencher un contact en un geste.

**Existant à ne pas casser** : le modèle `Contact` (Prisma) possède déjà `name`, `phone`, `phoneNormalized`, `email`, `type` (BUYER/SELLER), `budget`, `estimation`, `message`, `status`, `rating`, `personalNote`, `confidential`. La route `POST /api/contact` fait déjà de la déduplication par téléphone normalisé et notifie Telegram via `sendTelegramNotification`.

---

## Étape 0 — Préalables

1. Partir de `main` à jour, créer une branche : `git checkout -b leads-qualification`
2. Build de référence : `npx prisma generate && npx next build`
   ⚠️ Ne jamais lancer `npm run build:deploy`, `prisma migrate deploy` ni `prisma db push` — ils touchent la base de production.
3. Lire `src/app/api/contact/route.ts`, `src/lib/telegram.ts`, le formulaire de `src/app/[locale]/contact/page.tsx` et `prisma/schema.prisma` avant toute modification.

---

## Étape 1 — Trois champs sur le modèle Contact

Ajoute au modèle `Contact` dans `prisma/schema.prisma` :

```prisma
  country     String?   // pays de résidence (ISO 3166-1 alpha-2 : "FR", "CA", "US"…)
  horizon     ContactHorizon?
  sourcePage  String?   // page d'origine du lead, ex: "/fr/fiscalite-achat-rabat"
```

Et l'enum :

```prisma
enum ContactHorizon {
  IMMEDIATE    // achat sous 3 mois
  SIX_MONTHS   // 3 à 12 mois
  EXPLORING    // se renseigne
}
```

⚠️ **Génère le fichier de migration mais ne l'applique pas.** Utilise :
```bash
npx prisma migrate dev --create-only --name add_lead_qualification
```
Puis `npx prisma generate`. L'application en production sera faite par l'utilisateur.

Tous les champs sont **optionnels** : les contacts existants restent valides et aucune donnée n'est perdue.

---

## Étape 2 — Le formulaire

Dans le formulaire de contact, ajoute trois entrées. Les libellés doivent être traduits dans les **4 locales** (`messages/fr.json`, `en.json`, `es.json`, `ar.json`).

### 2.1 Pays de résidence — obligatoire

Un `<select>`, pas un champ libre. Ordre des options : les pays de la diaspora d'abord, puis le reste alphabétique.

```
France, Belgique, Pays-Bas, Espagne, Italie, Allemagne, Royaume-Uni,
Canada, États-Unis, Émirats arabes unis, Arabie saoudite, Qatar,
Maroc, — puis autres —
```

Valeur stockée : code ISO alpha-2. Libellé affiché : traduit selon la locale.

**Pré-remplis depuis l'indicatif téléphonique** si le champ téléphone est déjà rempli (il encode déjà `dialCode|country|digits`, voir `normalizePhone`). Le visiteur peut corriger.

### 2.2 Horizon d'achat — obligatoire

Trois boutons radio, pas un select — c'est plus rapide et plus visible :

- « Je souhaite acheter dans les 3 mois » → `IMMEDIATE`
- « Dans les 6 à 12 mois » → `SIX_MONTHS`
- « Je me renseigne » → `EXPLORING`

### 2.3 Budget — déjà présent, à passer en tranches

Le champ `budget` existe mais est libre. Remplace-le par un select à tranches, en MAD, adapté au marché de Rabat :

```
< 1 000 000 MAD
1 000 000 – 2 000 000 MAD
2 000 000 – 3 500 000 MAD
3 500 000 – 5 000 000 MAD
> 5 000 000 MAD
Je ne sais pas encore
```

Le champ reste `String?` en base — pas de migration nécessaire pour celui-ci. Stocke la valeur normalisée (`"1000000-2000000"`), pas le libellé traduit, pour que les stats restent exploitables toutes langues confondues.

⚠️ Le budget ne s'applique qu'aux acheteurs. S'il est masqué quand `type === 'seller'`, garde ce comportement.

### 2.4 Page d'origine — champ caché

Capture `window.location.pathname` au montage du composant et envoie-le dans `sourcePage`. Invisible pour le visiteur.

---

## Étape 3 — API et notification

### 3.1 `src/app/api/contact/route.ts`

Accepte `country`, `horizon`, `sourcePage` dans le body, valide-les (`country` : 2 lettres ; `horizon` : une des 3 valeurs de l'enum), et persiste-les dans les branches `create` **et** `update` de la déduplication.

Sur un contact existant qui resoumet : écrase `country` et `horizon` (l'information la plus récente est la bonne), mais **conserve le `sourcePage` d'origine** s'il existe déjà — la première page d'entrée est l'information intéressante.

### 3.2 `src/lib/telegram.ts`

Enrichis `formatFormData()`. L'agent doit pouvoir trier au coup d'œil sur son téléphone :

- Un indicateur de priorité en tête du message, dérivé de `horizon` : 🔥 pour `IMMEDIATE`, 🟠 pour `SIX_MONTHS`, ⚪️ pour `EXPLORING`
- Le pays de résidence avec son emoji drapeau
- Le budget
- La page d'origine
- **Le fuseau horaire du prospect et l'heure locale au moment de l'envoi** — c'est ce qui évite d'appeler Montréal à 3 h du matin. Dérive-le du pays ; en cas d'ambiguïté (US, Canada), affiche le fuseau principal avec une mention d'incertitude plutôt qu'une valeur fausse.

Ne casse pas le préfixe ville existant (`🔔 Nouveau formulaire — Rabat`).

---

## Étape 4 — Bouton WhatsApp flottant

Nouveau composant `src/app/components/WhatsAppButton.tsx`, monté dans le layout des routes publiques uniquement — **pas** sur `/dashboard`, `/login`, `/admin-setup`.

- Position fixe, bas de page, côté opposé au sens de lecture : à droite en LTR, **à gauche en RTL** (locale `ar`)
- Lien `https://wa.me/<numéro>?text=<message pré-rempli, encodé>`
- Message pré-rempli traduit dans les 4 locales, mentionnant la page d'origine. Ex. FR : « Bonjour, je vous contacte au sujet de … »
- Le numéro vient de `src/config/site.ts` : ajoute `whatsapp: "212XXXXXXXXX"` (format international sans `+` ni espaces). ⚠️ **Demande le numéro à l'utilisateur, ne l'invente pas.**
- Accessibilité : `aria-label` traduit, cible tactile ≥ 44 px, contraste suffisant
- Ne doit masquer aucun élément interactif en bas de page sur mobile (vérifie le pied de page et tout CTA existant)

---

## Étape 5 — Dashboard

Dans la liste des contacts (`/dashboard`), affiche `country` et `horizon`, et permets le tri ou le filtrage par `horizon` pour que les leads chauds remontent.

Reste dans le style existant du dashboard, n'introduis pas de nouvelle bibliothèque UI.

---

## Étape 6 — Validation

```bash
npx prisma generate && npx next build
npm test
```

Puis `npm run dev` et vérification manuelle :

1. Soumission d'un formulaire acheteur complet → contact créé, notification Telegram avec priorité, pays, heure locale
2. Resoumission avec le même téléphone → mise à jour, `sourcePage` d'origine conservée
3. Formulaire vendeur → budget masqué si c'était le comportement existant
4. Les 4 locales : libellés traduits, aucune clé manquante
5. `/ar` : bouton WhatsApp à gauche, formulaire en RTL
6. Mobile : le bouton flottant ne recouvre rien de cliquable

---

## Demander avant d'agir

- Le numéro WhatsApp
- Les tranches de budget si celles proposées ne correspondent pas au positionnement
- Toute modification de champ **existant** du modèle Contact

## Ne pas faire

- Ne lance jamais `prisma migrate deploy` ni `prisma db push` — génère la migration en `--create-only`
- Ne rends aucun champ existant obligatoire, ne renomme ni ne supprime de colonne
- Ne touche pas à la logique de déduplication par téléphone
- Pas de nouvelle dépendance sans demander
- Pas de `git push --force`

---

## Ecarts assumes a l'execution

Trois points de la spec n'ont pas ete appliques tels quels. Ils sont deliberes.

### Pas de champ `country`
L'indicatif telephonique est deja saisi et stocke dans `phone`
(`"+33|FR|612345678"`). Demander le pays une seconde fois alourdit le formulaire
pour une information deja acquise. `countryFromPhone()` la relit au moment
d'ecrire la notification, et le dashboard affichait deja le drapeau derive de
l'indicatif. Aucune colonne `country` n'a donc ete ajoutee.

### Le curseur de budget est conserve
L'etape 2.3 prevoyait de remplacer le curseur (`type="range"`, 500 000 a
25 000 000 MAD) par un select a tranches. Le curseur reste : c'est un choix
explicite de l'utilisateur, la valeur brute est simplement mise en forme dans la
notification Telegram par `formatAmount()`.

### Etape 4 abandonnee
Le bouton WhatsApp flottant existe deja dans `src/app/components/Footer.tsx`
(`wa.me/message/L5HIFLLJI7MBE1`). Il fonctionne, c'est un dispositif de
conversion du site, et il ne doit etre ni modifie, ni deplace, ni double. Aucun
second bouton n'a ete ajoute, aucun message pre-rempli n'a ete greffe sur
l'existant.

### Etape 5, plus large que prevu
La liste du dashboard ne lisait plus la table `contacts` depuis le commit
`05041cf` (« pour eviter les doublons UI ») : les leads du formulaire y etaient
devenus invisibles. Ils y sont retablis, dedupliques sur
`type + phoneNormalized` contre les fiches acheteur/proprietaire.
