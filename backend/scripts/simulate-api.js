const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simulateAPI() {
  try {
    console.log('\n🔍 Simulation de l\'API /api/biens (sans serveur)\n');
    
    // Même requête que dans bienController.js
    const biens = await prisma.bien.findMany({
      include: {
        compte: true,
        photos: true,
        baux: {
          where: {
            statut: 'ACTIF'
          },
          include: {
            locataire: true
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Même transformation que dans bienController.js
    const biensAvecStatut = biens.map(bien => {
      const bailActif = bien.baux && bien.baux.length > 0 ? bien.baux[0] : null;
      return {
        ...bien,
        statut: bailActif ? 'LOUE' : 'LIBRE',
        bailActif: bailActif,
        loyerActuel: bailActif ? bailActif.loyerHC : null,
        chargesActuelles: bailActif ? bailActif.charges : null,
        locataireActuel: bailActif ? bailActif.locataire : null
      };
    });

    console.log(`📊 Nombre de biens: ${biensAvecStatut.length}\n`);
    
    biensAvecStatut.forEach((bien, index) => {
      console.log(`--- Bien ${index + 1} ---`);
      console.log(`Adresse: ${bien.adresse}, ${bien.ville}`);
      console.log(`Statut: ${bien.statut}`);
      console.log(`loyerActuel: ${bien.loyerActuel} €`);
      console.log(`chargesActuelles: ${bien.chargesActuelles} €`);
      console.log(`bailActif:`, bien.bailActif ? {
        id: bien.bailActif.id,
        statut: bien.bailActif.statut,
        loyerHC: bien.bailActif.loyerHC,
        locataire: bien.bailActif.locataire?.nom
      } : null);
      console.log(`Photos (${bien.photos?.length || 0}):`);
      if (bien.photos && bien.photos.length > 0) {
        bien.photos.forEach(photo => {
          console.log(`  - ${photo.filename} (isPrimary: ${photo.isPrimary}, url: ${photo.url})`);
        });
      } else {
        console.log('  ❌ Aucune photo');
      }
      console.log('');
    });
    
    // Test des conditions frontend - Tester le bien loué
    const bien = biensAvecStatut.find(b => b.statut === 'LOUE') || biensAvecStatut[0];
    if (bien) {
      console.log('🧪 Test des conditions frontend:');
      console.log(`  bien.statut === 'LOUE': ${bien.statut === 'LOUE'}`);
      console.log(`  bien.bailActif exists: ${!!bien.bailActif}`);
      console.log(`  bien.bailActif?.statut === 'ACTIF': ${bien.bailActif?.statut === 'ACTIF'}`);
      console.log(`  bien.loyerActuel: ${bien.loyerActuel}`);
      
      const isLoue = bien.statut === 'LOUE' || (bien.bailActif && bien.bailActif.statut === 'ACTIF');
      console.log(`  isLoue: ${isLoue}`);
      console.log(`  Affichage loyer: ${isLoue && bien.loyerActuel ? '✅ OUI - ' + bien.loyerActuel + ' €/mois' : '❌ NON'}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simulateAPI();
