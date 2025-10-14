const bcrypt = require('bcryptjs');

async function testSalt() {
  const password = 'Admin123!@$';
  
  console.log('🔐 Test du salt automatique avec bcrypt:');
  console.log('Mot de passe:', password);
  console.log('');
  
  // Générer 3 hash du même mot de passe
  for (let i = 1; i <= 3; i++) {
    const hash = await bcrypt.hash(password, 12);
    console.log(`Hash ${i}:`, hash);
  }
  
  console.log('');
  console.log('✅ Chaque hash est DIFFÉRENT grâce au salt automatique !');
  console.log('✅ Impossible de deviner le mot de passe original !');
}

testSalt();


