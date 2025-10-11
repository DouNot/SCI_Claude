-- Migration: Ajout du champ numeroQuittance au modèle Quittance
-- Cette migration ajoute un champ pour stocker le numéro unique de quittance

-- Ajouter la colonne numeroQuittance
ALTER TABLE Quittance ADD COLUMN numeroQuittance TEXT;

-- Créer un index pour rechercher rapidement par numéro de quittance
CREATE INDEX idx_quittance_numero ON Quittance(numeroQuittance);
