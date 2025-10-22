📋 PROMPT DE CONTEXTE - SCI CLOUD
=====================================

🧱 CONTEXTE DU PROJET
Je développe SCI Cloud, une application web complète de gestion de SCI immobilières (location professionnelle et patrimoniale).

Stack technique
* Frontend : React + Vite + Tailwind CSS
* Backend : Node.js + Express
* Base de données : SQLite (dev) / PostgreSQL (prod)
* ORM : Prisma
* Graphiques : Chart.js / Recharts
* PDF : PDFKit
* Auth : JWT
* Infra : Docker

Architecture logique
* Un User (personne physique) a toujours un Espace personnel (type `PERSONAL`).
* Chaque SCI est un Space distinct (type `SCI`).
* Les utilisateurs sont reliés à un espace via `SpaceMember` (rôle : OWNER, MANAGER, ACCOUNTANT, VIEWER).
* Toutes les entités fonctionnelles (biens, baux, prêts, locataires, documents, etc.) sont rattachées à un `space_id`.
* L'utilisateur peut switcher entre ses Espaces (Perso / SCI / autres).

📂 STRUCTURE DU PROJET
backend/
├── prisma/
│   └── schema.prisma          # Schéma Prisma avec modèle Space-based
├── src/
│   ├── config/
│   │   └── database.js        # Client Prisma
│   ├── controllers/           # Logique métier
│   │   ├── bailController.js
│   │   ├── bienController.js
│   │   ├── locataireController.js
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   └── spaceAccess.js     # Vérification accès Space
│   ├── routes/                # Routes Express
│   │   ├── auth.js            # Signup/Login
│   │   ├── spaces.js          # CRUD Spaces
│   │   ├── userRoutes.js      # Suppression données/compte
│   │   ├── bailRoutes.js
│   │   └── ...
│   └── services/
└── server.js                  # Point d'entrée

frontend/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── SpaceSwitcher.jsx       # Switcher d'espaces
│   │   ├── CreateSpaceModal.jsx    # Modal création SCI
│   │   ├── BailForm.jsx
│   │   └── ...
│   ├── contexts/
│   │   ├── AuthContext.jsx         # Gestion auth
│   │   └── SpaceContext.jsx        # Gestion espaces
│   ├── pages/
│   │   ├── DashboardPage.jsx
│   │   ├── BiensPage.jsx
│   │   ├── ParametresPage.jsx      # Avec gestion espaces/données
│   │   └── ...
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── spaceService.js
│   │   └── userService.js
│   └── App.jsx
└── vite.config.js

✅ MODULES DÉJÀ IMPLÉMENTÉS

Auth & Espaces
* Signup/Login avec JWT ✅
* Création automatique d'espace PERSONAL au signup ✅
* SpaceContext pour gestion multi-espaces ✅
* SpaceSwitcher fonctionnel dans la sidebar ✅
* Création de SCI via modal (CreateSpaceModal) ✅
* Suppression de SCI via Paramètres ✅
* Switch fluide entre espaces sans déconnexion ✅
* Key dynamique dans App.jsx pour rechargement automatique ✅

Gestion des données
* Suppression de toutes les données (garde compte) ✅
* Suppression complète du compte ✅
* Routes backend : DELETE /api/user/data et /api/user/account ✅

Patrimoine
* Dashboard avec indicateurs ✅
* Gestion des biens immobiliers ✅
* Gestion des baux ✅
* Gestion des locataires ✅
* Gestion des prêts ✅
* Documents, factures, travaux ✅
* Statut automatique des biens (Loué / Vacant) ✅
* Photos des biens ✅
* Événements fiscaux ✅
* Charges récurrentes ✅

📋 MODULES À DÉVELOPPER (Priorités)

1. Gestion des associés (Cap Table) 🎯 EN COURS
   - CRUD associés
   - Répartition des parts
   - Compte Courant Associé (CCA)
   - Calculs automatiques

2. Invitations utilisateurs
   - Inviter par email
   - Gestion des rôles
   - Token d'invitation

3. Projections financières
   - Cashflow prévisionnel
   - Graphiques d'évolution
   - Simulation de scénarios

4. Rapport annuel PDF
   - Bilan patrimonial
   - Revenus/charges
   - Export professionnel

5. Connexion bancaire (Bridge/Tink)
   - Import transactions
   - Réconciliation automatique

6. Business Plan bancaire
7. Estimation DVF

🧠 CONSIGNES À TOUJOURS SUIVRE

