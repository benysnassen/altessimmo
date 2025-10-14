const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testStarDisplay() {
  try {
    console.log('🔍 Test de l\'affichage des étoiles...');
    
    // Créer un contact de test avec une évaluation
    const testContact = await prisma.contact.create({
      data: {
        name: 'Test Étoiles',
        phone: '+212 600 999 000',
        type: 'BUYER',
        budget: '1200000',
        rating: 3,
        status: 'NEW'
      }
    });
    
    console.log('✅ Contact créé:', {
      name: testContact.name,
      rating: testContact.rating
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testStarDisplay();
