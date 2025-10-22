# 📚 INDEX DE LA DOCUMENTATION - SCI CLOUD

Bienvenue dans la documentation complète de SCI Cloud !

---

## 📖 GUIDES UTILISATEUR

### Démarrage
- **[Démarrage Backend](guides/DEMARRAGE_BACKEND.md)** - Installation et configuration du backend
- **[Guide d'Application](guides/GUIDE_APPLICATION.md)** - Guide complet de l'application
- **[Quick Reference](guides/QUICK_REFERENCE.md)** - Référence rapide des fonctionnalités

### Fonctionnalités
- **[Guide Charges](guides/GUIDE_CHARGES.md)** - Gestion des charges récurrentes

---

## 🏗️ ARCHITECTURE & TECHNIQUE

### Système Core
- **[PROMPT_CONTEXTE.md](PROMPT_CONTEXTE.md)** - 🎯 **CONTEXTE COMPLET DU PROJET** (À LIRE EN PREMIER)
- **[API Routes Space](architecture/API_ROUTES_SPACE.md)** - Documentation des routes API par Space
- **[Space Context Complete](architecture/SPACECONTEXT_COMPLETE.md)** - Système multi-espaces (PERSONAL / SCI)

---

## 📦 MODULES

### Module Associés (Cap Table + CCA)
- **[Documentation Complète](modules/ASSOCIES_CAP_TABLE_COMPLETE.md)** - Architecture, endpoints, design
- **[Implémentation Finale](modules/IMPLEMENTATION_FINALE.md)** - Vue d'ensemble de l'implémentation
- **[Guide de Test](modules/GUIDE_TEST_ASSOCIES.md)** - Tests étape par étape
- **[Quick Start Associés](modules/QUICK_START_ASSOCIES.md)** - Démarrage rapide
- **[Résumé Implémentation](modules/RESUME_IMPLEMENTATION.md)** - Résumé de l'implémentation

---

## 🔧 MIGRATIONS & HISTORIQUE

### Guides de Migration
- **[Migration Guide](migrations/MIGRATION_GUIDE.md)** - Guide principal de migration
- **[Migration Guide Windows](migrations/MIGRATION_GUIDE_WINDOWS.md)** - Spécifique Windows
- **[Migration Instructions](migrations/MIGRATION_INSTRUCTIONS.md)** - Instructions détaillées

### Scripts SQL
- **[Migration CCA](migrations/MIGRATION_CCA.sql)** - Création table Compte Courant Associé
- **[Migration Charges](migrations/MIGRATION_CHARGES.sql)** - Création table charges récurrentes

### Historique des Modifications

#### Backend
- **[Backend Migration Complete](migrations/BACKEND_MIGRATION_COMPLETE.md)** - Migration backend terminée
- **[Middleware SpaceAccess Status](migrations/MIDDLEWARE_SPACEACCESS_STATUS.md)** - Status middleware

#### Frontend
- **[Frontend Auth Complete](migrations/FRONTEND_AUTH_COMPLETE.md)** - Authentification complète
- **[Navigation Cleanup](migrations/NAVIGATION_CLEANUP.md)** - Nettoyage navigation

#### Fixes & Corrections
- **[Fix Auth Errors](migrations/FIX_AUTH_ERRORS.md)** - Correction erreurs auth
- **[Fix Auth Locataires](migrations/FIX_AUTH_LOCATAIRES.md)** - Fix locataires
- **[Fix Événements Fiscaux](migrations/FIX_EVENEMENTS_FISCAUX.md)** - Fix événements fiscaux
- **[Fix Prêt Locataire](migrations/FIX_PRET_LOCATAIRE.md)** - Fix prêts
- **[Instructions Taxe Foncière](migrations/INSTRUCTIONS_TAXE_FONCIERE.md)** - Gestion taxe foncière

#### Sécurité
- **[Security Progress](migrations/SECURITY_PROGRESS.md)** - Avancement sécurité
- **[Security Final Report](migrations/SECURITY_FINAL_REPORT.md)** - Rapport final sécurité

#### Autres
- **[Progression](migrations/PROGRESSION.md)** - Suivi de progression du projet
- **[Reprise Post Auth](migrations/REPRISE_POST_AUTH.md)** - Reprise après auth
- **[Résumé Modifications](migrations/RESUME_MODIFICATIONS.md)** - Résumé des modifs

---

## 🗂️ ORGANISATION DE LA DOCUMENTATION

```
docs/
├── PROMPT_CONTEXTE.md          # 🎯 CONTEXTE PRINCIPAL
├── INDEX.md                     # Ce fichier
│
├── guides/                      # 📖 Guides utilisateur
│   ├── GUIDE_APPLICATION.md
│   ├── GUIDE_CHARGES.md
│   ├── DEMARRAGE_BACKEND.md
│   └── QUICK_REFERENCE.md
│
├── architecture/                # 🏗️ Architecture technique
│   ├── API_ROUTES_SPACE.md
│   └── SPACECONTEXT_COMPLETE.md
│
├── modules/                     # 📦 Documentation par module
│   ├── ASSOCIES_CAP_TABLE_COMPLETE.md
│   ├── IMPLEMENTATION_FINALE.md
│   ├── GUIDE_TEST_ASSOCIES.md
│   ├── QUICK_START_ASSOCIES.md
│   └── RESUME_IMPLEMENTATION.md
│
└── migrations/                  # 🔧 Historique & migrations
    ├── MIGRATION_*.md
    ├── MIGRATION_*.sql
    ├── FIX_*.md
    ├── SECURITY_*.md
    └── PROGRESSION.md
```

---

## 🎯 PAR OÙ COMMENCER ?

### 1️⃣ Nouveau sur le projet ?
→ Lire **[PROMPT_CONTEXTE.md](PROMPT_CONTEXTE.md)** en premier !

### 2️⃣ Installation ?
→ Consulter **[Démarrage Backend](guides/DEMARRAGE_BACKEND.md)**

### 3️⃣ Utilisation ?
→ Voir **[Guide Application](guides/GUIDE_APPLICATION.md)**

### 4️⃣ Développement ?
→ Lire **[Architecture](architecture/)** et **[Migrations](migrations/)**

### 5️⃣ Module Associés ?
→ Commencer par **[Quick Start Associés](modules/QUICK_START_ASSOCIES.md)**

---

## 🔍 RECHERCHE RAPIDE

### Besoin de...
- **Comprendre le projet** → `PROMPT_CONTEXTE.md`
- **Installer le backend** → `guides/DEMARRAGE_BACKEND.md`
- **Utiliser l'app** → `guides/GUIDE_APPLICATION.md`
- **Routes API** → `architecture/API_ROUTES_SPACE.md`
- **Gestion associés** → `modules/` (tout dedans)
- **Migrations SQL** → `migrations/*.sql`
- **Historique fixes** → `migrations/FIX_*.md`
- **Sécurité** → `migrations/SECURITY_*.md`

---

## 📝 CONVENTIONS

### Nommage des fichiers
- `GUIDE_*.md` → Guides utilisateur
- `FIX_*.md` → Correctifs et fixes
- `MIGRATION_*.md` → Guides de migration
- `MIGRATION_*.sql` → Scripts SQL
- `*_COMPLETE.md` → Documentation exhaustive
- `QUICK_*.md` → Démarrage rapide
- `RESUME_*.md` → Résumés

### Symboles
- 🎯 → Important / Prioritaire
- ✅ → Terminé / Validé
- 🚀 → Démarrage rapide
- 📚 → Documentation
- 🔧 → Technique
- 💡 → Astuce / Info

---

## 🆘 BESOIN D'AIDE ?

1. **Contexte général** → Lire `PROMPT_CONTEXTE.md`
2. **Problème technique** → Consulter `migrations/FIX_*.md`
3. **Utilisation** → Voir `guides/`
4. **Architecture** → Voir `architecture/`

---

**Documentation mise à jour : Octobre 2025**
