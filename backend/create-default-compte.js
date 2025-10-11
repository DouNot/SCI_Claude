const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createDefaultCompte() {
  console.log('🔧 Création du compte par défaut...\n');

  try {
    // Vérifier si un compte existe déjà
    const compteExistant = await prisma.compte.findFirst();
    
    if (compteExistant) {
      console.log(`✅ Un compte existe déjà : ${compteExistant.nom}`);
      console.log(`   ID: ${compteExistant.id}\n`);
      console.log(`📝 Ajoute cette ligne dans ton fichier .env :`);
      console.log(`   DEFAULT_COMPTE_ID=${compteExistant.id}\n`);
      return;
    }

    // Créer un utilisateur par défaut
    const user = await prisma.user.create({
      data: {
        email: 'admin@sci.fr',
        password: 'admin123', // À changer en production !
        nom: 'Administrateur',
        prenom: 'SCI',
        role: 'ADMIN',
      },
    });

    console.log(`✅ Utilisateur créé : ${user.email}`);

    // Créer un compte par défaut
    const compte = await prisma.compte.create({
      data: {
        nom: 'Ma SCI',
        type: 'SCI',
        description: 'Compte principal de la SCI',
        userId: user.id,
      },
    });

    console.log(`✅ Compte créé : ${compte.nom}`);
    console.log(`   ID: ${compte.id}\n`);
    
    console.log(`📝 Ajoute cette ligne dans ton fichier .env :`);
    console.log(`   DEFAULT_COMPTE_ID=${compte.id}\n`);
    
  } catch (error) {
    console.error('❌ Erreur :', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultCompte();
