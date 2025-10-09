const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('\n🔍 Diagnostic de la base de données\n');
    
    // Vérifier les biens
    const biens = await prisma.bien.findMany({
      include: {
        photos: true,
        baux: {
          where: {
            statut: 'ACTIF'
          },
          include: {
            locataire: true
          }
        }
      }
    });
    
    console.log(`📊 Nombre total de biens: ${biens.length}\n`);
    
    biens.forEach((bien, index) => {
      console.log(`--- Bien ${index + 1}: ${bien.adresse}, ${bien.ville} ---`);
      console.log(`   Photos: ${bien.photos.length}`);
      
      if (bien.photos.length > 0) {
        bien.photos.forEach(photo => {
          console.log(`      - ${photo.filename} (Primary: ${photo.isPrimary})`);
          console.log(`        URL: ${photo.url}`);
        });
      } else {
        console.log('      ❌ Aucune photo');
      }
      
      console.log(`   Baux actifs: ${bien.baux.length}`);
      
      if (bien.baux.length > 0) {
        bien.baux.forEach(bail => {
          console.log(`      - Loyer HC: ${bail.loyerHC} €`);
          console.log(`        Locataire: ${bail.locataire?.nom || 'N/A'}`);
        });
      } else {
        console.log('      ❌ Aucun bail actif');
      }
      
      console.log('');
    });
    
    // Statistiques globales
    const totalPhotos = biens.reduce((sum, b) => sum + b.photos.length, 0);
    const totalBauxActifs = biens.reduce((sum, b) => sum + b.baux.length, 0);
    
    console.log('📈 Résumé:');
    console.log(`   Total photos: ${totalPhotos}`);
    console.log(`   Total baux actifs: ${totalBauxActifs}`);
    console.log(`   Biens avec photos: ${biens.filter(b => b.photos.length > 0).length}`);
    console.log(`   Biens avec bail actif: ${biens.filter(b => b.baux.length > 0).length}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
