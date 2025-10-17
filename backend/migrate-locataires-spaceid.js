const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateLocataires() {
  console.log('🔄 Migration des locataires - Ajout du spaceId\n');
  
  try {
    // 1. Récupérer tous les locataires sans spaceId
    const locatairesSansSpace = await prisma.$queryRaw`
      SELECT id, bien_id FROM locataires WHERE space_id IS NULL
    `;
    
    console.log(`📊 ${locatairesSansSpace.length} locataires sans spaceId trouvés\n`);
    
    if (locatairesSansSpace.length === 0) {
      console.log('✅ Tous les locataires ont déjà un spaceId !');
      return;
    }
    
    let migrated = 0;
    let errors = 0;
    
    for (const locataire of locatairesSansSpace) {
      try {
        let spaceId = null;
        
        // Essayer via le bienId
        if (locataire.bien_id) {
          const bien = await prisma.bien.findUnique({
            where: { id: locataire.bien_id },
            select: { spaceId: true }
          });
          
          if (bien) {
            spaceId = bien.spaceId;
          }
        }
        
        // Si pas de spaceId, essayer via les baux
        if (!spaceId) {
          const bail = await prisma.bail.findFirst({
            where: { locataireId: locataire.id },
            include: {
              bien: {
                select: { spaceId: true }
              }
            }
          });
          
          if (bail) {
            spaceId = bail.bien.spaceId;
          }
        }
        
        // Mettre à jour si on a trouvé un spaceId
        if (spaceId) {
          await prisma.$executeRaw`
            UPDATE locataires SET space_id = ${spaceId} WHERE id = ${locataire.id}
          `;
          migrated++;
          console.log(`✅ Locataire ${locataire.id} → Space ${spaceId.substring(0, 8)}...`);
        } else {
          errors++;
          console.error(`❌ Locataire ${locataire.id} : impossible de trouver un spaceId`);
        }
        
      } catch (err) {
        errors++;
        console.error(`❌ Erreur pour locataire ${locataire.id}:`, err.message);
      }
    }
    
    console.log(`\n📊 Résumé:`);
    console.log(`   ✅ Migrés: ${migrated}`);
    console.log(`   ❌ Erreurs: ${errors}`);
    console.log(`   📦 Total: ${locatairesSansSpace.length}`);
    
    if (errors > 0) {
      console.log(`\n⚠️  ${errors} locataires n'ont pas pu être migrés automatiquement.`);
      console.log(`   Ils devront être supprimés ou assignés manuellement à un Space.`);
    } else {
      console.log(`\n✅ Migration terminée avec succès !`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
migrateLocataires()
  .then(() => {
    console.log('\n✅ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Échec de la migration:', error);
    process.exit(1);
  });
