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
    "assuranceMensuelle" REAL,
    "taxeFonciere" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "compteId" TEXT NOT NULL,
    CONSTRAINT "Bien_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "Compte" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Bien" ("id", "adresse", "ville", "codePostal", "pays", "type", "surface", "nbPieces", "nbChambres", "etage", "prixAchat", "fraisNotaire", "dateAchat", "valeurActuelle", "statut", "description", "createdAt", "updatedAt", "compteId") SELECT "id", "adresse", "ville", "codePostal", "pays", "type", "surface", "nbPieces", "nbChambres", "etage", "prixAchat", "fraisNotaire", "dateAchat", "valeurActuelle", "statut", "description", "createdAt", "updatedAt", "compteId" FROM "Bien";
DROP TABLE "Bien";
ALTER TABLE "new_Bien" RENAME TO "Bien";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
