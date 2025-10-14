const { PrismaClient } = require('@prisma/client');

async function checkAdmins() {
  const prisma = new PrismaClient();
  
  try {
    const admins = await prisma.admin.findMany();
    console.log('Admins dans la base de données:');
    console.log(JSON.stringify(admins, null, 2));
    
    if (admins.length === 0) {
      console.log('❌ Aucun admin trouvé dans la base de données');
    } else {
      console.log(`✅ ${admins.length} admin(s) trouvé(s)`);
    }
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmins();


