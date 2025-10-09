const axios = require('axios');

async function testAPI() {
  try {
    console.log('\n🔍 Test de l\'API /api/biens\n');
    
    const response = await axios.get('http://localhost:3000/api/biens');
    const biens = response.data.data;
    
    console.log(`📊 Nombre de biens retournés: ${biens.length}\n`);
    
    biens.forEach((bien, index) => {
      console.log(`--- Bien ${index + 1} ---`);
      console.log(`Adresse: ${bien.adresse}, ${bien.ville}`);
      console.log(`Statut: ${bien.statut}`);
      console.log(`loyerActuel: ${bien.loyerActuel}`);
      console.log(`chargesActuelles: ${bien.chargesActuelles}`);
      console.log(`bailActif:`, bien.bailActif ? {
        id: bien.bailActif.id,
        statut: bien.bailActif.statut,
        loyerHC: bien.bailActif.loyerHC,
        locataire: bien.bailActif.locataire?.nom
      } : null);
      console.log(`locataireActuel:`, bien.locataireActuel ? {
        nom: bien.locataireActuel.nom,
        email: bien.locataireActuel.email
      } : null);
      console.log(`Photos (${bien.photos?.length || 0}):`);
      if (bien.photos && bien.photos.length > 0) {
        bien.photos.forEach(photo => {
          console.log(`  - ${photo.filename} (isPrimary: ${photo.isPrimary}, url: ${photo.url})`);
        });
      } else {
        console.log('  Aucune photo');
      }
      console.log('');
    });
    
    // Test de la condition frontend
    const bien = biens[0];
    if (bien) {
      console.log('🧪 Test des conditions frontend:');
      console.log(`  bien.statut === 'LOUE': ${bien.statut === 'LOUE'}`);
      console.log(`  bien.bailActif exists: ${!!bien.bailActif}`);
      console.log(`  bien.bailActif?.statut === 'ACTIF': ${bien.bailActif?.statut === 'ACTIF'}`);
      console.log(`  bien.loyerActuel: ${bien.loyerActuel}`);
      
      const isLoue = bien.statut === 'LOUE' || (bien.bailActif && bien.bailActif.statut === 'ACTIF');
      console.log(`  isLoue: ${isLoue}`);
      console.log(`  Devrait afficher le loyer: ${isLoue && bien.loyerActuel ? 'OUI ✅' : 'NON ❌'}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testAPI();
