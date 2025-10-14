# 🚀 Guide de Migration vers Hostinger - Structure Professionnelle

## 📊 **Nouvelle Structure de Données**

### **🏠 Acheteurs (Buyers)**
- **Profil** : Nom, téléphone, email, budget, message
- **Préférences** : Type de bien, localisation, surface min/max, pièces min/max
- **Caractéristiques** : Jardin, piscine, vue mer
- **Statut** : Nouveau → Contacté → Intéressé → En visite → Offre → Acheté
- **Historique** : Visites, offres, notes

### **🏡 Vendeurs (Sellers)**
- **Profil** : Nom, téléphone, email, message
- **Bien** : Type, localisation, surface, pièces, prix, description
- **Caractéristiques** : Jardin, piscine, vue mer
- **Statut** : Nouveau → Contacté → Évalué → En vente → Offre → Vendu
- **Historique** : Visites, offres, notes

### **📅 Visites**
- **Lien** : Acheteur ↔ Vendeur
- **Statut** : Programmée → Confirmée → Réalisée → Annulée
- **Notes** : Commentaires sur la visite

### **💰 Offres**
- **Lien** : Acheteur → Vendeur
- **Statut** : En attente → Acceptée → Refusée → Contre-offre
- **Montant** : Prix proposé

### **📝 Notes**
- **Types** : Général, Appel, Email, Visite, Offre, Négociation, Important
- **Contenu** : Notes détaillées sur les interactions

## 🔧 **Migration Élégante vers Hostinger**

### **1. Préparation**

```bash
# 1. Créer le fichier .env.production avec vos vraies informations
DATABASE_URL="mysql://u486564963_abysr:VOTRE_MOT_DE_PASSE@localhost:3306/u486564963_tetouan_altess"
NEXT_PUBLIC_BASE_URL="https://tetouan.altessimmo.com"
NODE_ENV="production"

# 2. Définir la variable d'environnement
export PRODUCTION_DATABASE_URL="mysql://u486564963_abysr:VOTRE_MOT_DE_PASSE@localhost:3306/u486564963_tetouan_altess"
```

### **2. Migration Automatique**

```bash
# Exécuter la migration
node scripts/migrate-to-hostinger.js
```

### **3. Vérification**

```bash
# Vérifier les données migrées
npx prisma studio --schema=./prisma/schema.prisma
```

## 📋 **Étapes de Migration**

### **Étape 1 : Créer la base de données sur Hostinger**
1. **Connectez-vous** à votre panneau Hostinger
2. **Allez dans** "Bases de données MySQL"
3. **Créez** une nouvelle base :
   - **Nom** : `u486564963_tetouan_altess`
   - **Utilisateur** : `u486564963_abysr`
   - **Mot de passe** : (votre mot de passe)

### **Étape 2 : Appliquer le schéma**
```bash
# Générer le client Prisma pour MySQL
npx prisma generate

# Appliquer le schéma à la base de production
npx prisma db push --schema=./prisma/schema.prisma
```

### **Étape 3 : Migrer les données**
```bash
# Exécuter la migration
node scripts/migrate-to-hostinger.js
```

### **Étape 4 : Vérifier la migration**
```bash
# Tester la connexion
npx prisma studio --schema=./prisma/schema.prisma
```

## 🎯 **Avantages de la Nouvelle Structure**

### **Pour les Acheteurs :**
- ✅ **Préférences détaillées** : Type, localisation, surface, pièces
- ✅ **Caractéristiques** : Jardin, piscine, vue mer
- ✅ **Suivi complet** : Visites, offres, notes
- ✅ **Statuts précis** : Nouveau → Acheté

### **Pour les Vendeurs :**
- ✅ **Bien détaillé** : Type, localisation, surface, prix
- ✅ **Caractéristiques** : Jardin, piscine, vue mer
- ✅ **Suivi complet** : Visites, offres, notes
- ✅ **Statuts précis** : Nouveau → Vendu

### **Pour la Gestion :**
- ✅ **Historique complet** : Toutes les interactions
- ✅ **Notes organisées** : Par type d'interaction
- ✅ **Visites suivies** : Programmation et suivi
- ✅ **Offres gérées** : Statuts et négociations

## 🔧 **Commandes Utiles**

### **Migration**
```bash
# Migration complète
node scripts/migrate-to-hostinger.js

# Vérifier les données
npx prisma studio
```

### **Gestion des Données**
```bash
# Créer un nouvel acheteur
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"type":"buyer","name":"Jean Dupont","phone":"+212123456789","budget":"2000000"}'

# Créer un nouveau vendeur
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"type":"seller","name":"Marie Martin","phone":"+212987654321","price":"3000000"}'
```

### **Requêtes**
```bash
# Récupérer tous les acheteurs
curl http://localhost:3000/api/clients?type=buyers

# Récupérer tous les vendeurs
curl http://localhost:3000/api/clients?type=sellers

# Récupérer par statut
curl http://localhost:3000/api/clients?type=buyers&status=NEW
```

## ⚠️ **Points Importants**

1. **Sauvegarde** : Faites une sauvegarde avant la migration
2. **Test** : Testez d'abord en local
3. **Vérification** : Vérifiez les données après migration
4. **Sécurité** : Ne commitez jamais les mots de passe

## 🆘 **Dépannage**

### **Erreur de connexion MySQL**
```bash
# Tester la connexion
mysql -h localhost -u u486564963_abysr -p u486564963_tetouan_altess
```

### **Erreur de migration**
```bash
# Vérifier les logs
node scripts/migrate-to-hostinger.js 2>&1 | tee migration.log
```

### **Erreur Prisma**
```bash
# Régénérer le client
npx prisma generate

# Réinitialiser la base
npx prisma db push --force-reset
```

## 📞 **Support**

Si vous rencontrez des problèmes :
1. Vérifiez les logs d'erreur
2. Testez la connexion MySQL
3. Vérifiez les permissions de la base de données
4. Contactez le support Hostinger si nécessaire
