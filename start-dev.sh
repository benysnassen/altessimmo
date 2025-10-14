#!/bin/bash

echo "🚀 Démarrage d'Altessimmo..."

# Nettoyer le cache Next.js
echo "🧹 Nettoyage du cache..."
rm -rf .next
rm -rf node_modules/.cache

# Régénérer le client Prisma
echo "🔧 Régénération du client Prisma..."
npx prisma generate

# Vérifier la connexion à la base de données
echo "🔍 Vérification de la connexion à la base de données..."
npx prisma db pull --print > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Connexion à la base de données OK"
else
    echo "❌ Erreur de connexion à la base de données"
    exit 1
fi

# Démarrer le serveur de développement
echo "🌟 Démarrage du serveur de développement..."
npm run dev
