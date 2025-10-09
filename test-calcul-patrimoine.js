// Test de calcul du capital restant dû
// Ce fichier permet de vérifier que les calculs sont corrects

// Fonction de calcul des mois écoulés (identique au Dashboard)
function calculerMoisEcoules(dateDebut, dateFin) {
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);
  
  let mois = (fin.getFullYear() - debut.getFullYear()) * 12;
  mois += fin.getMonth() - debut.getMonth();
  
  // Ajuster si le jour du mois de fin est avant le jour du mois de début
  if (fin.getDate() < debut.getDate()) {
    mois--;
  }
  
  return Math.max(0, mois);
}

// Fonction de calcul du capital restant dû
function calculerCapitalRestant(montant, tauxAnnuel, dureeMois, moisEcoules) {
  const tauxMensuel = (tauxAnnuel / 100) / 12;
  
  if (tauxMensuel === 0) {
    const capitalRembourse = (montant / dureeMois) * moisEcoules;
    return Math.max(0, montant - capitalRembourse);
  }
  
  // Calculer la mensualité
  const mensualite = montant * (tauxMensuel * Math.pow(1 + tauxMensuel, dureeMois)) / (Math.pow(1 + tauxMensuel, dureeMois) - 1);
  
  // Calculer le capital restant dû après N mois
  const moisRestants = dureeMois - moisEcoules;
  const capitalRestant = mensualite * ((Math.pow(1 + tauxMensuel, moisRestants) - 1) / (tauxMensuel * Math.pow(1 + tauxMensuel, moisRestants)));
  
  return Math.max(0, capitalRestant);
}

// TEST : Prêt de l'utilisateur
console.log('=== TEST DU PRÊT ===\n');

// Supposons un prêt de 150 000€ sur 20 ans à 1.5% avec mensualité de 857€
const montantPret = 150000;
const tauxPret = 1.5;
const dureePret = 20 * 12; // 240 mois
const mensualite = 857;

console.log('Prêt :');
console.log(`- Montant : ${montantPret.toLocaleString('fr-FR')} €`);
console.log(`- Taux : ${tauxPret}%`);
console.log(`- Durée : ${dureePret} mois (${dureePret/12} ans)`);
console.log(`- Mensualité : ${mensualite} €\n`);

// Date d'achat : 16 avril 2025
const dateAchat = new Date('2025-04-16');
const dateDebutPret = new Date('2025-04-16');

// Dates de test
const dates = [
  new Date('2025-04-16'), // Jour de l'achat
  new Date('2025-05-16'), // 1 mois après
  new Date('2025-06-16'), // 2 mois après
  new Date('2025-07-16'), // 3 mois après
  new Date('2025-08-16'), // 4 mois après
  new Date('2025-09-16'), // 5 mois après
  new Date('2025-10-01'), // Aujourd'hui (environ 5.5 mois)
];

console.log('Évolution du capital restant dû :\n');
dates.forEach(date => {
  const moisEcoules = calculerMoisEcoules(dateDebutPret, date);
  const capitalRestant = calculerCapitalRestant(montantPret, tauxPret, dureePret, moisEcoules);
  const capitalRembourse = montantPret - capitalRestant;
  const prixAchat = 150000; // Supposons que le bien vaut ce qu'il coûte
  const patrimoineNet = prixAchat - capitalRestant;
  
  console.log(`Date : ${date.toLocaleDateString('fr-FR')}`);
  console.log(`  Mois écoulés : ${moisEcoules}`);
  console.log(`  Capital restant dû : ${capitalRestant.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`);
  console.log(`  Capital remboursé : ${capitalRembourse.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`);
  console.log(`  Patrimoine NET : ${patrimoineNet.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`);
  console.log('');
});

console.log('\n=== CALCUL DE LA PART CAPITAL DANS LA MENSUALITÉ ===\n');

// Détails des premières mensualités
for (let i = 1; i <= 6; i++) {
  const tauxMensuel = (tauxPret / 100) / 12;
  const capitalRestantDebut = calculerCapitalRestant(montantPret, tauxPret, dureePret, i - 1);
  const interets = capitalRestantDebut * tauxMensuel;
  const partCapital = mensualite - interets;
  
  console.log(`Mois ${i} :`);
  console.log(`  Mensualité totale : ${mensualite.toFixed(2)} €`);
  console.log(`  Part intérêts : ${interets.toFixed(2)} €`);
  console.log(`  Part capital : ${partCapital.toFixed(2)} €`);
  console.log(`  Capital restant après paiement : ${calculerCapitalRestant(montantPret, tauxPret, dureePret, i).toFixed(2)} €`);
  console.log('');
}

console.log('\n=== RÉSUMÉ ===\n');
const moisEcoules = calculerMoisEcoules(new Date('2025-04-16'), new Date('2025-10-01'));
const capitalRestantAujourdhui = calculerCapitalRestant(montantPret, tauxPret, dureePret, moisEcoules);
const capitalRembourseTotal = montantPret - capitalRestantAujourdhui;
console.log(`Entre le 16/04/2025 et le 01/10/2025 :`);
console.log(`Mois écoulés : ${moisEcoules}`);
console.log(`Capital remboursé : ${capitalRembourseTotal.toFixed(2)} €`);
console.log(`Patrimoine NET devrait avoir augmenté de : ${capitalRembourseTotal.toFixed(2)} €`);
console.log(`\nMais l'utilisateur rapporte seulement : 508 €`);
console.log(`\nDifférence : ${(capitalRembourseTotal - 508).toFixed(2)} €`);
