#!/usr/bin/env node

/**
 * Script de migration élégant pour Hostinger
 * Migre les données existantes vers la nouvelle structure
 * Usage: node scripts/migrate-to-hostinger.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Configuration
const LOCAL_DB_PATH = path.join(__dirname, '..', 'dev.db');
const PRODUCTION_DB_URL = process.env.PRODUCTION_DATABASE_URL || 'mysql://u486564963_abysr:VOTRE_MOT_DE_PASSE@localhost:3306/u486564963_tetouan_altess';

async function migrateToHostinger() {
  console.log('🚀 Migration vers Hostinger...\n');

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

    // 4. Migrer les contacts vers les nouvelles tables
    console.log('📤 Migration des contacts...');
    for (const contact of localContacts) {
      try {
        if (contact.type === 'BUYER') {
          // Créer un acheteur
          await productionPrisma.buyer.upsert({
            where: { id: contact.id },
            update: {
              name: contact.name,
              phone: contact.phone,
              email: contact.email,
              budget: contact.budget || '0',
              message: contact.message,
              confidential: contact.confidential,
              status: mapContactStatusToBuyerStatus(contact.status),
              updatedAt: new Date()
            },
            create: {
              id: contact.id,
              name: contact.name,
              phone: contact.phone,
              email: contact.email,
              budget: contact.budget || '0',
              message: contact.message,
              confidential: contact.confidential,
              status: mapContactStatusToBuyerStatus(contact.status),
              createdAt: contact.createdAt,
              updatedAt: contact.updatedAt
            }
          });
          console.log(`  ✅ Acheteur "${contact.name}" migré`);
        } else if (contact.type === 'SELLER') {
          // Créer un vendeur
          await productionPrisma.seller.upsert({
            where: { id: contact.id },
            update: {
              name: contact.name,
              phone: contact.phone,
              email: contact.email,
              message: contact.message,
              confidential: contact.confidential,
              status: mapContactStatusToSellerStatus(contact.status),
              updatedAt: new Date()
            },
            create: {
              id: contact.id,
              name: contact.name,
              phone: contact.phone,
              email: contact.email,
              message: contact.message,
              confidential: contact.confidential,
              status: mapContactStatusToSellerStatus(contact.status),
              createdAt: contact.createdAt,
              updatedAt: contact.updatedAt
            }
          });
          console.log(`  ✅ Vendeur "${contact.name}" migré`);
        }
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

    console.log('\n🎉 Migration terminée avec succès !');
    console.log(`📊 ${localContacts.length} contacts migrés`);
    console.log(`👤 ${localAdmins.length} admins synchronisés`);

    // 6. Fermer les connexions
    await localPrisma.$disconnect();
    await productionPrisma.$disconnect();

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  }
}

// Fonctions de mapping des statuts
function mapContactStatusToBuyerStatus(contactStatus) {
  const statusMap = {
    'NEW': 'NEW',
    'CONTACTED': 'CONTACTED',
    'INTERESTED': 'INTERESTED',
    'VIEWING': 'VIEWING',
    'OFFER': 'OFFER_MADE',
    'SOLD': 'PURCHASED',
    'ARCHIVED': 'ARCHIVED'
  };
  return statusMap[contactStatus] || 'NEW';
}

function mapContactStatusToSellerStatus(contactStatus) {
  const statusMap = {
    'NEW': 'NEW',
    'CONTACTED': 'CONTACTED',
    'INTERESTED': 'EVALUATED',
    'VIEWING': 'VIEWING',
    'OFFER': 'OFFER_RECEIVED',
    'SOLD': 'SOLD',
    'ARCHIVED': 'ARCHIVED'
  };
  return statusMap[contactStatus] || 'NEW';
}

// Vérifier les variables d'environnement
if (!process.env.PRODUCTION_DATABASE_URL) {
  console.log('⚠️  Variable PRODUCTION_DATABASE_URL non définie');
  console.log('💡 Utilisez: PRODUCTION_DATABASE_URL="mysql://user:pass@host:port/db" node scripts/migrate-to-hostinger.js');
  console.log('💡 Ou définissez-la dans votre fichier .env');
}

// Exécuter la migration
if (require.main === module) {
  migrateToHostinger();
}

module.exports = { migrateToHostinger };
