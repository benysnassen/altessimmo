#!/bin/bash

# Script de test de connexion Hostinger
echo "🧪 Test de connexion à la base de données Hostinger"
echo "=================================================="
echo ""

# Vérifier si le fichier .env existe
if [ ! -f ".env" ]; then
    echo "❌ Fichier .env non trouvé !"
    echo "Exécutez d'abord: ./scripts/setup-hostinger-connection.sh"
    exit 1
fi

# Charger les variables d'environnement
source .env

echo "📡 Test de connexion à la base de données..."
echo "URL: ${DATABASE_URL}"
echo ""

# Générer le client Prisma
echo "🔧 Génération du client Prisma..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Client Prisma généré avec succès"
else
    echo "❌ Erreur lors de la génération du client Prisma"
    exit 1
fi

echo ""
echo "🗄️ Synchronisation du schéma avec la base de données..."
npx prisma db push

if [ $? -eq 0 ]; then
    echo "✅ Schéma synchronisé avec succès"
else
    echo "❌ Erreur lors de la synchronisation du schéma"
    echo "Vérifiez vos informations de connexion dans le fichier .env"
    exit 1
fi

echo ""
echo "🎉 Configuration terminée !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Démarrez votre serveur: npm run dev"
echo "2. Testez le formulaire sur: http://localhost:3000/contact"
echo "3. Vérifiez les données dans votre dashboard: http://localhost:3000/dashboard"
echo ""
echo "🔍 Pour vérifier les données dans votre base Hostinger :"
echo "npx prisma studio"


