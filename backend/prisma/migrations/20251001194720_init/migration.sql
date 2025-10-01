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
    "loyerHC" REAL,
    "charges" REAL,
    "statut" TEXT NOT NULL DEFAULT 'LIBRE',
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "compteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Bien_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "Compte" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Bien_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
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
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT,
    "dateNaissance" DATETIME,
    "profession" TEXT,
    "depotGarantie" REAL,
    "dateEntree" DATETIME,
    "dateSortie" DATETIME,
    "noteInterne" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "bienId" TEXT NOT NULL,
    CONSTRAINT "Locataire_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "Bien" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    CONSTRAINT "Bail_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "Bien" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Bail_locataireId_fkey" FOREIGN KEY ("locataireId") REFERENCES "Locataire" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "categorie" TEXT NOT NULL,
    "dateDebut" DATETIME,
    "dateFin" DATETIME,
    "coutEstime" REAL,
    "coutReel" REAL,
    "artisan" TEXT,
    "telephone" TEXT,
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
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
