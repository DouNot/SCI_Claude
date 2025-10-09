const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('\n🔄 Application de la migration : ajout assurance et taxe foncière\n');
    
    // Vérifier si les colonnes existent déjà
    const biens = await prisma.bien.findMany();
    
    if (biens.length > 0) {
      const premierBien = biens[0];
      if (premierBien.hasOwnProperty('assuranceMensuelle') && premierBien.hasOwnProperty('taxeFonciere')) {
        console.log('✅ Les colonnes existent déjà !');
        console.log('   - assuranceMensuelle');
        console.log('   - taxeFonciere');
        console.log('\nAucune action nécessaire.');
      } else {
        console.log('⚠️  Les colonnes n\'existent pas encore.');
        console.log('   Exécutez : npx prisma migrate deploy');
      }
    } else {
      console.log('ℹ️  Aucun bien dans la base pour vérifier.');
      console.log('   Exécutez : npx prisma migrate deploy');
    }
    
    console.log('\n💡 Pour appliquer la migration :');
    console.log('   cd backend');
    console.log('   npx prisma migrate deploy');
    console.log('   npx prisma generate');
    
  } catch (error) {
    if (error.message.includes('Unknown field')) {
      console.log('\n❌ Migration non appliquée !');
      console.log('\n📝 Pour appliquer la migration :');
      console.log('   1. cd backend');
      console.log('   2. npx prisma migrate deploy');
      console.log('   3. npx prisma generate');
      console.log('   4. Redémarrez le serveur');
    } else {
      console.error('❌ Erreur:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
