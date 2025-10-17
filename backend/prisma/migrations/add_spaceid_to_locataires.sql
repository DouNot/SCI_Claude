-- Migration: Ajout du champ spaceId au modèle Locataire

-- Étape 1: Ajouter la colonne (nullable temporairement)
ALTER TABLE locataires ADD COLUMN space_id TEXT;

-- Étape 2: Migrer les données existantes
-- Assigner le spaceId basé sur le bienId
UPDATE locataires
SET space_id = (
  SELECT biens.space_id
  FROM biens
  WHERE biens.id = locataires.bien_id
)
WHERE locataires.bien_id IS NOT NULL;

-- Pour les locataires sans bienId mais avec des baux
UPDATE locataires
SET space_id = (
  SELECT biens.space_id
  FROM baux
  JOIN biens ON baux.bien_id = biens.id
  WHERE baux.locataire_id = locataires.id
  LIMIT 1
)
WHERE locataires.space_id IS NULL
AND EXISTS (
  SELECT 1 FROM baux WHERE baux.locataire_id = locataires.id
);

-- Étape 3: Rendre la colonne NON NULL
-- (à faire après avoir vérifié que tous les locataires ont un spaceId)

-- Étape 4: Créer l'index
CREATE INDEX idx_locataires_space_id ON locataires(space_id);
