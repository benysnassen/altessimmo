# 🔧 Guide de Configuration des Environnements Altessimmo

## 📁 Structure des fichiers

### `.env` (Développement local)
```bash
# Database - SQLite local
DATABASE_URL="file:./dev.db"

# JWT Secret - Développement (peut être simple)
JWT_SECRET="dev-altessimmo-jwt-key-2024-not-for-production"

# Environment
NODE_ENV="development"

# Debug
DEBUG="true"
```

### `.env.production` (Production Hostinger)
```bash
# Database - MySQL Hostinger
DATABASE_URL="mysql://username:password@host:port/database"

# JWT Secret - Production (ultra-sécurisé)
JWT_SECRET="KUDTmMuId8XKUq+1qiLM8QrSSUdna1+BlGp3lahZmMV/DGDFUCk6sfWrsCROUAklnFQBBsssAV1hB/v/TVQawA=="

# Environment
NODE_ENV="production"

# Hostinger Configuration
HOSTINGER_HOST="your-hostinger-host"
HOSTINGER_USER="your-username"
HOSTINGER_PASS="your-password"

# Security
SECURE_COOKIES="true"
HTTPS_ONLY="true"
```

## 🔐 Sécurité JWT_SECRET

### Développement
- **Longueur** : 32+ caractères
- **Complexité** : Moyenne (peut être simple)
- **Exemple** : `dev-altessimmo-jwt-key-2024-not-for-production`

### Production
- **Longueur** : 64+ caractères
- **Complexité** : Maximale (ultra-sécurisé)
- **Génération** : `node scripts/generate-jwt-secret.js`

## 🚀 Commandes utiles

```bash
# Vérifier la configuration
./scripts/env-manager.sh check

# Configurer pour le développement
./scripts/env-manager.sh dev

# Configurer pour la production
./scripts/env-manager.sh prod

# Générer une nouvelle clé JWT
node scripts/generate-jwt-secret.js
```

## ⚠️ Important

1. **Ne commitez JAMAIS** les fichiers `.env` et `.env.production`
2. **Changez régulièrement** le JWT_SECRET en production
3. **Utilisez HTTPS** en production pour les cookies sécurisés
4. **Sauvegardez** vos clés de production en lieu sûr


