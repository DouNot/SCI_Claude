// Script de diagnostic - À exécuter dans le backend
// node check-user-spaces.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserSpaces() {
  try {
    console.log('🔍 Vérification des utilisateurs et spaces...\n');
    
    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany({
      include: {
        spaceMembers: {
          include: {
            space: true
          }
        }
      }
    });
    
    for (const user of users) {
      console.log(`👤 Utilisateur: ${user.email} (${user.id})`);
      console.log(`   Last Space ID: ${user.lastSpaceId || 'Non défini'}`);
      console.log(`   Membre de ${user.spaceMembers.length} space(s):\n`);
      
      for (const member of user.spaceMembers) {
        console.log(`   📁 ${member.space.nom} (${member.space.type})`);
        console.log(`      - ID: ${member.space.id}`);
        console.log(`      - Rôle: ${member.role}`);
        console.log(`      - Statut membre: ${member.statut}`);
        console.log(`      - Statut space: ${member.space.statut}\n`);
      }
      
      // Vérifier si lastSpaceId est valide
      if (user.lastSpaceId) {
        const hasAccess = user.spaceMembers.some(
          m => m.spaceId === user.lastSpaceId && m.statut === 'ACTIVE'
        );
        
        if (!hasAccess) {
          console.log(`   ⚠️  PROBLÈME: lastSpaceId pointe vers un space inaccessible!`);
          
          // Corriger automatiquement
          const firstActiveSpace = user.spaceMembers.find(m => m.statut === 'ACTIVE');
          if (firstActiveSpace) {
            await prisma.user.update({
              where: { id: user.id },
              data: { lastSpaceId: firstActiveSpace.spaceId }
            });
            console.log(`   ✅ Corrigé: lastSpaceId → ${firstActiveSpace.spaceId}\n`);
          }
        } else {
          console.log(`   ✅ lastSpaceId est valide\n`);
        }
      }
      
      console.log('─'.repeat(60) + '\n');
    }
    
    console.log('✅ Vérification terminée!');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserSpaces();
