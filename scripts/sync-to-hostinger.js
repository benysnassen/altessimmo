#!/usr/bin/env node

/**
 * Script pour synchroniser la base de données locale avec Hostinger
 * Usage: node scripts/sync-to-hostinger.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Configuration
const LOCAL_DB_PATH = path.join(__dirname, '..', 'dev.db');
const PRODUCTION_DB_URL = process.env.PRODUCTION_DATABASE_URL || 'mysql://u486564963_abysr:VOTRE_MOT_DE_PASSE@localhost:3306/u486564963_tetouan_altess';

async function syncToHostinger() {
  console.log('🔄 Synchronisation vers Hostinger...\n');

  try {
    // 1. Connexion à la base locale (SQLite)
    const localPrisma = new PrismaClient({
      datasources: {
        db: {
          url: `file:${LOCAL_DB_PATH}`
        }
      }
    });

    // 2. Connexion à la base de production (MySQL)
    const productionPrisma = new PrismaClient({
      datasources: {
        db: {
          url: PRODUCTION_DB_URL
        }
      }
    });

    console.log('📊 Récupération des données locales...');
    
    // 3. Récupérer tous les contacts locaux
    const localContacts = await localPrisma.contact.findMany();
    const localAdmins = await localPrisma.admin.findMany();

    console.log(`✅ ${localContacts.length} contacts trouvés`);
    console.log(`✅ ${localAdmins.length} admins trouvés\n`);

    // 4. Synchroniser les contacts
    console.log('📤 Synchronisation des contacts...');
    for (const contact of localContacts) {
      try {
        await productionPrisma.contact.upsert({
          where: { id: contact.id },
          update: {
            name: contact.name,
            phone: contact.phone,
            email: contact.email,
            type: contact.type,
            budget: contact.budget,
            estimation: contact.estimation,
            message: contact.message,
            confidential: contact.confidential,
            status: contact.status,
            updatedAt: new Date()
          },
          create: {
            id: contact.id,
            name: contact.name,
            phone: contact.phone,
            email: contact.email,
            type: contact.type,
            budget: contact.budget,
            estimation: contact.estimation,
            message: contact.message,
            confidential: contact.confidential,
            status: contact.status,
            createdAt: contact.createdAt,
            updatedAt: contact.updatedAt
          }
        });
        console.log(`  ✅ Contact "${contact.name}" synchronisé`);
      } catch (error) {
        console.log(`  ❌ Erreur pour "${contact.name}": ${error.message}`);
      }
    }

    // 5. Synchroniser les admins
    console.log('\n📤 Synchronisation des admins...');
    for (const admin of localAdmins) {
      try {
        await productionPrisma.admin.upsert({
          where: { username: admin.username },
          update: {
            password: admin.password,
            updatedAt: new Date()
          },
          create: {
            id: admin.id,
            username: admin.username,
            password: admin.password,
            createdAt: admin.createdAt,
            updatedAt: admin.updatedAt
          }
        });
        console.log(`  ✅ Admin "${admin.username}" synchronisé`);
      } catch (error) {
        console.log(`  ❌ Erreur pour "${admin.username}": ${error.message}`);
      }
    }

    console.log('\n🎉 Synchronisation terminée avec succès !');
    console.log(`📊 ${localContacts.length} contacts synchronisés`);
    console.log(`👤 ${localAdmins.length} admins synchronisés`);

    // 6. Fermer les connexions
    await localPrisma.$disconnect();
    await productionPrisma.$disconnect();

  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error.message);
    process.exit(1);
  }
}

// Vérifier les variables d'environnement
if (!process.env.PRODUCTION_DATABASE_URL) {
  console.log('⚠️  Variable PRODUCTION_DATABASE_URL non définie');
  console.log('💡 Utilisez: PRODUCTION_DATABASE_URL="mysql://user:pass@host:port/db" node scripts/sync-to-hostinger.js');
  console.log('💡 Ou définissez-la dans votre fichier .env');
}

// Exécuter la synchronisation
if (require.main === module) {
  syncToHostinger();
}

module.exports = { syncToHostinger };
