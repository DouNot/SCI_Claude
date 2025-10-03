/*
  Warnings:

  - Made the column `coutEstime` on table `Travaux` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dateDebut` on table `Travaux` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Travaux" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "categorie" TEXT,
    "dateDebut" DATETIME NOT NULL,
    "dateFin" DATETIME,
    "coutEstime" REAL NOT NULL,
    "coutReel" REAL,
    "artisan" TEXT,
    "telephone" TEXT,
    "etat" TEXT NOT NULL DEFAULT 'PLANIFIE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "bienId" TEXT NOT NULL,
    CONSTRAINT "Travaux_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "Bien" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Travaux" ("artisan", "bienId", "categorie", "coutEstime", "coutReel", "createdAt", "dateDebut", "dateFin", "description", "id", "telephone", "titre", "type", "updatedAt") SELECT "artisan", "bienId", "categorie", "coutEstime", "coutReel", "createdAt", "dateDebut", "dateFin", "description", "id", "telephone", "titre", "type", "updatedAt" FROM "Travaux";
DROP TABLE "Travaux";
ALTER TABLE "new_Travaux" RENAME TO "Travaux";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
