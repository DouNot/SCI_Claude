/*
  Warnings:

  - You are about to drop the column `charges` on the `Bien` table. All the data in the column will be lost.
  - You are about to drop the column `loyerHC` on the `Bien` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bien" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adresse" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "codePostal" TEXT NOT NULL,
    "pays" TEXT NOT NULL DEFAULT 'France',
    "type" TEXT NOT NULL,
    "surface" REAL NOT NULL,
    "nbPieces" INTEGER,
    "nbChambres" INTEGER,
    "etage" INTEGER,
    "prixAchat" REAL NOT NULL,
    "fraisNotaire" REAL,
    "dateAchat" DATETIME NOT NULL,
    "valeurActuelle" REAL,
    "statut" TEXT NOT NULL DEFAULT 'LIBRE',
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "compteId" TEXT NOT NULL,
    CONSTRAINT "Bien_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "Compte" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Bien" ("adresse", "codePostal", "compteId", "createdAt", "dateAchat", "description", "etage", "fraisNotaire", "id", "nbChambres", "nbPieces", "pays", "prixAchat", "statut", "surface", "type", "updatedAt", "valeurActuelle", "ville") SELECT "adresse", "codePostal", "compteId", "createdAt", "dateAchat", "description", "etage", "fraisNotaire", "id", "nbChambres", "nbPieces", "pays", "prixAchat", "statut", "surface", "type", "updatedAt", "valeurActuelle", "ville" FROM "Bien";
DROP TABLE "Bien";
ALTER TABLE "new_Bien" RENAME TO "Bien";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
