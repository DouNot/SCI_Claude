/**
 * Script de migration pour ajouter le champ numeroQuittance
 * Usage: node migrate-quittances.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');

console.log('🔄 Début de la migration...');
console.log(`📁 Base de données: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données:', err.message);
    process.exit(1);
  }
  console.log('✅ Connecté à la base de données');
});

// Vérifier si la colonne existe déjà
db.get("PRAGMA table_info(Quittance)", (err, row) => {
  if (err) {
    console.error('❌ Erreur lors de la vérification:', err.message);
    db.close();
    process.exit(1);
  }
});

db.all("PRAGMA table_info(Quittance)", (err, rows) => {
  if (err) {
    console.error('❌ Erreur:', err.message);
    db.close();
    process.exit(1);
  }

  const colonneExiste = rows.some(row => row.name === 'numeroQuittance');

  if (colonneExiste) {
    console.log('ℹ️  La colonne numeroQuittance existe déjà, migration ignorée');
    db.close();
    return;
  }

  console.log('➕ Ajout de la colonne numeroQuittance...');

  db.run('ALTER TABLE Quittance ADD COLUMN numeroQuittance TEXT', (err) => {
    if (err) {
      console.error('❌ Erreur lors de l\'ajout de la colonne:', err.message);
      db.close();
      process.exit(1);
    }

    console.log('✅ Colonne numeroQuittance ajoutée');
    console.log('📊 Création de l\'index...');

    db.run('CREATE INDEX IF NOT EXISTS idx_quittance_numero ON Quittance(numeroQuittance)', (err) => {
      if (err) {
        console.error('❌ Erreur lors de la création de l\'index:', err.message);
        db.close();
        process.exit(1);
      }

      console.log('✅ Index créé avec succès');
      console.log('🎉 Migration terminée !');

      db.close((err) => {
        if (err) {
          console.error('❌ Erreur lors de la fermeture:', err.message);
        }
        console.log('👋 Base de données fermée');
      });
    });
  });
});
