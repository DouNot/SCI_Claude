-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Compte" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Compte_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Associe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT,
    "pourcentageParts" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "compteId" TEXT NOT NULL,
    CONSTRAINT "Associe_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "Compte" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bien" (
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

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bienId" TEXT NOT NULL,
    CONSTRAINT "Photo_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "Bien" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "dateDocument" DATETIME,
    "dateExpiration" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bienId" TEXT NOT NULL,
    CONSTRAINT "Document_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "Bien" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pret" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "montant" REAL NOT NULL,
    "taux" REAL NOT NULL,
    "duree" INTEGER NOT NULL,
    "mensualite" REAL NOT NULL,
    "tauxAssurance" REAL,
    "dateDebut" DATETIME NOT NULL,
    "organisme" TEXT NOT NULL,
    "numeroContrat" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "bienId" TEXT NOT NULL,
    CONSTRAINT "Pret_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "Bien" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Locataire" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "typeLocataire" TEXT NOT NULL DEFAULT 'ENTREPRISE',
    "raisonSociale" TEXT,
    "siret" TEXT,
    "formeJuridique" TEXT,
    "capitalSocial" REAL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "adresse" TEXT,
    "ville" TEXT,
    "codePostal" TEXT,
    "dateNaissance" DATETIME,
    "profession" TEXT,
    "dateEntree" DATETIME,
    "dateSortie" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "bienId" TEXT,
    CONSTRAINT "Locataire_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "Bien" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "typeBail" TEXT NOT NULL,
    "dateDebut" DATETIME NOT NULL,
    "dateFin" DATETIME,
    "duree" INTEGER NOT NULL,
    "loyerHC" REAL NOT NULL,
    "charges" REAL,
    "depotGarantie" REAL,
    "indexRevision" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "bienId" TEXT NOT NULL,
    "locataireId" TEXT NOT NULL,
    CONSTRAINT "Bail_locataireId_fkey" FOREIGN KEY ("locataireId") REFERENCES "Locataire" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Bail_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "Bien" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Quittance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mois" INTEGER NOT NULL,
    "annee" INTEGER NOT NULL,
    "montantLoyer" REAL NOT NULL,
    "montantCharges" REAL,
    "montantTotal" REAL NOT NULL,
    "datePaiement" DATETIME,
    "estPaye" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bailId" TEXT NOT NULL,
    CONSTRAINT "Quittance_bailId_fkey" FOREIGN KEY ("bailId") REFERENCES "Bail" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Facture" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT,
    "fournisseur" TEXT NOT NULL,
    "montantTTC" REAL NOT NULL,
    "montantHT" REAL,
    "tva" REAL,
    "dateFacture" DATETIME NOT NULL,
    "datePaiement" DATETIME,
    "categorie" TEXT NOT NULL,
    "sousCategorie" TEXT,
    "description" TEXT,
    "url" TEXT,
    "filename" TEXT,
    "estPaye" BOOLEAN NOT NULL DEFAULT false,
    "estDeductible" BOOLEAN NOT NULL DEFAULT true,
    "adresseDetectee" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "bienId" TEXT NOT NULL,
    CONSTRAINT "Facture_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "Bien" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Travaux" (
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

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT,
    "entreprise" TEXT,
    "type" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT,
    "adresse" TEXT,
    "siteWeb" TEXT,
    "notes" TEXT,
    "evaluation" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "compteId" TEXT NOT NULL,
    CONSTRAINT "Contact_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "Compte" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssembleeGenerale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "dateAG" DATETIME NOT NULL,
    "titre" TEXT,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "compteId" TEXT NOT NULL,
    CONSTRAINT "AssembleeGenerale_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "Compte" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvenementFiscal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "dateEcheance" DATETIME NOT NULL,
    "montant" REAL,
    "datePaiement" DATETIME,
    "estPaye" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "bienId" TEXT NOT NULL,
    CONSTRAINT "EvenementFiscal_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "Bien" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Charge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "montant" REAL NOT NULL,
    "frequence" TEXT NOT NULL,
    "dateDebut" DATETIME NOT NULL,
    "dateFin" DATETIME,
    "jourPaiement" INTEGER,
    "estActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "bienId" TEXT NOT NULL,
    CONSTRAINT "Charge_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "Bien" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaiementCharge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "datePaiement" DATETIME NOT NULL,
    "montant" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chargeId" TEXT NOT NULL,
    CONSTRAINT "PaiementCharge_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "Charge" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
