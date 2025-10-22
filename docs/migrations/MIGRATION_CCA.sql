-- Migration : Ajout du modèle MouvementCCA pour gérer le Compte Courant Associé
-- Date : 2025-10-17

-- Création de la table mouvements_cca
CREATE TABLE IF NOT EXISTS "mouvements_cca" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "associe_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "montant" REAL NOT NULL,
    "libelle" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "mouvements_cca_associe_id_fkey" FOREIGN KEY ("associe_id") REFERENCES "associes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Créer les index pour améliorer les performances
CREATE INDEX "mouvements_cca_associe_id_date_idx" ON "mouvements_cca"("associe_id", "date");

-- Commande Prisma à exécuter :
-- npx prisma db push
-- ou
-- npx prisma migrate dev --name add_mouvement_cca
