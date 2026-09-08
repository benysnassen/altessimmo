# Le CRM au quotidien

Comment un lead arrive, ce que le dashboard en fait, et les gestes qui évitent de le
perdre. Ce document décrit l'outil tel qu'il tourne en production.

---

## 1. Un lead arrive

Le visiteur remplit le formulaire de `/contact`. Trois choses sont collectées en plus de
ses coordonnées :

- **son échéance** — sous 3 mois 🔥, 6 à 12 mois 🟠, ou il se renseigne ⚪️ ;
- **la page d'où il vient**, relevée automatiquement, jamais saisie ;
- **son indicatif téléphonique**, qui donne son pays et son fuseau horaire.

Rien de tout cela ne lui est demandé deux fois : le pays se déduit de l'indicatif.

### La notification Telegram

Elle arrive immédiatement, et elle est faite pour être triée d'un coup d'œil sur un
téléphone :

```
🔥 Nouveau ACHETEUR — Rabat
Sous 3 mois

👤 Nom: ...
📱 Téléphone: ...
🇫🇷 Indicatif: FR
🕒 Heure sur place: 14:32 — Europe/Paris
💰 Budget: 2 500 000 MAD
🔗 Page d'origine: /fr/biens
💬 Message: ...
```

L'heure sur place évite d'appeler Montréal à 3 h du matin. Pour les pays à plusieurs
fuseaux — États-Unis, Canada — le fuseau principal est affiché avec la mention
« fuseau principal » : c'est une indication, pas une certitude.

**Si le prospect revient**, l'en-tête change : « ACHETEUR QUI REVIENT », avec le rang de
la demande et le statut où vous l'aviez laissé. Le message cité est celui qu'il vient
d'écrire, pas l'ancien.

**Si Telegram tombe**, vous ne recevez rien — mais le lead n'est pas perdu pour autant :
il apparaît dans le dashboard marqué **à rappeler aujourd'hui**. C'est le filet.

---

## 2. Le dashboard

Deux onglets, **Acheteurs** et **Propriétaires**. La liste n'est pas triée par date
d'arrivée mais **par urgence** :

1. les rappels **en retard** ;
2. ceux **du jour** ;
3. les dates **à venir**, dans l'ordre ;
4. et en dernier ceux **sans date** — les prospects que personne ne suit.

En haut, un compteur apparaît dès qu'il y a matière : « 3 en retard », « 2 à rappeler
aujourd'hui ». Cliquez dessus pour n'afficher que ceux-là, recliquez pour tout revoir.

Les filtres permettent aussi d'isoler une échéance (les 🔥 d'abord, par exemple) ou un
statut.

### Lire une ligne

| Ce que vous voyez | Ce que ça dit |
|---|---|
| 🇫🇷 drapeau | le pays de l'indicatif |
| 🔥 🟠 ⚪️ | l'échéance annoncée par le prospect |
| ⭐ étoiles | votre évaluation |
| 📝 | une note personnelle existe |
| badge rouge | rappel en retard |
| badge ambre | à rappeler aujourd'hui |

---

## 3. Les gestes

Le menu « ⋮ » au bout de chaque ligne :

- **📞 Appeler** — ouvre le téléphone sur le bon numéro, rien à recopier.
- **💬 WhatsApp** — ouvre la conversation avec ce prospect.
- **✅ Rappelé** — l'action est faite : la date de relance tombe, et un lead encore
  « Nouveau » passe « Contacté ». Rien d'autre ne bouge.
- **👤+ Convertir** — crée la fiche client à partir du lead. N'apparaît que sur les leads
  qui n'en ont pas encore.
- **✏️ Modifier** et **🗑️ Supprimer**.

### Poser une date de rappel

Ouvrez la fiche : le bloc **Prochaine action** propose *demain*, *dans 3 jours*, *dans
1 semaine*, *dans 1 mois*, un champ de date pour le reste, et **Retirer**.

Retirer la date ne change pas le statut : ce sont deux informations différentes. Le
statut dit où en est l'affaire, la date dit quand vous vous en occupez.

> **La règle qui fait tout tenir** : un prospect sans date de rappel n'est suivi par
> personne. Le filtre « Sans date de rappel » existe pour les débusquer.

### Convertir un lead

Un lead du formulaire et une fiche client sont deux objets distincts. Le lead garde
l'origine et l'historique des demandes ; la fiche porte le suivi commercial, les
préférences, les biens qui l'intéressent.

Convertir crée la fiche sans rien effacer, en reportant le statut où vous en étiez. Le
prospect n'apparaît **pas** en double : la liste rapproche les deux par téléphone.
Convertir deux fois est refusé.

---

## 4. Ce qui est conservé, et ne s'efface jamais

Quand un prospect **renvoie le formulaire** avec le même numéro :

- son ancien message **n'est pas écrasé** — chaque demande est conservée à part et
  s'affiche dans la fiche, sous « Demandes » ;
- une information qu'il ne redonne pas (budget, email) **reste** ;
- son statut de suivi **est conservé** : un prospect en « Visite » qui repose une
  question reste en « Visite » ;
- sauf s'il était **archivé** : il repasse alors en « Nouveau », puisqu'il se manifeste.

C'est ce qui permet d'ouvrir une fiche six mois plus tard et de retrouver l'argumentaire
du rappel, pas seulement la dernière phrase.

---

## 5. Accès

- Dashboard : `rabat.altessimmo.com/login` — **sans** préfixe de langue.
- Les pages d'administration ne sont pas traduites : `/fr/login` répondra 404, c'est
  normal.
- Le premier compte se crée sur `/admin-setup/` avec la clé maître, et cette page se
  verrouille dès qu'un compte existe.
- Le fichier client n'est accessible qu'authentifié : toute lecture de l'API sans
  session est refusée.

---

## 6. Tester le formulaire sans polluer le fichier

Envoyez-vous une demande depuis le site avec un numéro reconnaissable, vérifiez que la
notification arrive et que la fiche apparaît, puis supprimez-la depuis le dashboard —
le menu « ⋮ », **Supprimer**, avec confirmation.

Points à vérifier lors d'un test :

1. la notification Telegram arrive, avec la priorité, le drapeau et l'heure locale ;
2. le lead est dans le bon onglet, acheteur ou propriétaire ;
3. renvoyer le **même numéro** avec un autre message : la fiche doit afficher
   **deux demandes**, et non une seule remplacée ;
4. en arabe, le formulaire s'affiche de droite à gauche et les libellés sont traduits ;
5. si l'envoi échoue, un message rouge le dit et vos réponses restent à l'écran.

Le point 5 est celui qui compte le plus : c'est la seule chose qui, si elle se tait,
vous fait perdre des clients sans jamais le savoir.
