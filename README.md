# 🏢 SCI Cloud - Gestion de SCI Immobilières

Application web complète pour la gestion de SCI (Sociétés Civiles Immobilières).

## 🚀 Quick Start

```bash
# Backend
cd backend
npm install
npx prisma db push
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

Accès : `http://localhost:5173`

---

## 📚 Documentation

Toute la documentation est organisée dans le dossier `/docs` :

### 📖 Guides Utilisateur
- **[Guide d'Application](docs/guides/GUIDE_APPLICATION.md)** - Guide complet de l'application
- **[Guide Charges](docs/guides/GUIDE_CHARGES.md)** - Gestion des charges récurrentes
- **[Démarrage Backend](docs/guides/DEMARRAGE_BACKEND.md)** - Configuration et lancement
- **[Quick Reference](docs/guides/QUICK_REFERENCE.md)** - Référence rapide

### 🏗️ Architecture
- **[API Routes Space](docs/architecture/API_ROUTES_SPACE.md)** - Routes API par Space
- **[Space Context](docs/architecture/SPACECONTEXT_COMPLETE.md)** - Système multi-espaces
- **[Contexte Projet](docs/PROMPT_CONTEXTE.md)** - Contexte complet du projet

### 🔧 Migrations & Historique
- **[Guide Migration](docs/migrations/MIGRATION_GUIDE.md)** - Guide de migration
- **[Historique des Fixes](docs/migrations/)** - Tous les correctifs et évolutions

### 📦 Modules
- **[Module Associés](docs/modules/)** - Gestion complète des associés (Cap Table + CCA)
  - Documentation complète
  - Guide de test
  - Quick start

---

## 🎯 Fonctionnalités

### ✅ Modules Opérationnels

- **🏠 Gestion Patrimoine**
  - Biens immobiliers
  - Baux et locataires
  - Documents et photos
  - Prêts bancaires

- **💰 Finance**
  - Factures et charges
  - Événements fiscaux
  - Charges récurrentes
  - Compte Courant Associé (CCA)

- **👥 Associés (Cap Table)**
  - Répartition du capital
  - Suivi des parts
  - Mouvements CCA (Apports, Retraits, Intérêts)
  - Validation automatique 100%

- **📊 Dashboard**
  - Indicateurs clés
  - Statistiques en temps réel
  - Visualisations

---

## 🛠️ Stack Technique

### Backend
- Node.js + Express
- Prisma ORM
- SQLite (dev) / PostgreSQL (prod)
- JWT Authentication

### Frontend
- React + Vite
- Tailwind CSS
- Lucide Icons
- React Router

### Tools
- Chart.js / Recharts
- PDFKit
- Docker

---

## 📁 Structure du Projet

```
SCI_Claude/
├── backend/              # API Node.js + Express
│   ├── prisma/          # Schéma Prisma
│   ├── src/
│   │   ├── controllers/ # Logique métier
│   │   ├── routes/      # Routes Express
│   │   ├── middleware/  # Auth & Access Control
│   │   └── services/    # Services métier
│   └── server.js
│
├── frontend/            # React App
│   ├── src/
│   │   ├── components/  # Composants réutilisables
│   │   ├── pages/       # Pages de l'app
│   │   ├── contexts/    # Context API (Auth, Space)
│   │   └── services/    # API Services
│   └── vite.config.js
│
└── docs/                # 📚 Documentation
    ├── guides/          # Guides utilisateur
    ├── architecture/    # Docs techniques
    ├── migrations/      # Historique
    └── modules/         # Docs par module
```

---

## 🔐 Sécurité

- ✅ JWT Authentication
- ✅ Space Access Control
- ✅ Validation backend
- ✅ Transactions sécurisées
- ✅ Soft delete préservation données

---

## 📞 Support

Consulter la [documentation complète](docs/) pour toute question.

---

## 📝 License

Projet privé - Tous droits réservés

---

**Développé avec ❤️ pour la gestion de SCI**
