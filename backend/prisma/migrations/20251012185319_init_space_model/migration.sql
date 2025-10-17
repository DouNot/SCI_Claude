-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nom" TEXT,
    "prenom" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_space_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "spaces" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "siret" TEXT,
    "capital_social" REAL,
    "forme_juridique" TEXT DEFAULT 'SCI',
    "date_creation" DATETIME,
    "date_cloture" TEXT,
    "regime_fiscal" TEXT,
    "adresse" TEXT,
    "objet_social" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "space_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "space_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'PENDING',
    "invitation_token" TEXT,
    "invitation_sent_at" DATETIME,
    "invitation_accepted_at" DATETIME,
    "invited_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "space_members_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "space_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "space_members_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "associes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "space_id" TEXT NOT NULL,
    "user_id" TEXT,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT,
    "type" TEXT NOT NULL DEFAULT 'PERSONNE_PHYSIQUE',
    "nombre_parts" INTEGER NOT NULL,
    "pourcentage" REAL NOT NULL,
    "valeur_nominale" REAL,
    "solde_cca" REAL NOT NULL DEFAULT 0,
    "date_entree" DATETIME NOT NULL,
    "date_sortie" DATETIME,
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "associes_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "associes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "biens" (
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
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "space_id" TEXT NOT NULL,
    CONSTRAINT "biens_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bien_id" TEXT NOT NULL,
    CONSTRAINT "photos_bien_id_fkey" FOREIGN KEY ("bien_id") REFERENCES "biens" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "date_document" DATETIME,
    "date_expiration" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bien_id" TEXT NOT NULL,
    CONSTRAINT "documents_bien_id_fkey" FOREIGN KEY ("bien_id") REFERENCES "biens" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "prets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "montant" REAL NOT NULL,
    "taux" REAL NOT NULL,
    "duree" INTEGER NOT NULL,
    "mensualite" REAL NOT NULL,
    "taux_assurance" REAL,
    "date_debut" DATETIME NOT NULL,
    "organisme" TEXT NOT NULL,
    "numero_contrat" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "bien_id" TEXT NOT NULL,
    CONSTRAINT "prets_bien_id_fkey" FOREIGN KEY ("bien_id") REFERENCES "biens" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "locataires" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type_locataire" TEXT NOT NULL DEFAULT 'ENTREPRISE',
    "raison_sociale" TEXT,
    "siret" TEXT,
    "forme_juridique" TEXT,
    "capital_social" REAL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "adresse" TEXT,
    "ville" TEXT,
    "code_postal" TEXT,
    "date_naissance" DATETIME,
    "profession" TEXT,
    "date_entree" DATETIME,
    "date_sortie" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "bien_id" TEXT,
    CONSTRAINT "locataires_bien_id_fkey" FOREIGN KEY ("bien_id") REFERENCES "biens" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "baux" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type_bail" TEXT NOT NULL,
    "date_debut" DATETIME NOT NULL,
    "date_fin" DATETIME,
    "duree" INTEGER NOT NULL,
    "loyer_hc" REAL NOT NULL,
    "charges" REAL,
    "depot_garantie" REAL,
    "index_revision" TEXT,
    "refacture_taxe_fonciere" BOOLEAN NOT NULL DEFAULT false,
    "montant_taxe_fonciere" REAL,
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "bien_id" TEXT NOT NULL,
    "locataire_id" TEXT NOT NULL,
    CONSTRAINT "baux_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "locataires" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "baux_bien_id_fkey" FOREIGN KEY ("bien_id") REFERENCES "biens" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "quittances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero_quittance" TEXT,
    "mois" INTEGER NOT NULL,
    "annee" INTEGER NOT NULL,
    "montant_loyer" REAL NOT NULL,
    "montant_charges" REAL,
    "montant_total" REAL NOT NULL,
    "date_paiement" DATETIME,
    "est_paye" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bail_id" TEXT NOT NULL,
    CONSTRAINT "quittances_bail_id_fkey" FOREIGN KEY ("bail_id") REFERENCES "baux" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "factures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT,
    "fournisseur" TEXT NOT NULL,
    "montant_ttc" REAL NOT NULL,
    "montant_ht" REAL,
    "tva" REAL,
    "date_facture" DATETIME NOT NULL,
    "date_paiement" DATETIME,
    "categorie" TEXT NOT NULL,
    "sous_categorie" TEXT,
    "description" TEXT,
    "url" TEXT,
    "filename" TEXT,
    "est_paye" BOOLEAN NOT NULL DEFAULT false,
    "est_deductible" BOOLEAN NOT NULL DEFAULT true,
    "adresse_detectee" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "bien_id" TEXT NOT NULL,
    CONSTRAINT "factures_bien_id_fkey" FOREIGN KEY ("bien_id") REFERENCES "biens" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "travaux" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "categorie" TEXT,
    "date_debut" DATETIME NOT NULL,
    "date_fin" DATETIME,
    "cout_estime" REAL NOT NULL,
    "cout_reel" REAL,
    "artisan" TEXT,
    "telephone" TEXT,
    "etat" TEXT NOT NULL DEFAULT 'PLANIFIE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "bien_id" TEXT NOT NULL,
    CONSTRAINT "travaux_bien_id_fkey" FOREIGN KEY ("bien_id") REFERENCES "biens" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT,
    "entreprise" TEXT,
    "type" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT,
    "adresse" TEXT,
    "site_web" TEXT,
    "notes" TEXT,
    "evaluation" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "space_id" TEXT NOT NULL,
    CONSTRAINT "contacts_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "assemblees_generales" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "date_ag" DATETIME NOT NULL,
    "titre" TEXT,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "space_id" TEXT NOT NULL,
    CONSTRAINT "assemblees_generales_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "evenements_fiscaux" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "date_echeance" DATETIME NOT NULL,
    "montant" REAL,
    "date_paiement" DATETIME,
    "est_paye" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "bien_id" TEXT NOT NULL,
    CONSTRAINT "evenements_fiscaux_bien_id_fkey" FOREIGN KEY ("bien_id") REFERENCES "biens" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "charges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "montant" REAL NOT NULL,
    "frequence" TEXT NOT NULL,
    "date_debut" DATETIME NOT NULL,
    "date_fin" DATETIME,
    "jour_paiement" INTEGER,
    "est_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "bien_id" TEXT,
    CONSTRAINT "charges_bien_id_fkey" FOREIGN KEY ("bien_id") REFERENCES "biens" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "paiements_charges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date_paiement" DATETIME NOT NULL,
    "montant" REAL NOT NULL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "charge_id" TEXT NOT NULL,
    CONSTRAINT "paiements_charges_charge_id_fkey" FOREIGN KEY ("charge_id") REFERENCES "charges" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priorite" TEXT NOT NULL DEFAULT 'NORMALE',
    "statut" TEXT NOT NULL DEFAULT 'NON_LUE',
    "date_echeance" DATETIME,
    "lien_type" TEXT,
    "lien_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "space_id" TEXT NOT NULL,
    CONSTRAINT "notifications_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "spaces_slug_key" ON "spaces"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "spaces_siret_key" ON "spaces"("siret");

-- CreateIndex
CREATE UNIQUE INDEX "space_members_invitation_token_key" ON "space_members"("invitation_token");

-- CreateIndex
CREATE INDEX "space_members_invitation_token_idx" ON "space_members"("invitation_token");

-- CreateIndex
CREATE UNIQUE INDEX "space_members_space_id_user_id_key" ON "space_members"("space_id", "user_id");

-- CreateIndex
CREATE INDEX "associes_space_id_statut_idx" ON "associes"("space_id", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "quittances_numero_quittance_key" ON "quittances"("numero_quittance");

-- CreateIndex
CREATE INDEX "quittances_numero_quittance_idx" ON "quittances"("numero_quittance");
