#!/usr/bin/env node

/**
 * Script de création de données de test
 * Usage: node scripts/create-test-data.js
 *
 * Quartiers alignés sur `site.districts` (src/config/site.ts) ; ce script est en
 * CommonJS et ne peut pas importer le module TS, garder les deux en phase à la main.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestData() {
  console.log('🧪 Création des données de test...\n');

  try {
    // 1. Créer un admin de test
    console.log('👤 Création de l\'admin...');
    const admin = await prisma.admin.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password
      }
    });
    console.log(`✅ Admin créé: ${admin.username}`);

    // 2. Créer des acheteurs de test
    console.log('\n🏠 Création des acheteurs...');
    const buyers = [
      {
        name: 'Jean Dupont',
        phone: '+212123456789',
        email: 'jean.dupont@email.com',
        budget: '2500000',
        message: 'Recherche une villa avec jardin à Agdal',
        propertyType: 'Villa',
        location: 'Agdal',
        minSurface: 200,
        maxSurface: 400,
        minRooms: 4,
        maxRooms: 6,
        hasGarden: true,
        hasPool: false,
        hasSeaView: true,
        status: 'NEW'
      },
      {
        name: 'Marie Martin',
        phone: '+212987654321',
        email: 'marie.martin@email.com',
        budget: '1800000',
        message: 'Appartement moderne avec vue mer',
        propertyType: 'Appartement',
        location: 'Hay Riad',
        minSurface: 120,
        maxSurface: 200,
        minRooms: 3,
        maxRooms: 4,
        hasGarden: false,
        hasPool: true,
        hasSeaView: true,
        status: 'INTERESTED'
      },
      {
        name: 'Ahmed Benali',
        phone: '+212555123456',
        email: 'ahmed.benali@email.com',
        budget: '3200000',
        message: 'Villa de luxe avec piscine et jardin',
        propertyType: 'Villa',
        location: 'Hassan',
        minSurface: 300,
        maxSurface: 500,
        minRooms: 5,
        maxRooms: 8,
        hasGarden: true,
        hasPool: true,
        hasSeaView: true,
        status: 'VIEWING'
      }
    ];

    for (const buyerData of buyers) {
      const buyer = await prisma.buyer.create({
        data: buyerData
      });
      console.log(`✅ Acheteur créé: ${buyer.name}`);
    }

    // 3. Créer des vendeurs de test
    console.log('\n🏡 Création des vendeurs...');
    const sellers = [
      {
        name: 'Sophie Laurent',
        phone: '+212111222333',
        email: 'sophie.laurent@email.com',
        message: 'Villa familiale à vendre en toute discrétion',
        propertyType: 'Villa',
        location: 'Souissi',
        surface: 350,
        rooms: 6,
        price: '2800000',
        hasGarden: true,
        hasPool: false,
        hasSeaView: true,
        description: 'Magnifique villa de 350m² avec jardin paysager et vue sur la mer. Idéale pour une famille.',
        status: 'LISTED'
      },
      {
        name: 'Mohammed Alami',
        phone: '+212444555666',
        email: 'mohammed.alami@email.com',
        message: 'Appartement haut de gamme à Hay Riad',
        propertyType: 'Appartement',
        location: 'Hay Riad',
        surface: 180,
        rooms: 4,
        price: '2200000',
        hasGarden: false,
        hasPool: true,
        hasSeaView: true,
        description: 'Appartement moderne de 180m² avec piscine commune et vue panoramique sur la mer.',
        status: 'EVALUATED'
      },
      {
        name: 'Isabelle Moreau',
        phone: '+212777888999',
        email: 'isabelle.moreau@email.com',
        message: 'Villa de prestige avec piscine privée',
        propertyType: 'Villa',
        location: 'Les Orangers',
        surface: 450,
        rooms: 7,
        price: '4500000',
        hasGarden: true,
        hasPool: true,
        hasSeaView: true,
        description: 'Villa exceptionnelle de 450m² avec piscine privée, jardin paysager et accès direct à la plage.',
        status: 'NEW'
      }
    ];

    for (const sellerData of sellers) {
      const seller = await prisma.seller.create({
        data: sellerData
      });
      console.log(`✅ Vendeur créé: ${seller.name}`);
    }

    // 4. Créer des visites de test
    console.log('\n📅 Création des visites...');
    const buyersList = await prisma.buyer.findMany();
    const sellersList = await prisma.seller.findMany();

    if (buyersList.length > 0 && sellersList.length > 0) {
      const visit = await prisma.visit.create({
        data: {
          buyerId: buyersList[0].id,
          sellerId: sellersList[0].id,
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
          status: 'SCHEDULED',
          notes: 'Visite programmée pour la villa de Sophie Laurent'
        }
      });
      console.log(`✅ Visite créée: ${visit.id}`);
    }

    // 5. Créer des offres de test
    console.log('\n💰 Création des offres...');
    if (buyersList.length > 0 && sellersList.length > 0) {
      const offer = await prisma.offer.create({
        data: {
          buyerId: buyersList[1].id,
          sellerId: sellersList[1].id,
          amount: '2000000',
          status: 'PENDING',
          notes: 'Offre pour l\'appartement de Mohammed Alami'
        }
      });
      console.log(`✅ Offre créée: ${offer.amount} MAD`);
    }

    // 6. Créer des notes de test
    console.log('\n📝 Création des notes...');
    if (buyersList.length > 0) {
      const note = await prisma.note.create({
        data: {
          buyerId: buyersList[0].id,
          content: 'Client très intéressé par les villas avec jardin. Budget flexible.',
          type: 'CALL'
        }
      });
      console.log(`✅ Note créée: ${note.type}`);
    }

    console.log('\n🎉 Données de test créées avec succès !');
    console.log(`📊 Résumé:`);
    console.log(`   - ${buyersList.length} acheteurs`);
    console.log(`   - ${sellersList.length} vendeurs`);
    console.log(`   - 1 admin`);
    console.log(`   - 1 visite`);
    console.log(`   - 1 offre`);
    console.log(`   - 1 note`);

  } catch (error) {
    console.error('❌ Erreur lors de la création des données:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la création des données
if (require.main === module) {
  createTestData();
}

module.exports = { createTestData };
