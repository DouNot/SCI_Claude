-- Migration: Ajouter les champs de refacturation de la Taxe Foncière
-- Date: 2025-10-19

-- Ajouter les nouveaux champs au modèle Bail
ALTER TABLE baux ADD COLUMN part_refacture_tf REAL;
ALTER TABLE baux ADD COLUMN montant_refacture_tf REAL;

-- Note: Les champs refacture_taxe_fonciere et montant_taxe_fonciere existent déjà
-- montant_taxe_fonciere servira de snapshot de la TF au moment de la création du bail
