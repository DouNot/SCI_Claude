/*
  Warnings:

  - Added the required column `space_id` to the `locataires` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_locataires" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type_locataire" TEXT NOT NULL DEFAULT 'ENTREPRISE',
    "raison_sociale" TEXT,
    "siret" TEXT,
    "forme_juridique" TEXT,
    "capital_social" REAL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "adresse" TEXT,
    "ville" TEXT,
    "code_postal" TEXT,
    "date_naissance" DATETIME,
    "profession" TEXT,
    "date_entree" DATETIME,
    "date_sortie" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "space_id" TEXT NOT NULL,
    "bien_id" TEXT,
    CONSTRAINT "locataires_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "locataires_bien_id_fkey" FOREIGN KEY ("bien_id") REFERENCES "biens" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_locataires" ("adresse", "bien_id", "capital_social", "code_postal", "created_at", "date_entree", "date_naissance", "date_sortie", "email", "forme_juridique", "id", "nom", "prenom", "profession", "raison_sociale", "siret", "telephone", "type_locataire", "updated_at", "ville") SELECT "adresse", "bien_id", "capital_social", "code_postal", "created_at", "date_entree", "date_naissance", "date_sortie", "email", "forme_juridique", "id", "nom", "prenom", "profession", "raison_sociale", "siret", "telephone", "type_locataire", "updated_at", "ville" FROM "locataires";
DROP TABLE "locataires";
ALTER TABLE "new_locataires" RENAME TO "locataires";
CREATE INDEX "locataires_space_id_idx" ON "locataires"("space_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
