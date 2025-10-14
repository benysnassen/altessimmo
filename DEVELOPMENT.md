# 🚀 Guide de Développement - Altessimmo

## ⚡ Démarrage Rapide

### Option 1 : Démarrage Simple (Recommandé)
```bash
npm run dev:clean
```

### Option 2 : Démarrage Standard
```bash
npm run dev
```

### Option 3 : Démarrage Windows
```bash
npm run dev:clean:win
```

## 🔧 Commandes Utiles

### Base de Données
```bash
# Synchroniser la base de données
npm run db:sync

# Réinitialiser complètement la base de données
npm run db:reset
```

### Développement
```bash
# Démarrer avec nettoyage du cache
npm run dev:clean

# Build de production
npm run build

# Lancer en production
npm run start
```

## 🐛 Résolution de Problèmes

### Problème de Connexion à la Base de Données
Si vous rencontrez des erreurs de connexion :

1. **Vérifiez le fichier `.env.local`** :
   ```bash
   cat .env.local
   ```

2. **Testez la connexion** :
   ```bash
   npx prisma db pull --print
   ```

3. **Régénérez le client Prisma** :
   ```bash
   npx prisma generate
   ```

### Cache Next.js
Si le problème persiste, nettoyez le cache :
```bash
rm -rf .next
rm -rf node_modules/.cache
npm run dev:clean
```

## 📁 Structure des Fichiers

- `.env.local` - Variables d'environnement (priorité sur .env)
- `start-dev.sh` - Script de démarrage Linux/Mac
- `start-dev.bat` - Script de démarrage Windows
- `prisma/schema.prisma` - Schéma de base de données

## 🔐 Sécurité

- Les identifiants de base de données sont dans `.env.local`
- Le fichier `.env.local` est dans `.gitignore`
- Utilisez toujours `npm run dev:clean` pour un démarrage propre

## 📞 Support

En cas de problème persistant, utilisez :
```bash
npm run db:sync && npm run dev:clean
```