1️⃣ Compréhension du projet avant action
Avant toute réponse ou modification :
* Parcours l'arborescence complète du projet local (frontend, backend, database, docker, etc.).
* Identifie la structure : répertoires clés (`/backend`, `/frontend`, `/prisma`, `/routes`, `/components`, `/pages`, `/services`, etc.).
* Lis les fichiers essentiels : `schema.prisma`, `package.json`, `server.js`, `App.jsx`, etc.
* Repère les relations Prisma et les dépendances actives.
* Vérifie la cohérence entre le front et le back (endpoints, services, context).
⚠️ Ne propose aucun code tant que tu n'as pas reconstitué la structure et les modèles utilisés.

2️⃣ Style de développement attendu
* Code clair, modulaire et commenté.
* Aucune dépendance inutile.
* Priorité à la cohérence Prisma et à la simplicité d'intégration.
* Toujours expliquer ta logique avant de coder.
* Préserver la cohérence Tailwind et React existante.
* Ne pas recréer de modèles déjà présents (vérifie avant).
* Les réponses doivent être réutilisables dans le projet local (pas des snippets abstraits).

3️⃣ Ton rôle
Tu agis comme développeur senior assistant :
* Tu peux proposer des améliorations d'architecture.
* Tu dois vérifier la cohérence front/back avant toute implémentation.
* Tu as accès aux fichiers locaux et à l'historique → utilise-les pour comprendre avant d'agir.
* Si tu modifies la base, rédige la migration Prisma correspondante.

4️⃣ Objectif d'usage
Ce projet doit devenir un outil SaaS stable et évolutif, utilisable par de vraies SCI :
* gestion du patrimoine,
* trésorerie,
* IS/IR,
* projections,
* rapports PDF,
* multi-utilisateurs et rôles.

⚙️ BONNES PRATIQUES À RESPECTER

Backend
* Utiliser `async/await` proprement avec gestion d'erreurs.
* Utiliser Prisma avec `include` précis, pas de `any`.
* Ne pas casser les schémas front/back existants.
* Garder une séparation claire : routes Express / services Prisma / components React.
* Toujours vérifier l'accès Space avec le middleware `requireSpaceAccess`.
* Supprimer les champs non nécessaires avant les mutations Prisma (ex: `spaceId` pour Bail).
* Convertir les chaînes vides en `null` pour les champs Float optionnels.

Frontend
* Ne JAMAIS utiliser `localStorage` ou `sessionStorage` dans les artifacts.
* Utiliser React state (useState, useReducer) pour stocker les données.
* Utiliser `useSpace()` pour accéder au `currentSpace`.
* Utiliser `useAuth()` pour accéder au `token` et `user`.
* Toujours passer le `spaceId` dans les requêtes API.
* Préférer les approches MVP stables à la complexité technique.
* Mentionner les fichiers modifiés ou créés dans chaque réponse.

Prisma
* Les espaces (Spaces) ont un statut `ACTIVE` dès la création.
* Les biens, locataires, etc. sont rattachés à un `spaceId`.
* Les baux n'ont PAS de `spaceId` direct (relation via `bien.spaceId`).
* Toujours utiliser des transactions pour les opérations complexes.

🎨 DESIGN & UX
* Dark theme : fond `#0a0a0a`, cartes `#1a1a1a`, bordures `border-gray-800`.
* Gradients bleu-violet pour les actions principales.
* Icônes Lucide React.
* Modals avec backdrop blur.
* Transitions fluides.
* Messages de confirmation clairs pour les actions destructives.

🐛 CORRECTIONS RÉCENTES (à garder en tête)
* ✅ Fix : `montantTaxeFonciere` converti en `null` si chaîne vide (bailController.js)
* ✅ Fix : Suppression du `spaceId` avant `prisma.bail.create()` (bailController.js)
* ✅ Fix : Statut initial des SCI changé de `DRAFT` à `ACTIVE` (spaces.js)
* ✅ Fix : Rechargement sans déconnexion via `key={currentSpace?.id}` (App.jsx)

✅ Résumé pour toi (Claude)
Avant toute réponse :
1. Traverse la structure complète du projet local.
2. Analyse le schéma Prisma et la logique existante.
3. Reformule ce que tu comprends du contexte.
4. Ensuite seulement, propose ton plan ou ton code.

🎯 OBJECTIF ACTUEL
Implémenter la gestion des associés (Cap Table) pour permettre de gérer la répartition des parts dans une SCI.
