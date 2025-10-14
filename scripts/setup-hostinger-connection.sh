#!/bin/bash

# Script de configuration pour la connexion Hostinger
# Ce script vous aide à configurer la connexion à votre base de données Hostinger

echo "🚀 Configuration de la connexion Hostinger"
echo "=========================================="
echo ""

# Demander les informations de connexion
read -p "Nom d'utilisateur de la base de données Hostinger: " DB_USER
read -p "Mot de passe de la base de données Hostinger: " DB_PASS
read -p "Nom de la base de données Hostinger: " DB_NAME

# Créer le fichier .env
cat > .env << EOF
# Configuration pour la base de données Hostinger MySQL
DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@localhost:3306/${DB_NAME}"

# Configuration pour le développement local
NODE_ENV="development"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Configuration JWT pour l'authentification
JWT_SECRET="your-super-secret-jwt-key-$(date +%s)"
EOF

echo ""
echo "✅ Fichier .env créé avec succès !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Vérifiez que votre base de données Hostinger est accessible"
echo "2. Exécutez: npx prisma generate"
echo "3. Exécutez: npx prisma db push"
echo "4. Testez votre formulaire !"
echo ""
echo "🔗 URL de connexion générée:"
echo "mysql://${DB_USER}:***@localhost:3306/${DB_NAME}"


