// Script à coller dans la console du navigateur (F12)
// Pour débugger l'affichage du loyer

console.log('🔍 Debug loyer dans BiensTable');

// Attendre que React ait monté les composants
setTimeout(() => {
  // Récupérer les props des cartes de biens
  const biensCards = document.querySelectorAll('[class*="bg-dark-900 rounded-2xl p-6"]');
  
  console.log(`📊 Nombre de cartes trouvées: ${biensCards.length}`);
  
  // Pour chaque carte, essayer de trouver les infos de loyer
  biensCards.forEach((card, index) => {
    const adresseEl = card.querySelector('h3');
    const loyerEl = card.querySelector('[class*="accent-green"]');
    const vacantEl = card.querySelector('[class*="accent-orange"]');
    
    console.log(`\n--- Carte ${index + 1} ---`);
    if (adresseEl) {
      console.log(`Adresse: ${adresseEl.textContent}`);
    }
    if (loyerEl) {
      console.log(`✅ Loyer trouvé: ${loyerEl.textContent}`);
    }
    if (vacantEl) {
      console.log(`⭕ Badge vacant trouvé: ${vacantEl.textContent}`);
    }
    if (!loyerEl && !vacantEl) {
      console.log(`❌ Ni loyer ni badge vacant trouvé !`);
    }
  });
}, 1000);

// Fonction pour inspecter les données React
console.log('\n💡 Pour voir les données React, utilisez React DevTools');
console.log('   ou inspectez window.__REACT_DEVTOOLS_GLOBAL_HOOK__');
