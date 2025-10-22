# 📋 REPRISE POST-AUTHENTIFICATION - Points à améliorer

**Date :** 16 octobre 2025  
**Contexte :** L'authentification fonctionne, voici ce qu'il faut reprendre/améliorer

---

## ✅ CE QUI FONCTIONNE DÉJÀ

### Frontend
- ✅ **Authentification complète** (login, signup, logout)
- ✅ **Protection des routes** avec ProtectedRoute
- ✅ **React Router** utilisé partout (plus de `onNavigate`)
- ✅ **SpaceContext** fonctionnel
- ✅ **SpaceSwitcher** dans la Sidebar
- ✅ **Intercepteurs axios** (token + spaceId auto-ajoutés)
- ✅ **Navigation** avec useNavigate dans toutes les pages
- ✅ **Logs détaillés** pour le débogage

### Backend
- ✅ **Routes d'authentification** (/api/auth/*)
- ✅ **Routes Spaces** (/api/spaces/*)
- ✅ **Middlewares** requireAuth + requireSpaceAccess
- ✅ **Protection des anciennes routes** (biens, locataires, etc.)

---

## 🔧 POINTS À REPRENDRE / AMÉLIORER

### 1. **SpaceSwitcher - Créer une SCI**
**Problème actuel :**
```javascript
onClick={() => {
  setIsOpen(false);
  // TODO: Ouvrir modal de création SCI
  alert('Fonctionnalité "Créer une SCI" à venir !');
}}
```

**À faire :**
- ✅ Créer un composant `CreateSCIModal.jsx`
- ✅ Formulaire avec champs : nom, SIRET, capital social, date cloture, régime fiscal, etc.
- ✅ Appeler `spaceService.createSpace()`
- ✅ Rediriger vers le nouvel espace après création

---

### 2. **Page Paramètres - Gestion du profil et des espaces**
**État actuel :** Page existe mais probablement incomplète

**À faire :**
- ✅ Section **Mon profil** : modifier nom, prénom, email, mot de passe
- ✅ Section **Mes espaces** : liste des espaces avec actions (modifier, archiver)
- ✅ Section **Paramètres de la SCI active** : modifier infos SCI (nom, SIRET, capital, etc.)
- ✅ Bouton **Créer une nouvelle SCI**
- ✅ Possibilité de **quitter un espace** (si pas OWNER)

---

### 3. **Page Associés - Intégration avec SpaceContext**
**État actuel :** Page existe mais peut nécessiter des ajustements

**À faire :**
- ✅ Vérifier que les associés sont bien filtrés par `currentSpace.id`
- ✅ Afficher uniquement les associés de la SCI active
- ✅ Lier les associés aux `SpaceMembers` (invitations, rôles, etc.)
- ✅ Synchronisation entre Associés (cap table) et Members (accès app)

---

### 4. **Gestion des rôles et permissions**
**État actuel :** Les rôles existent (OWNER, MANAGER, MEMBER, VIEWER, COMPTABLE) mais peu utilisés

**À faire :**
- ✅ Restreindre les actions selon le rôle :
  - **OWNER** : Tout
  - **MANAGER** : Gestion biens, locataires, documents (pas modif SCI)
  - **COMPTABLE** : Accès factures, charges, événements fiscaux (lecture/écriture)
  - **VIEWER** : Lecture seule partout
- ✅ Cacher les boutons d'action selon le rôle
- ✅ Middleware backend `requireSpaceRole(['OWNER', 'MANAGER'])` sur certaines routes

---

### 5. **Invitations utilisateurs**
**État actuel :** Routes backend existent (`/api/invitations/*`) mais pas d'interface

**À faire :**
- ✅ Créer un composant `InviteMemberModal.jsx`
- ✅ Formulaire : email + rôle
- ✅ Envoyer invitation par email (backend déjà prêt ?)
- ✅ Page d'acceptation d'invitation `/invitation/accept/:token`
- ✅ Liste des invitations en attente dans Paramètres

---

### 6. **Amélioration du Dashboard**
**État actuel :** Dashboard existe mais peut nécessiter des ajustements

**À faire :**
- ✅ Afficher les **KPIs du Space actif** uniquement
- ✅ Indicateurs : patrimoine total, revenus locatifs, charges, taux d'occupation
- ✅ **Graphiques** : évolution patrimoine, cashflow mensuel
- ✅ **Notifications importantes** : baux à renouveler, travaux en cours, factures impayées
- ✅ **Switcher rapide** entre espaces depuis le Dashboard

---

### 7. **Notifications**
**État actuel :** NotificationBell existe mais peut être amélioré

**À faire :**
- ✅ Filtrer notifications par `currentSpace.id`
- ✅ Générer automatiquement des notifications :
  - Bail arrive à échéance (3 mois, 1 mois, 1 semaine)
  - Taxe foncière à payer
  - Travaux planifiés
  - Invitation reçue
- ✅ Bouton "Marquer toutes comme lues"
- ✅ Suppression des anciennes notifications

---

### 8. **Exports et rapports**
**État actuel :** Route `/api/exports/bien/:id/bilan` existe

**À faire :**
- ✅ **Rapport annuel complet** (revenus, charges, IS, résultat)
- ✅ **Export Excel** de toutes les données
- ✅ **Bilan patrimonial** global de la SCI
- ✅ **Liasse fiscale** (pré-remplissage 2072)
- ✅ Bouton dans Paramètres ou Dashboard

---

### 9. **Gestion des documents**
**État actuel :** Page Documents existe

**À faire :**
- ✅ Upload de fichiers avec prévisualisation
- ✅ Catégorisation (Actes notariés, Baux, Factures, PV AG, etc.)
- ✅ Recherche et filtres
- ✅ Dates d'expiration avec alertes
- ✅ **Cloud storage** (actuellement local dans `/uploads`)

---

### 10. **Multi-espaces - UX améliorée**
**État actuel :** SpaceSwitcher fonctionne mais peut être amélioré

**À faire :**
- ✅ **Indicateur visuel** de l'espace actif (couleur, badge)
- ✅ **Couleurs différentes** par espace (personnalisation)
- ✅ **Dernière activité** sur chaque espace
- ✅ **Favoris** : épingler un espace en haut
- ✅ **Recherche** d'espaces si beaucoup (>10)

---

### 11. **Page connexion - Mot de passe oublié**
**État actuel :** Lien "Mot de passe oublié" présent mais non fonctionnel

**À faire :**
- ✅ Créer route backend `/api/auth/forgot-password`
- ✅ Générer token de réinitialisation
- ✅ Envoyer email avec lien
- ✅ Page `/reset-password/:token`
- ✅ Formulaire nouveau mot de passe

---

### 12. **Logs de production**
**État actuel :** Beaucoup de `console.log` pour le débogage

**À faire :**
- ✅ Garder les logs en développement
- ✅ **Retirer/commenter** les logs en production
- ✅ Ou utiliser un système de log niveau (debug, info, warn, error)
- ✅ Logger uniquement les erreurs en prod

---

### 13. **Tests et validation**
**À faire :**
- ✅ Tester la création de compte
- ✅ Tester la création d'une SCI
- ✅ Tester le switch entre espaces
- ✅ Tester toutes les pages avec différents rôles
- ✅ Tester les autorisations (essayer d'accéder à un Space non autorisé)
- ✅ Tester avec plusieurs utilisateurs
- ✅ Tester les invitations

---

### 14. **Sécurité**
**À faire :**
- ✅ Variables d'environnement sensibles (JWT_SECRET, etc.)
- ✅ HTTPS en production
- ✅ Rate limiting sur les routes d'authentification
- ✅ CORS configuré correctement
- ✅ Validation des données entrantes (backend)
- ✅ Protection CSRF si nécessaire

---

### 15. **Performance**
**À faire :**
- ✅ Lazy loading des pages/composants React
- ✅ Pagination des listes (biens, locataires, documents)
- ✅ Cache des espaces dans SpaceContext
- ✅ Optimisation des requêtes Prisma (select, include)
- ✅ Compression des images uploadées

---

## 🎯 PRIORITÉS

### 🔴 **Priorité 1 (Urgent - Fonctionnalités critiques)**
1. ✅ Créer une SCI depuis le SpaceSwitcher
2. ✅ Page Paramètres complète (profil + espaces)
3. ✅ Gestion des rôles et permissions
4. ✅ Tests de bout en bout (inscription → création SCI → utilisation)

### 🟠 **Priorité 2 (Important - Améliorations UX)**
5. ✅ Invitations utilisateurs
6. ✅ Dashboard amélioré avec KPIs
7. ✅ Notifications automatiques
8. ✅ Mot de passe oublié

### 🟡 **Priorité 3 (Nice to have - Fonctionnalités avancées)**
9. ✅ Exports et rapports avancés
10. ✅ Gestion documents améliorée
11. ✅ Multi-espaces UX améliorée
12. ✅ Performance et optimisations

---

## 📝 PROPOSITION DE PLAN D'ACTION

### **Phase 1 : Compléter les fonctionnalités critiques** (1-2 jours)
1. Créer `CreateSCIModal.jsx` + intégration
2. Compléter la page Paramètres
3. Implémenter les rôles et permissions
4. Tests complets

### **Phase 2 : Améliorer l'UX** (2-3 jours)
5. Système d'invitations complet
6. Dashboard avec vrais KPIs
7. Notifications automatiques
8. Mot de passe oublié

### **Phase 3 : Fonctionnalités avancées** (3-5 jours)
9. Rapports et exports
10. Documents avancés
11. Optimisations diverses

---

## ❓ QUESTIONS À SE POSER

1. **Quel est le MVP minimum pour commencer à utiliser l'app ?**
   - Créer un compte ✅
   - Créer une SCI ❌ (à faire)
   - Ajouter des biens ✅
   - Ajouter des locataires ✅
   - Suivre les revenus/charges ✅
   - Voir le dashboard ✅

2. **Quelles sont les fonctionnalités "must-have" pour vous ?**
   - Indiquez vos priorités !

3. **Voulez-vous qu'on implémente quelque chose en particulier maintenant ?**
   - CreateSCIModal ?
   - Page Paramètres ?
   - Gestion des rôles ?
   - Invitations ?
   - Dashboard amélioré ?

---

**Prêt à reprendre le développement ! Quelle est votre priorité ?** 🚀
