const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPersonalNote() {
  try {
    console.log('🔍 Test du système de notes personnelles...');
    
    // Créer un contact de test avec une note personnelle
    const testContact = await prisma.contact.create({
      data: {
        name: 'Ahmed Benali',
        phone: '+212 600 123 456',
        email: 'ahmed@test.com',
        type: 'BUYER',
        budget: '2000000',
        message: 'Recherche une villa avec piscine',
        personalNote: 'Très bon investisseur, recherche que du top',
        confidential: false,
        status: 'NEW'
      }
    });
    
    console.log('✅ Contact créé avec note personnelle:', testContact);
    
    // Vérifier que le contact existe avec sa note
    const contact = await prisma.contact.findUnique({
      where: { id: testContact.id }
    });
    
    console.log('📋 Contact récupéré:', {
      name: contact?.name,
      personalNote: contact?.personalNote
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPersonalNote();
