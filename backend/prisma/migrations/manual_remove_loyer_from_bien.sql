-- Migration: Retrait loyer du modèle Bien et calcul automatique du statut
-- Date: 2025-10-06

-- 1. Retirer les colonnes loyerHC et charges de la table Bien
-- (Ces informations sont maintenant dans la table Bail)

-- SQLite ne supporte pas DROP COLUMN directement, donc on doit recréer la table

-- Créer une nouvelle table temporaire sans loyerHC et charges
CREATE TABLE "Bien_new" (
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

-- Copier les données (sans loyerHC et charges)
INSERT INTO "Bien_new" (
    "id", "adresse", "ville", "codePostal", "pays", "type", "surface",
    "nbPieces", "nbChambres", "etage", "prixAchat", "fraisNotaire",
    "dateAchat", "valeurActuelle", "statut", "description",
    "createdAt", "updatedAt", "compteId"
)
SELECT 
    "id", "adresse", "ville", "codePostal", "pays", "type", "surface",
    "nbPieces", "nbChambres", "etage", "prixAchat", "fraisNotaire",
    "dateAchat", "valeurActuelle", "statut", "description",
    "createdAt", "updatedAt", "compteId"
FROM "Bien";

-- Supprimer l'ancienne table
DROP TABLE "Bien";

-- Renommer la nouvelle table
ALTER TABLE "Bien_new" RENAME TO "Bien";

-- Recréer les index
CREATE INDEX "Bien_compteId_idx" ON "Bien"("compteId");

-- 2. Mettre à jour le statut de tous les biens selon leurs baux actifs
-- Un bien avec un bail ACTIF = LOUÉ, sinon = LIBRE

UPDATE "Bien" SET "statut" = 'LOUE'
WHERE "id" IN (
    SELECT DISTINCT "bienId" 
    FROM "Bail" 
    WHERE "statut" = 'ACTIF'
);

UPDATE "Bien" SET "statut" = 'LIBRE'
WHERE "id" NOT IN (
    SELECT DISTINCT "bienId" 
    FROM "Bail" 
    WHERE "statut" = 'ACTIF'
);

-- 3. Mettre à jour la date de modification
UPDATE "Bien" SET "updatedAt" = CURRENT_TIMESTAMP;
