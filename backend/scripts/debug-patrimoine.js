const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugPatrimoine() {
  try {
    console.log('\n🔍 Diagnostic du patrimoine\n');
    
    const biens = await prisma.bien.findMany();
    const prets = await prisma.pret.findMany();
    
    console.log(`📊 Biens: ${biens.length}`);
    console.log(`💰 Prêts: ${prets.length}\n`);
    
    // Valeur brute
    const valeurBrute = biens.reduce((sum, b) => sum + (b.valeurActuelle || b.prixAchat), 0);
    console.log(`Patrimoine BRUT: ${valeurBrute.toLocaleString('fr-FR')} €`);
    
    // Capital restant dû aujourd'hui
    const now = new Date();
    const capitalRestantDu = prets.reduce((sum, p) => {
      const dateDebut = new Date(p.dateDebut);
      const moisEcoules = Math.max(0, Math.floor((now - dateDebut) / (1000 * 60 * 60 * 24 * 30)));
      const moisRestants = Math.max(0, parseInt(p.duree) - moisEcoules);
      const montant = parseFloat(p.montant || 0);
      const tauxMensuel = (parseFloat(p.taux || 0) / 100) / 12;
      
      console.log(`\nPrêt ${p.organisme}:`);
      console.log(`  Montant initial: ${montant.toLocaleString('fr-FR')} €`);
      console.log(`  Durée totale: ${p.duree} mois`);
      console.log(`  Mois écoulés: ${moisEcoules}`);
      console.log(`  Mois restants: ${moisRestants}`);
      console.log(`  Taux: ${p.taux}%`);
      
      if (moisRestants <= 0) {
        console.log(`  ✅ Prêt remboursé !`);
        return sum + 0;
      }
      
      if (tauxMensuel === 0) {
        const capitalRestant = montant * moisRestants / parseInt(p.duree);
        console.log(`  Capital restant (linéaire): ${capitalRestant.toLocaleString('fr-FR')} €`);
        return sum + capitalRestant;
      }
      
      const mensualite = montant * (tauxMensuel * Math.pow(1 + tauxMensuel, parseInt(p.duree))) / (Math.pow(1 + tauxMensuel, parseInt(p.duree)) - 1);
      const capitalRestant = mensualite * ((Math.pow(1 + tauxMensuel, moisRestants) - 1) / (tauxMensuel * Math.pow(1 + tauxMensuel, moisRestants)));
      
      console.log(`  Mensualité: ${mensualite.toLocaleString('fr-FR')} €`);
      console.log(`  Capital restant dû: ${capitalRestant.toLocaleString('fr-FR')} €`);
      
      return sum + (isNaN(capitalRestant) ? 0 : capitalRestant);
    }, 0);
    
    console.log(`\n💳 TOTAL Capital restant dû: ${capitalRestantDu.toLocaleString('fr-FR')} €`);
    
    const valeurNette = valeurBrute - capitalRestantDu;
    console.log(`📈 Patrimoine NET: ${valeurNette.toLocaleString('fr-FR')} €\n`);
    
    // Vérifier s'il y a une évolution possible
    if (prets.length === 0) {
      console.log('⚠️  Aucun prêt trouvé !');
      console.log('   La courbe NET sera identique à la courbe BRUT (horizontale)');
    } else if (capitalRestantDu === 0) {
      console.log('✅ Tous les prêts sont remboursés !');
      console.log('   La courbe sera horizontale (patrimoine = valeur brute)');
    } else {
      console.log('✅ Il y a des prêts en cours');
      console.log('   La courbe NET devrait monter progressivement');
      console.log(`   Différence BRUT/NET: ${(valeurBrute - valeurNette).toLocaleString('fr-FR')} €`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugPatrimoine();
