-- Migration: Ajout de la refacturation de la taxe foncière dans les baux
-- Date: 2025-01-11

-- Ajouter les colonnes pour la refacturation de la taxe foncière
ALTER TABLE Bail ADD COLUMN refactureTaxeFonciere BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE Bail ADD COLUMN montantTaxeFonciere REAL;

-- Mettre à jour les baux existants avec la valeur par défaut
UPDATE Bail SET refactureTaxeFonciere = 0 WHERE refactureTaxeFonciere IS NULL;
