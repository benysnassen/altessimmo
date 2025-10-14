const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testInsert() {
  try {
    console.log('🔍 Test de connexion à Hostinger...');
    
    // Test d'insertion d'un contact de test
    const testContact = await prisma.contact.create({
      data: {
        name: 'Test Hostinger',
        phone: '+212 600 000 000',
        email: 'test@hostinger.com',
        type: 'BUYER',
        budget: '1500000',
        message: 'Test de connexion Hostinger',
        confidential: false,
        status: 'NEW'
      }
    });
    
    console.log('✅ Contact créé avec succès:', testContact);
    
    // Vérifier que le contact existe
    const contacts = await prisma.contact.findMany({
      where: {
        name: 'Test Hostinger'
      }
    });
    
    console.log('📊 Nombre de contacts trouvés:', contacts.length);
    console.log('📋 Détails:', contacts);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testInsert();

