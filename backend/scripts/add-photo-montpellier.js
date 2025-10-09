const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addPhotoToMontpellier() {
  try {
    console.log('\n🖼️ Ajout d\'une photo au bien de Montpellier\n');
    
    // Trouver le bien de Montpellier
    const bien = await prisma.bien.findFirst({
      where: {
        ville: 'Montpellier'
      },
      include: {
        photos: true
      }
    });
    
    if (!bien) {
      console.log('❌ Bien de Montpellier non trouvé');
      return;
    }
    
    console.log(`📍 Bien trouvé: ${bien.adresse}, ${bien.ville}`);
    console.log(`   Photos actuelles: ${bien.photos.length}`);
    
    // Créer une photo de test
    const photo = await prisma.photo.create({
      data: {
        filename: 'bien-montpellier-test.jpg',
        url: '/uploads/biens/bien-montpellier-test.jpg',
        bienId: bien.id,
        isPrimary: true,
        ordre: 0,
      },
    });
    
    console.log('\n✅ Photo ajoutée avec succès !');
    console.log(`   ID: ${photo.id}`);
    console.log(`   URL: ${photo.url}`);
    console.log(`   Principal: ${photo.isPrimary}`);
    
    console.log('\n💡 Note: C\'est une photo placeholder.');
    console.log('   Pour afficher une vraie image :');
    console.log('   1. Copiez une image dans backend/uploads/biens/');
    console.log('   2. Renommez-la "bien-montpellier-test.jpg"');
    console.log('   OU uploadez via l\'interface web');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addPhotoToMontpellier();
