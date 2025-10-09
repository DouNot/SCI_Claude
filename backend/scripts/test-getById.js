const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testGetBienById() {
  try {
    console.log('\n🔍 Test de l\'API GET /api/biens/:id\n');
    
    // Récupérer tous les biens pour avoir les IDs
    const biens = await prisma.bien.findMany({
      select: {
        id: true,
        adresse: true,
        ville: true
      }
    });
    
    console.log(`📊 Biens disponibles:\n`);
    biens.forEach((b, i) => {
      console.log(`   ${i + 1}. ${b.adresse}, ${b.ville}`);
      console.log(`      ID: ${b.id}`);
    });
    
    // Tester getById pour chaque bien
    for (const bienSimple of biens) {
      console.log(`\n--- Test pour ${bienSimple.adresse}, ${bienSimple.ville} ---`);
      
      // Simuler exactement ce que fait le controller
      const bien = await prisma.bien.findUnique({
        where: { id: bienSimple.id },
        include: {
          compte: true,
          photos: true,
          locataires: true,
          documents: true,
          travaux: true,
          factures: true,
          prets: true,
          baux: {
            where: {
              statut: 'ACTIF'
            },
            include: {
              locataire: true
            }
          },
        },
      });

      // Calculer le statut du bien
      const bailActif = bien.baux && bien.baux.length > 0 ? bien.baux[0] : null;
      const bienAvecStatut = {
        ...bien,
        statut: bailActif ? 'LOUE' : 'LIBRE',
        bailActif: bailActif,
        loyerActuel: bailActif ? bailActif.loyerHC : null,
        chargesActuelles: bailActif ? bailActif.charges : null,
        locataireActuel: bailActif ? bailActif.locataire : null
      };
      
      console.log(`   Statut: ${bienAvecStatut.statut}`);
      console.log(`   Photos: ${bienAvecStatut.photos?.length || 0}`);
      if (bienAvecStatut.photos && bienAvecStatut.photos.length > 0) {
        bienAvecStatut.photos.forEach(p => {
          console.log(`      - ${p.filename} (isPrimary: ${p.isPrimary})`);
          console.log(`        URL: ${p.url}`);
        });
      }
      console.log(`   Loyer actuel: ${bienAvecStatut.loyerActuel || 'N/A'} €`);
      console.log(`   Bail actif: ${bailActif ? 'OUI' : 'NON'}`);
      
      // Test de l'URL de la photo comme dans le frontend
      const photoUrl = bienAvecStatut.photos?.find(p => p.isPrimary)?.url || bienAvecStatut.photos?.[0]?.url;
      console.log(`   🖼️ URL photo à afficher: ${photoUrl || 'Aucune'}`);
      if (photoUrl) {
        console.log(`   🌐 URL complète: http://localhost:3000${photoUrl}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGetBienById();
