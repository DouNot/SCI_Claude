const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testLocataireEmail() {
  console.log('=== TEST EMAIL LOCATAIRE ===\n');
  
  // Récupérer tous les locataires
  const locataires = await prisma.locataire.findMany({
    select: {
      id: true,
      nom: true,
      prenom: true,
      raisonSociale: true,
      email: true,
      typeLocataire: true
    }
  });

  console.log(`Nombre de locataires trouvés: ${locataires.length}\n`);
  
  locataires.forEach(loc => {
    const nom = loc.typeLocataire === 'ENTREPRISE' 
      ? loc.raisonSociale 
      : `${loc.prenom} ${loc.nom}`;
    
    console.log(`📌 ${nom}`);
    console.log(`   Type: ${loc.typeLocataire}`);
    console.log(`   Email: ${loc.email || '❌ VIDE'}`);
    console.log(`   ID: ${loc.id}\n`);
  });

  // Chercher spécifiquement "SARL PAS DROLE"
  const sarlPasDrole = locataires.find(l => l.raisonSociale === 'SARL PAS DROLE');
  if (sarlPasDrole) {
    console.log('🔍 SARL PAS DROLE trouvée:');
    console.log(JSON.stringify(sarlPasDrole, null, 2));
  } else {
    console.log('⚠️  SARL PAS DROLE non trouvée');
  }

  await prisma.$disconnect();
}

testLocataireEmail().catch(console.error);
