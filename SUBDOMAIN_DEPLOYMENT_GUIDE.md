# 🌐 Guide de Déploiement - Sous-domaine tetouane.altessimmo.com

## 📋 **Étapes pour déployer sur tetouane.altessimmo.com**

### **1. Créer le sous-domaine sur Hostinger**

1. **Connectez-vous** à votre panneau Hostinger
2. **Allez dans** "Sous-domaines" ou "Subdomains"
3. **Créez** un nouveau sous-domaine :
   - **Nom** : `tetouane`
   - **Domaine principal** : `altessimmo.com`
   - **Répertoire** : `public_html/tetouane`
   - **DNS** : Automatique (géré par Hostinger)

### **2. Créer la base de données MySQL**

1. **Allez dans** "Bases de données MySQL"
2. **Créez** une nouvelle base :
   - **Nom** : `altessimmo_tetouane_db`
   - **Utilisateur** : `altessimmo_tetouane_user`
   - **Mot de passe** : (générez un mot de passe fort)
   - **Hôte** : `localhost`

### **3. Préparer l'application pour le déploiement**

```bash
# 1. Build de production
npm run build

# 2. Créer le fichier .env.production
cp env.production.example .env.production
# Puis éditez .env.production avec vos vraies informations
```

### **4. Configuration du fichier .env.production**

```bash
# Remplacez par vos vraies informations Hostinger
DATABASE_URL="mysql://altessimmo_tetouane_user:VOTRE_VRAI_MOT_DE_PASSE@localhost:3306/altessimmo_tetouane_db"
NEXT_PUBLIC_BASE_URL="https://tetouane.altessimmo.com"
NODE_ENV="production"
```

### **5. Upload des fichiers sur Hostinger**

Via **File Manager** ou **FTP**, uploadez dans `public_html/tetouane/` :

```
tetouane/
├── .next/
│   ├── standalone/
│   └── static/
├── public/
├── package.json
├── server.js
├── .env.production
└── .htaccess
```

### **6. Configuration Apache (.htaccess)**

Le fichier `.htaccess` est déjà configuré pour :
- Redirection vers `server.js`
- Gestion des routes Next.js
- Cache et sécurité

### **7. Synchroniser la base de données**

```bash
# Depuis votre machine locale
export PRODUCTION_DATABASE_URL="mysql://altessimmo_tetouane_user:VOTRE_MOT_DE_PASSE@localhost:3306/altessimmo_tetouane_db"

# Synchroniser les données
node scripts/sync-to-hostinger.js
```

### **8. Vérifier le déploiement**

1. **Visitez** `https://tetouane.altessimmo.com`
2. **Testez** le formulaire de contact
3. **Connectez-vous** au dashboard : `https://tetouane.altessimmo.com/login`
4. **Vérifiez** que les données sont synchronisées

## 🔧 **Commandes de déploiement**

### **Build et préparation**
```bash
# Build complet
npm run build

# Vérifier les fichiers générés
ls -la .next/standalone/
```

### **Synchronisation des données**
```bash
# Synchroniser vers Hostinger
node scripts/sync-to-hostinger.js

# Vérifier la connexion
npx prisma studio --schema=./prisma/schema.prisma
```

### **Test local avec config production**
```bash
# Tester avec la config de production
NODE_ENV=production npm start
```

## 📁 **Structure des fichiers à uploader**

```
public_html/tetouane/
├── .next/
│   ├── standalone/
│   │   ├── server.js
│   │   ├── .next/
│   │   └── node_modules/
│   └── static/
├── public/
│   ├── favicon.ico
│   └── ...
├── package.json
├── server.js
├── .env.production
└── .htaccess
```

## ⚠️ **Points importants**

1. **Sécurité** : Ne commitez jamais `.env.production`
2. **Permissions** : Vérifiez les permissions des fichiers (644 pour les fichiers, 755 pour les dossiers)
3. **Base de données** : Testez la connexion avant le déploiement
4. **DNS** : Le sous-domaine peut prendre quelques minutes à être actif

## 🆘 **Dépannage**

### **Le sous-domaine ne fonctionne pas**
- Vérifiez que le DNS est propagé (peut prendre 24h)
- Vérifiez la configuration dans le panneau Hostinger

### **Erreur de base de données**
```bash
# Tester la connexion
mysql -h localhost -u altessimmo_tetouane_user -p altessimmo_tetouane_db
```

### **Erreur 500 sur le site**
- Vérifiez les logs d'erreur dans le panneau Hostinger
- Vérifiez que `server.js` est exécutable
- Vérifiez les permissions des fichiers

## 🎯 **URLs importantes**

- **Site principal** : `https://tetouane.altessimmo.com`
- **Formulaire de contact** : `https://tetouane.altessimmo.com/contact`
- **Dashboard** : `https://tetouane.altessimmo.com/login`
- **API** : `https://tetouane.altessimmo.com/api/...`

## 📞 **Support**

Si vous rencontrez des problèmes :
1. Vérifiez les logs d'erreur Hostinger
2. Testez la connexion MySQL
3. Vérifiez les permissions des fichiers
4. Contactez le support Hostinger si nécessaire
