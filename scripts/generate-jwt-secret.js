#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 Génération de clés JWT sécurisées pour Altessimmo\n');

// Générer différentes longueurs
const lengths = [32, 64, 128];
const types = [
  { name: 'Base64', method: () => crypto.randomBytes(32).toString('base64') },
  { name: 'Hex', method: () => crypto.randomBytes(32).toString('hex') },
  { name: 'Alphanumeric', method: () => crypto.randomBytes(32).toString('base64').replace(/[^a-zA-Z0-9]/g, '') }
];

lengths.forEach(length => {
  console.log(`\n📏 Longueur: ${length} caractères`);
  console.log('─'.repeat(50));
  
  types.forEach(type => {
    const key = crypto.randomBytes(Math.ceil(length * 0.75)).toString(type.name === 'Base64' ? 'base64' : type.name === 'Hex' ? 'hex' : 'base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, length);
    console.log(`${type.name.padEnd(12)}: ${key}`);
  });
});

console.log('\n🎯 Recommandation pour la production:');
console.log('─'.repeat(50));
const productionKey = crypto.randomBytes(64).toString('base64');
console.log(`JWT_SECRET="${productionKey}"`);

console.log('\n✅ Caractéristiques de sécurité:');
console.log('• Longueur: 64+ caractères');
console.log('• Entropie maximale');
console.log('• Caractères alphanumériques + spéciaux');
console.log('• Génération cryptographique sécurisée');
console.log('• Impossible à deviner ou cracker');

console.log('\n⚠️  Instructions:');
console.log('1. Copiez la clé recommandée');
console.log('2. Ajoutez-la à votre fichier .env');
console.log('3. Ne la partagez JAMAIS');
console.log('4. Changez-la régulièrement en production');


