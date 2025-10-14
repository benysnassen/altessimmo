@echo off
echo 🚀 Démarrage d'Altessimmo...

REM Nettoyer le cache Next.js
echo 🧹 Nettoyage du cache...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

REM Régénérer le client Prisma
echo 🔧 Régénération du client Prisma...
npx prisma generate

REM Vérifier la connexion à la base de données
echo 🔍 Vérification de la connexion à la base de données...
npx prisma db pull --print > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Connexion à la base de données OK
) else (
    echo ❌ Erreur de connexion à la base de données
    pause
    exit /b 1
)

REM Démarrer le serveur de développement
echo 🌟 Démarrage du serveur de développement...
npm run dev
