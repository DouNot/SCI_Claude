const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixEmailSarl() {
  console.log('=== CORRECTION EMAIL SARL PAS DROLE ===\n');
  
  // Chercher "SARL PAS DROLE"
  const sarl = await prisma.locataire.findFirst({
    where: {
      raisonSociale: 'SARL PAS DROLE'
    }
  });

  if (!sarl) {
    console.log('❌ SARL PAS DROLE non trouvée');
    await prisma.$disconnect();
    return;
  }

  console.log('✅ SARL PAS DROLE trouvée:');
  console.log(`   ID: ${sarl.id}`);
  console.log(`   Email actuel: ${sarl.email || '(vide)'}\n`);

  // Demander le nouvel email
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('Entrez le nouvel email pour SARL PAS DROLE : ', async (email) => {
    if (!email || email.trim() === '') {
      console.log('❌ Email vide, annulation');
      readline.close();
      await prisma.$disconnect();
      return;
    }

    try {
      // Mettre à jour l'email
      const updated = await prisma.locataire.update({
        where: { id: sarl.id },
        data: { email: email.trim() }
      });

      console.log('\n✅ Email mis à jour avec succès !');
      console.log(`   Nouvel email: ${updated.email}`);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error.message);
    }

    readline.close();
    await prisma.$disconnect();
  });
}

fixEmailSarl().catch(console.error);
