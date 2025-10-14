#!/bin/bash

# Script de gestion des environnements Altessimmo
# Usage: ./scripts/env-manager.sh [dev|prod|check]

ENV_TYPE=${1:-dev}

echo "🔧 Gestionnaire d'environnement Altessimmo"
echo "=========================================="

case $ENV_TYPE in
  "dev"|"development")
    echo "📁 Configuration pour le DÉVELOPPEMENT"
    echo "─" | head -c 50; echo
    
    if [ ! -f .env ]; then
      echo "❌ Fichier .env manquant"
      echo "📝 Création du fichier .env pour le développement..."
      
      cat > .env << EOF
# Database - Développement local
DATABASE_URL="file:./dev.db"

# JWT Secret - Développement (peut être simple)
JWT_SECRET="dev-altessimmo-jwt-key-2024-not-for-production"

# Environment
NODE_ENV="development"

# Debug
DEBUG="true"
EOF
      echo "✅ Fichier .env créé"
    else
      echo "✅ Fichier .env existe déjà"
    fi
    
    echo ""
    echo "🚀 Variables d'environnement chargées pour le développement"
    ;;
    
  "prod"|"production")
    echo "🌐 Configuration pour la PRODUCTION"
    echo "─" | head -c 50; echo
    
    if [ ! -f .env.production ]; then
      echo "❌ Fichier .env.production manquant"
      echo "📝 Création du fichier .env.production..."
      
      # Générer une clé JWT sécurisée
      JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('base64'))")
      
      cat > .env.production << EOF
# Database - Production (Hostinger)
DATABASE_URL="mysql://username:password@host:port/database"

# JWT Secret - Production (ultra-sécurisé)
JWT_SECRET="${JWT_SECRET}"

# Environment
NODE_ENV="production"

# Hostinger Configuration
HOSTINGER_HOST="your-hostinger-host"
HOSTINGER_USER="your-username"
HOSTINGER_PASS="your-password"

# Security
SECURE_COOKIES="true"
HTTPS_ONLY="true"
EOF
      echo "✅ Fichier .env.production créé avec clé JWT sécurisée"
    else
      echo "✅ Fichier .env.production existe déjà"
    fi
    
    echo ""
    echo "🔒 Variables d'environnement chargées pour la production"
    ;;
    
  "check"|"verify")
    echo "🔍 Vérification des environnements"
    echo "─" | head -c 50; echo
    
    echo "📁 Fichiers d'environnement:"
    [ -f .env ] && echo "✅ .env (développement)" || echo "❌ .env manquant"
    [ -f .env.production ] && echo "✅ .env.production (production)" || echo "❌ .env.production manquant"
    
    echo ""
    echo "🔐 Vérification JWT_SECRET:"
    
    if [ -f .env ]; then
      DEV_JWT=$(grep JWT_SECRET .env | cut -d'=' -f2 | tr -d '"')
      DEV_LENGTH=${#DEV_JWT}
      echo "📱 Développement: ${DEV_LENGTH} caractères"
      [ $DEV_LENGTH -ge 32 ] && echo "✅ Longueur OK" || echo "⚠️  Longueur faible"
    fi
    
    if [ -f .env.production ]; then
      PROD_JWT=$(grep JWT_SECRET .env.production | cut -d'=' -f2 | tr -d '"')
      PROD_LENGTH=${#PROD_JWT}
      echo "🌐 Production: ${PROD_LENGTH} caractères"
      [ $PROD_LENGTH -ge 64 ] && echo "✅ Longueur excellente" || echo "⚠️  Longueur faible"
    fi
    
    echo ""
    echo "📊 Recommandations:"
    echo "• Développement: 32+ caractères"
    echo "• Production: 64+ caractères"
    echo "• Changez régulièrement en production"
    ;;
    
  *)
    echo "❌ Usage: $0 [dev|prod|check]"
    echo ""
    echo "Commandes disponibles:"
    echo "  dev     - Configurer pour le développement"
    echo "  prod    - Configurer pour la production"
    echo "  check   - Vérifier la configuration"
    exit 1
    ;;
esac

echo ""
echo "🎯 Prochaines étapes:"
echo "1. Vérifiez vos fichiers d'environnement"
echo "2. Configurez vos variables spécifiques"
echo "3. Ne commitez JAMAIS les fichiers .env"
echo "4. Utilisez .env.example pour le partage"


