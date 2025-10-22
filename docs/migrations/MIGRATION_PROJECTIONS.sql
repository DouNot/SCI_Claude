-- Migration pour ajouter les tables de Projections Financières

-- Table principale : Projections
CREATE TABLE IF NOT EXISTS projections (
  id TEXT PRIMARY KEY,
  space_id TEXT NOT NULL,
  nom TEXT NOT NULL,
  description TEXT,
  scenario TEXT NOT NULL DEFAULT 'REALISTE', -- OPTIMISTE, REALISTE, PESSIMISTE, PERSONNALISE
  duree_annees INTEGER NOT NULL DEFAULT 5,
  date_debut DATE NOT NULL,
  statut TEXT NOT NULL DEFAULT 'BROUILLON', -- BROUILLON, ACTIVE, ARCHIVEE
  
  -- Métadonnées
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE CASCADE
);

-- Table : Hypothèses de projection
CREATE TABLE IF NOT EXISTS hypotheses_projection (
  id TEXT PRIMARY KEY,
  projection_id TEXT NOT NULL,
  
  -- Hypothèses générales
  taux_inflation REAL NOT NULL DEFAULT 2.0, -- %
  taux_vacance_locative REAL NOT NULL DEFAULT 5.0, -- %
  taux_augmentation_loyer REAL NOT NULL DEFAULT 2.0, -- % par an
  taux_augmentation_charges REAL NOT NULL DEFAULT 3.0, -- % par an
  
  -- Hypothèses de rentabilité
  taux_actualisation REAL NOT NULL DEFAULT 4.0, -- % pour calcul VAN
  taux_imposition REAL NOT NULL DEFAULT 30.0, -- %
  
  -- Hypothèses de travaux
  provision_travaux_annuelle REAL NOT NULL DEFAULT 0, -- € par an
  travaux_exceptionnels TEXT, -- JSON : [{ annee: 2, montant: 10000, description: "..." }]
  
  -- Hypothèses de revente
  inclure_revente BOOLEAN NOT NULL DEFAULT 0,
  annee_revente INTEGER,
  taux_appreciation_bien REAL NOT NULL DEFAULT 2.0, -- % par an
  frais_vente REAL NOT NULL DEFAULT 8.0, -- %
  
  -- Métadonnées
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (projection_id) REFERENCES projections(id) ON DELETE CASCADE
);

-- Table : Données calculées par période
CREATE TABLE IF NOT EXISTS donnees_projection (
  id TEXT PRIMARY KEY,
  projection_id TEXT NOT NULL,
  annee INTEGER NOT NULL,
  mois INTEGER NOT NULL, -- 1-12
  
  -- Revenus
  revenus_locatifs REAL NOT NULL DEFAULT 0,
  autres_revenus REAL NOT NULL DEFAULT 0,
  total_revenus REAL NOT NULL DEFAULT 0,
  
  -- Charges
  charges_fixes REAL NOT NULL DEFAULT 0, -- Assurance, taxe foncière, etc.
  charges_variables REAL NOT NULL DEFAULT 0,
  mensualites_pret REAL NOT NULL DEFAULT 0,
  travaux REAL NOT NULL DEFAULT 0,
  impots REAL NOT NULL DEFAULT 0,
  total_charges REAL NOT NULL DEFAULT 0,
  
  -- Résultats
  cashflow_net REAL NOT NULL DEFAULT 0,
  cashflow_cumule REAL NOT NULL DEFAULT 0,
  
  -- Patrimoine
  valeur_bien REAL NOT NULL DEFAULT 0,
  capital_restant_du REAL NOT NULL DEFAULT 0,
  patrimoine_net REAL NOT NULL DEFAULT 0,
  
  -- Métadonnées
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (projection_id) REFERENCES projections(id) ON DELETE CASCADE
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_projections_space ON projections(space_id);
CREATE INDEX IF NOT EXISTS idx_hypotheses_projection ON hypotheses_projection(projection_id);
CREATE INDEX IF NOT EXISTS idx_donnees_projection ON donnees_projection(projection_id, annee, mois);
CREATE INDEX IF NOT EXISTS idx_projections_statut ON projections(space_id, statut);
