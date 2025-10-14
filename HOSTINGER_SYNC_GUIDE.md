# 🚀 Guide de Synchronisation Hostinger

## 📋 **Étapes pour synchroniser votre base de données locale avec Hostinger**

### **1. Créer la base de données sur Hostinger**

1. **Connectez-vous** à votre panneau Hostinger
2. **Allez dans** "Bases de données MySQL"
3. **Créez** une nouvelle base de données :
   - **Nom** : `altessimmo_db`
   - **Utilisateur** : `altessimmo_user`
   - **Mot de passe** : (générez un mot de passe fort)
   - **Hôte** : `localhost` (ou l'hôte fourni par Hostinger)

### **2. Configurer les variables d'environnement**

Créez un fichier `.env.production` avec vos vraies informations :

```bash
# Remplacez par vos vraies informations Hostinger
DATABASE_URL="mysql://altessimmo_user:VOTRE_VRAI_MOT_DE_PASSE@localhost:3306/altessimmo_db"
NEXT_PUBLIC_BASE_URL="https://votre-domaine.com"
NODE_ENV="production"
```

### **3. Synchroniser les données**

#### **Option A : Script automatique (Recommandé)**

```bash
# Définir la variable d'environnement
export PRODUCTION_DATABASE_URL="mysql://altessimmo_user:VOTRE_MOT_DE_PASSE@localhost:3306/altessimmo_db"

# Exécuter la synchronisation
node scripts/sync-to-hostinger.js
```

#### **Option B : Synchronisation manuelle**

```bash
# 1. Générer le client Prisma pour MySQL
npx prisma generate

# 2. Appliquer le schéma à la base de production
npx prisma db push --schema=./prisma/schema.prisma

# 3. Créer l'admin sur Hostinger
curl -X POST https://votre-domaine.com/api/admin/create/
```

### **4. Vérifier la synchronisation**

```bash
# Tester la connexion à la base de production
npx prisma studio --schema=./prisma/schema.prisma
```

### **5. Déployer l'application**

```bash
# Build pour la production
npm run build

# Uploader les fichiers sur Hostinger
# - .next/standalone/
# - .next/static/
# - public/
# - package.json
# - server.js
# - .env.production
```

## 🔧 **Commandes utiles**

### **Synchronisation des données**
```bash
# Synchroniser tous les contacts et admins
node scripts/sync-to-hostinger.js

# Vérifier les données locales
npx prisma studio
```

### **Gestion de la base de données**
```bash
# Réinitialiser la base locale
rm dev.db && npx prisma db push

# Créer un nouvel admin
curl -X POST http://localhost:3000/api/admin/create/
```

### **Déploiement**
```bash
# Build complet
npm run build

# Test local avec config production
NODE_ENV=production npm start
```

## ⚠️ **Points importants**

1. **Sécurité** : Ne commitez jamais vos vraies informations de base de données
2. **Sauvegarde** : Faites une sauvegarde avant la synchronisation
3. **Test** : Testez toujours en local avant de déployer
4. **Mot de passe** : Changez le mot de passe admin par défaut

## 🆘 **Dépannage**

### **Erreur de connexion MySQL**
```bash
# Vérifier la connexion
mysql -h localhost -u altessimmo_user -p altessimmo_db
```

### **Erreur Prisma**
```bash
# Régénérer le client
npx prisma generate

# Réinitialiser la base
npx prisma db push --force-reset
```

### **Erreur de synchronisation**
```bash
# Vérifier les logs
node scripts/sync-to-hostinger.js 2>&1 | tee sync.log
```

## 📞 **Support**

Si vous rencontrez des problèmes :
1. Vérifiez les logs d'erreur
2. Testez la connexion MySQL
3. Vérifiez les permissions de la base de données
4. Contactez le support Hostinger si nécessaire
