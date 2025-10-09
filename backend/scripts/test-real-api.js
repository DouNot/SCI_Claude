// Test sans dépendance externe - utilise le module http natif de Node.js
const http = require('http');

function testAPI() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/biens',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  console.log('\n🔍 Test de la vraie API HTTP /api/biens\n');
  console.log('⚠️  Assurez-vous que le serveur backend est démarré sur http://localhost:3000\n');

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        const biens = response.data;
        
        console.log(`📊 Nombre de biens retournés: ${biens.length}\n`);
        
        biens.forEach((bien, index) => {
          console.log(`--- Bien ${index + 1}: ${bien.adresse}, ${bien.ville} ---`);
          console.log(`  Statut: ${bien.statut}`);
          console.log(`  loyerActuel: ${bien.loyerActuel}`);
          console.log(`  chargesActuelles: ${bien.chargesActuelles}`);
          console.log(`  bailActif: ${bien.bailActif ? 'OUI' : 'NON'}`);
          if (bien.bailActif) {
            console.log(`    - statut: ${bien.bailActif.statut}`);
            console.log(`    - loyerHC: ${bien.bailActif.loyerHC}`);
          }
          console.log(`  Photos: ${bien.photos?.length || 0}`);
          if (bien.photos && bien.photos.length > 0) {
            bien.photos.forEach(p => {
              console.log(`    - ${p.filename} (isPrimary: ${p.isPrimary})`);
            });
          }
          console.log('');
        });
        
        // Test des conditions frontend sur le bien loué
        const bienLoue = biens.find(b => b.statut === 'LOUE');
        if (bienLoue) {
          console.log('🧪 Test des conditions frontend pour le bien loué:');
          console.log(`  Adresse: ${bienLoue.adresse}, ${bienLoue.ville}`);
          console.log(`  bien.statut === 'LOUE': ${bienLoue.statut === 'LOUE'}`);
          console.log(`  bien.bailActif exists: ${!!bienLoue.bailActif}`);
          console.log(`  bien.bailActif?.statut === 'ACTIF': ${bienLoue.bailActif?.statut === 'ACTIF'}`);
          console.log(`  bien.loyerActuel: ${bienLoue.loyerActuel}`);
          
          const isLoue = bienLoue.statut === 'LOUE' || (bienLoue.bailActif && bienLoue.bailActif.statut === 'ACTIF');
          console.log(`  isLoue: ${isLoue}`);
          console.log(`  Devrait afficher: ${isLoue && bienLoue.loyerActuel ? '✅ ' + bienLoue.loyerActuel + ' €/mois' : '❌ Vacant'}`);
        } else {
          console.log('⚠️  Aucun bien avec statut LOUE trouvé');
        }
        
      } catch (error) {
        console.error('❌ Erreur parsing JSON:', error.message);
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erreur de connexion:', error.message);
    console.log('\n💡 Assurez-vous que:');
    console.log('   1. Le serveur backend est démarré (npm run dev dans le dossier backend)');
    console.log('   2. Il écoute sur le port 3000');
    console.log('   3. Il n\'y a pas d\'erreur dans les logs du serveur');
  });

  req.end();
}

testAPI();
