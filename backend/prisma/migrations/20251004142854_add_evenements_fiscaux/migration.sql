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
