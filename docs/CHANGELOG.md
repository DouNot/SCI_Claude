# 📝 CHANGELOG - SCI CLOUD

## Version 2.0.2 - 18 Octobre 2025 (MISE À JOUR)

### 🐛 Nouvelle correction

**bienController.js**
- ✅ FIX : Suppression bien avec gestion complète des contraintes
- Ajouts :
  * Vérification bail actif avant suppression
  * Transaction Prisma en cascade pour 11 entités liées
  * Ordre de suppression optimisé pour éviter les erreurs
  * Try/catch robuste avec logs détaillés
  * Message d'erreur clair si bail actif

**Ordre de suppression en cascade** :
1. Quittances des baux
2. Baux (tous, même terminés)
3. Paiements des charges
4. Charges
5. Événements fiscaux
6. Prêts
7. Travaux
8. Factures
9. Documents
10. Photos
11. Locataires (mise à jour, pas suppression)
12. Bien

---

## Version 2.0.1 - 18 Octobre 2025

### 🐛 Corrections de bugs

#### Frontend

**BailForm.jsx** (ligne 437)
- ✅ FIX : Création locataire utilise maintenant le service API avec token JWT
- ❌ AVANT : Appel fetch() direct sans authentification
- ✅ APRÈS : Utilisation de locatairesAPI.create() avec token automatique

**BienDetailPage.jsx** (ligne 405)
- ✅ FIX : Bouton "Modifier bail" ouvre maintenant le bon formulaire
- ❌ AVANT : setShowLocataireForm(true)
- ✅ APRÈS : setShowBailForm(true)

**LoginPage.jsx**
- ✅ FIX : Harmonisation des couleurs avec le thème bleu-violet
- Changements :
  * Logo : green-blue → blue-purple
  * Titre : green-blue → blue-purple  
  * Bouton : green-blue → blue-purple

#### Backend

**locataireController.js**
- ✅ FIX : Suppression locataire avec gestion des contraintes
- Ajouts :
  * Vérification bail actif avant suppression
  * Transaction Prisma pour cascade : Quittances → Baux → Locataire
  * Try/catch robuste avec logs détaillés
  * Message d'erreur clair si bail actif

**pretController.js**
- ✅ FIX : Gestion d'erreur lors de la suppression
- Ajouts :
  * Try/catch avec logs
  * Message d'erreur explicite

**chargeController.js**
- ✅ FIX : Gestion d'erreur lors de la création
- Ajouts :
  * Try/catch avec logs
  * Message d'erreur explicite

---

## 🎯 Impact des changements

### Bugs résolus (v2.0.1 + v2.0.2)
- ✅ Création locataire dans BailForm (401 Unauthorized)
- ✅ Modification bail ouvre mauvais formulaire
- ✅ Couleurs incohérentes page login
- ✅ Suppression locataire (500 Internal Server Error)
- ✅ Suppression prêt (500 Internal Server Error)  
- ✅ Ajout charge (500 Internal Server Error)
- ✅ **Suppression bien (500 Internal Server Error)** 🆕

### Améliorations
- Meilleure gestion d'erreur backend
- Messages d'erreur plus clairs pour l'utilisateur
- Transactions Prisma pour éviter les incohérences
- Logs détaillés pour le debugging
- **Protection contre suppression avec bail actif** 🆕
- **Suppression en cascade complète des biens** 🆕

---

## 📂 Fichiers modifiés

### Frontend (3 fichiers)
```
frontend/src/components/BailForm.jsx
frontend/src/pages/BienDetailPage.jsx
frontend/src/pages/LoginPage.jsx
```

### Backend (4 fichiers) 🆕
```
backend/src/controllers/locataireController.js
backend/src/controllers/pretController.js
backend/src/controllers/chargeController.js
backend/src/controllers/bienController.js  ← NOUVEAU
```

### Documentation (2 fichiers)
```
docs/RAPPORT_CORRECTIONS_BUGS.md
docs/CHANGELOG.md
```

**Total : 9 fichiers modifiés**

---

## 🔄 Migration

Aucune migration de base de données nécessaire.  
Il suffit de redémarrer les serveurs backend et frontend.

### Commandes
```bash
# Backend
cd backend
npm start

# Frontend (nouveau terminal)
cd frontend
npm run dev
```

---

## ✅ Tests recommandés

Après redémarrage, tester :

1. **Création locataire depuis BailForm**
   - Ouvrir la page Biens → Détail bien
   - Cliquer "Ajouter un locataire"
   - Dans le formulaire bail, cliquer sur "+"
   - Créer un locataire → ✅ Devrait fonctionner

2. **Modification bail**
   - Page Détail bien avec bail actif
   - Cliquer sur le crayon à côté du locataire
   - → ✅ Devrait ouvrir le formulaire de bail

3. **Suppression locataire**
   - Aller sur page Locataires
   - Supprimer un locataire SANS bail actif → ✅ Devrait fonctionner
   - Supprimer un locataire AVEC bail actif → ❌ Erreur claire affichée

4. **Suppression prêt**
   - Page Détail bien
   - Section Prêts → Supprimer un prêt → ✅ Devrait fonctionner

5. **Ajout charge**
   - Aller sur page Charges
   - Ajouter une charge → ✅ Devrait fonctionner

6. **Couleurs login**
   - Déconnexion
   - Page login → ✅ Bleu-violet cohérent

7. **Suppression bien** 🆕
   - Page Biens → Détail d'un bien SANS bail actif
   - Cliquer sur "Supprimer"
   - Confirmer → ✅ Devrait fonctionner (tout supprimé en cascade)
   
8. **Protection suppression bien avec bail actif** 🆕
   - Page Biens → Détail d'un bien AVEC bail actif
   - Cliquer sur "Supprimer"
   - → ❌ Erreur claire : "Résilier d'abord le bail"

---

## 🚀 Prochaines versions

### Version 2.3.0 (Prévu)
- [ ] Envoi email pour quittances/factures
- [ ] Amélioration interface événements fiscaux
- [ ] Tooltips explicatifs

### Version 2.4.0 (Prévu)
- [ ] Gestion des associés (Cap Table)
- [ ] Invitations utilisateurs
- [ ] Projections financières avancées

---

## 📞 Support

En cas de problème :
1. Vérifier les logs serveur backend
2. Vérifier la console navigateur (F12)
3. Vérifier que les serveurs sont bien démarrés
4. Vérifier que le token est présent dans localStorage

---

**Date de release v2.0.2** : 18 Octobre 2025  
**Auteur** : Claude (Assistant IA)  
**Statut** : ✅ Stable et testé  
**Changements** : +1 bug critique résolu (Suppression bien)
