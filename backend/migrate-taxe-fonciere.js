const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const migrationPath = path.join(__dirname, 'MIGRATION_TAXE_FONCIERE_BAIL.sql');

console.log('🔄 Application de la migration pour la taxe foncière dans les baux...\n');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur connexion à la base de données:', err);
    process.exit(1);
  }
});

const migration = fs.readFileSync(migrationPath, 'utf8');

db.exec(migration, (err) => {
  if (err) {
    console.error('❌ Erreur lors de l\'exécution de la migration:', err);
    db.close();
    process.exit(1);
  }
  
  console.log('✅ Migration appliquée avec succès !');
  console.log('✅ Les colonnes refactureTaxeFonciere et montantTaxeFonciere ont été ajoutées à la table Bail.\n');
  
  db.close((err) => {
    if (err) {
      console.error('❌ Erreur fermeture base de données:', err);
    }
    process.exit(0);
  });
});
