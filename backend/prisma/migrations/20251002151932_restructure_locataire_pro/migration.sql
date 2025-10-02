/*
  Warnings:

  - You are about to drop the column `depotGarantie` on the `Locataire` table. All the data in the column will be lost.
  - You are about to drop the column `noteInterne` on the `Locataire` table. All the data in the column will be lost.
  - Made the column `email` on table `Locataire` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Locataire" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "typeLocataire" TEXT NOT NULL DEFAULT 'ENTREPRISE',
    "raisonSociale" TEXT,
    "siret" TEXT,
    "formeJuridique" TEXT,
    "capitalSocial" REAL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "adresse" TEXT,
    "ville" TEXT,
    "codePostal" TEXT,
    "dateNaissance" DATETIME,
    "profession" TEXT,
    "dateEntree" DATETIME,
    "dateSortie" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "bienId" TEXT,
    CONSTRAINT "Locataire_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "Bien" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Locataire" ("bienId", "createdAt", "dateEntree", "dateNaissance", "dateSortie", "email", "id", "nom", "prenom", "profession", "telephone", "updatedAt") SELECT "bienId", "createdAt", "dateEntree", "dateNaissance", "dateSortie", "email", "id", "nom", "prenom", "profession", "telephone", "updatedAt" FROM "Locataire";
DROP TABLE "Locataire";
ALTER TABLE "new_Locataire" RENAME TO "Locataire";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
