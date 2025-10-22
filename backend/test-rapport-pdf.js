/**
 * Script de test pour la génération de rapport PDF amélioré
 * 
 * Usage: node test-rapport-pdf.js
 */

const { collecterDonneesRapport, genererRapportPDF } = require('./src/services/pdfService');
const prisma = require('./src/config/database');

async function testRapportPDF() {
  console.log('🧪 Test de génération de rapport PDF\n');

  try {
    // 1. Trouver un space SCI
    console.log('1️⃣ Recherche d\'un espace SCI...');
    const space = await prisma.space.findFirst({
      where: { type: 'SCI' },
    });

    if (!space) {
      console.log('❌ Aucun espace SCI trouvé. Créez-en un d\'abord.');
      return;
    }

    console.log(`✅ Espace trouvé : ${space.nom} (${space.id})\n`);

    // 2. Définir la période
    const annee = new Date().getFullYear();
    const dateDebut = new Date(annee, 0, 1);
    const dateFin = new Date(annee, 11, 31, 23, 59, 59);

    console.log(`2️⃣ Période : ${annee}`);
    console.log(`   Du ${dateDebut.toLocaleDateString('fr-FR')} au ${dateFin.toLocaleDateString('fr-FR')}\n`);

    // 3. Collecter les données
    console.log('3️⃣ Collecte des données...');
    const donnees = await collecterDonneesRapport(space.id, annee, dateDebut, dateFin);
    
    console.log(`✅ Données collectées :`);
    console.log(`   - Biens : ${donnees.stats.nbBiens}`);
    console.log(`   - Baux actifs : ${donnees.stats.nbBauxActifs}`);
    console.log(`   - Quittances : ${donnees.stats.nbQuittances}`);
    console.log(`   - Factures : ${donnees.stats.nbFactures}`);
    console.log(`   - Associés : ${donnees.associes.length}`);
    console.log(`   - Revenus totaux : ${donnees.stats.totalRevenus.toFixed(2)}€`);
    console.log(`   - Charges totales : ${donnees.stats.totalChargesAnnee.toFixed(2)}€`);
    console.log(`   - Résultat net : ${donnees.stats.resultatNet.toFixed(2)}€`);
    console.log(`   - Patrimoine net : ${donnees.stats.patrimoineNet.toFixed(2)}€\n`);

    // 4. Créer le rapport en base
    console.log('4️⃣ Création du rapport en base...');
    const rapport = await prisma.rapportAnnuel.create({
      data: {
        spaceId: space.id,
        nom: `Test Rapport ${annee}`,
        annee,
        type: 'COMPLET',
        dateDebut,
        dateFin,
        statut: 'BROUILLON',
      },
    });
    console.log(`✅ Rapport créé : ${rapport.id}\n`);

    // 5. Générer le PDF
    console.log('5️⃣ Génération du PDF...');
    const pdfInfo = await genererRapportPDF(
      rapport.id,
      space.id,
      annee,
      dateDebut,
      dateFin
    );

    console.log(`✅ PDF généré avec succès :`);
    console.log(`   - Fichier : ${pdfInfo.filename}`);
    console.log(`   - Chemin : ${pdfInfo.filepath}`);
    console.log(`   - URL : ${pdfInfo.url}`);
    console.log(`   - Taille : ${(pdfInfo.tailleFichier / 1024).toFixed(2)} KB\n`);

    // 6. Mettre à jour le rapport
    console.log('6️⃣ Mise à jour du rapport...');
    await prisma.rapportAnnuel.update({
      where: { id: rapport.id },
      data: {
        urlPdf: pdfInfo.url,
        filename: pdfInfo.filename,
        tailleFichier: pdfInfo.tailleFichier,
        donnees: pdfInfo.donnees,
        statut: 'GENERE',
        dateGeneration: new Date(),
      },
    });
    console.log(`✅ Rapport mis à jour\n`);

    console.log('🎉 Test terminé avec succès !');
    console.log(`\n📄 Ouvrez le fichier : ${pdfInfo.filepath}`);

  } catch (error) {
    console.error('❌ Erreur lors du test :', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Lancer le test
testRapportPDF();
