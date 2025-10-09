const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function addTestPhoto() {
  try {
    console.log('\n🖼️ Ajout d\'une photo de test\n');
    
    // Récupérer le premier bien
    const biens = await prisma.bien.findMany();
    
    if (biens.length === 0) {
      console.log('❌ Aucun bien trouvé dans la base de données');
      return;
    }
    
    const bien = biens[0];
    console.log(`📍 Bien trouvé: ${bien.adresse}, ${bien.ville}`);
    
    // Créer une photo de test (placeholder)
    const photo = await prisma.photo.create({
      data: {
        filename: 'placeholder-property.jpg',
        url: '/uploads/biens/placeholder-property.jpg',
        bienId: bien.id,
        isPrimary: true,
        ordre: 0,
      },
    });
    
    console.log('✅ Photo de test ajoutée avec succès !');
    console.log(`   ID: ${photo.id}`);
    console.log(`   URL: ${photo.url}`);
    console.log(`   Principal: ${photo.isPrimary}`);
    
    console.log('\n💡 Note: Cette photo est un placeholder.');
    console.log('   Pour voir une vraie image, vous devez soit:');
    console.log('   1. Placer une image nommée "placeholder-property.jpg" dans backend/uploads/biens/');
    console.log('   2. Uploader de vraies photos via l\'interface');
    
    // Afficher le résultat
    const bienAvecPhotos = await prisma.bien.findUnique({
      where: { id: bien.id },
      include: { photos: true }
    });
    
    console.log(`\n📊 Le bien a maintenant ${bienAvecPhotos.photos.length} photo(s)`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestPhoto();
