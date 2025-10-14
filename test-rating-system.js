const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRatingSystem() {
  try {
    console.log('🔍 Test du système d\'évaluation par étoiles...');
    
    // Créer un contact de test avec une évaluation
    const testContact = await prisma.contact.create({
      data: {
        name: 'Fatima Alami',
        phone: '+212 600 789 123',
        email: 'fatima@test.com',
        type: 'SELLER',
        estimation: '3500000',
        message: 'Villa avec vue mer',
        personalNote: 'Client sérieux, bien informé',
        rating: 4,
        confidential: false,
        status: 'NEW'
      }
    });
    
    console.log('✅ Contact créé avec évaluation:', testContact);
    
    // Vérifier que le contact existe avec son évaluation
    const contact = await prisma.contact.findUnique({
      where: { id: testContact.id }
    });
    
    console.log('📋 Contact récupéré:', {
      name: contact?.name,
      rating: contact?.rating,
      personalNote: contact?.personalNote
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRatingSystem();
