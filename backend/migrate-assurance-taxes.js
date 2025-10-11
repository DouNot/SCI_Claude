const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateAssuranceAndTaxesToCharges() {
  console.log('🔄 Migration : Création des charges à partir des biens existants...\n');

  try {
    // Récupérer tous les biens
    const biens = await prisma.bien.findMany();
    
    let chargesCreees = 0;
    
    for (const bien of biens) {
      // Vérifier si le bien a une assurance mensuelle
      if (bien.assuranceMensuelle && bien.assuranceMensuelle > 0) {
        // Vérifier si une charge ASSURANCE_PNO existe déjà pour ce bien
        const chargeExistante = await prisma.charge.findFirst({
          where: {
            bienId: bien.id,
            type: 'ASSURANCE_PNO',
          },
        });
        
        if (!chargeExistante) {
          await prisma.charge.create({
            data: {
              type: 'ASSURANCE_PNO',
              libelle: `Assurance PNO - ${bien.adresse}`,
              montant: bien.assuranceMensuelle,
              frequence: 'MENSUELLE',
              dateDebut: bien.dateAchat,
              estActive: true,
              bienId: bien.id,
            },
          });
          console.log(`✅ Charge créée : Assurance PNO pour ${bien.adresse} (${bien.assuranceMensuelle}€/mois)`);
          chargesCreees++;
        }
      }
      
      // Vérifier si le bien a une taxe foncière
      if (bien.taxeFonciere && bien.taxeFonciere > 0) {
        // Vérifier si une charge TAXE_FONCIERE existe déjà pour ce bien
        const chargeExistante = await prisma.charge.findFirst({
          where: {
            bienId: bien.id,
            type: 'TAXE_FONCIERE',
          },
        });
        
        if (!chargeExistante) {
          await prisma.charge.create({
            data: {
              type: 'TAXE_FONCIERE',
              libelle: `Taxe foncière - ${bien.adresse}`,
              montant: bien.taxeFonciere,
              frequence: 'ANNUELLE',
              dateDebut: bien.dateAchat,
              estActive: true,
              bienId: bien.id,
            },
          });
          console.log(`✅ Charge créée : Taxe foncière pour ${bien.adresse} (${bien.taxeFonciere}€/an)`);
          chargesCreees++;
        }
      }
    }
    
    console.log(`\n✅ Migration terminée ! ${chargesCreees} charge(s) créée(s).`);
  } catch (error) {
    console.error('❌ Erreur lors de la migration :', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
migrateAssuranceAndTaxesToCharges();
