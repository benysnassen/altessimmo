const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRatingDisplay() {
  try {
    console.log('🔍 Test de l\'affichage des évaluations...');
    
    // Créer plusieurs contacts avec différentes évaluations
    const contacts = [
      {
        name: 'Mohamed Benali',
        phone: '+212 600 111 222',
        type: 'BUYER',
        budget: '1500000',
        rating: 5,
        status: 'NEW'
      },
      {
        name: 'Aicha Mansouri',
        phone: '+212 600 333 444',
        type: 'SELLER',
        estimation: '2800000',
        rating: 3,
        status: 'NEW'
      },
      {
        name: 'Youssef Alami',
        phone: '+212 600 555 666',
        type: 'BUYER',
        budget: '800000',
        rating: 1,
        status: 'NEW'
      },
      {
        name: 'Khadija Tazi',
        phone: '+212 600 777 888',
        type: 'SELLER',
        estimation: '4500000',
        rating: 4,
        status: 'NEW'
      }
    ];
    
    for (const contactData of contacts) {
      const contact = await prisma.contact.create({
        data: contactData
      });
      console.log(`✅ Contact créé: ${contact.name} - ${contact.rating} étoiles`);
    }
    
    console.log('🎉 Tous les contacts de test ont été créés !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRatingDisplay();
