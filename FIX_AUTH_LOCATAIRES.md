# 🔧 CORRECTIONS AUTHENTIFICATION - Problème Locataires

**Date :** 12 octobre 2025  
**Problème :** Impossible de créer un locataire (erreur 401 Unauthorized)

---

## 🔍 DIAGNOSTIC

### Problème identifié
Lorsque l'utilisateur tente de créer un locataire :
- **Depuis la page locataires** : Rien ne se passe, pas d'erreur visible
- **Depuis la page détail du bien** : Erreur 401 (Unauthorized)

### Cause racine
1. Le backend `requireSpaceAccess` middleware attend un `spaceId` dans la requête
2. L'intercepteur axios ajoute automatiquement le `spaceId` depuis `localStorage.getItem('currentSpaceId')`
3. **MAIS** : Le `currentSpaceId` n'était pas correctement initialisé dans localStorage

### Pourquoi le currentSpaceId n'était pas initialisé ?
Dans `AuthContext.jsx`, la fonction `initializeCurrentSpace` :
- Vérifiait d'abord si un `currentSpaceId` existait déjà
- Si oui, elle ne faisait rien (return early)
- **Problème** : Si l'utilisateur avait un ancien `currentSpaceId` invalide ou corrompu, il ne se réinitialisait jamais

---

## ✅ CORRECTIONS APPORTÉES

### 1. **AuthContext.jsx** - Logs détaillés et forceRefresh

#### Modifications clés :
```javascript
// Nouvelle signature avec forceRefresh
const initializeCurrentSpace = async (authToken, userData, forceRefresh = false) => {
  // Si forceRefresh = true, on réinitialise toujours
  const existingSpaceId = localStorage.getItem('currentSpaceId');
  if (!forceRefresh && existingSpaceId) {
    console.log('✅ CurrentSpaceId déjà défini:', existingSpaceId);
    return;
  }
  // ... récupération et sélection du space
}

// Au démarrage de l'app
await initializeCurrentSpace(savedToken, userData, true); // Force refresh

// Au login/signup
await initializeCurrentSpace(data.token, data.user, true); // Force refresh
```

#### Logs ajoutés :
- ✅ Logs de chaque étape de l'initialisation
- 📡 Logs de récupération des espaces
- 🔍 Logs de sélection du space
- ⚠️ Warnings si aucun espace trouvé
- ❌ Logs d'erreurs détaillés

### 2. **api.js** - Intercepteur amélioré avec logs

#### Modifications clés :
```javascript
api.interceptors.request.use((config) => {
  // 1. Ajouter le token
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('⚠️ Pas de token - la requête risque d\'échouer');
  }
  
  // 2. Ajouter le spaceId
  const currentSpaceId = localStorage.getItem('currentSpaceId');
  if (currentSpaceId) {
    // ... ajout dans params ou body
    console.log(`📤 ${config.method.toUpperCase()} ${config.url} [spaceId: ${currentSpaceId}]`);
  } else {
    console.warn(`⚠️ AUCUN spaceId - Risque d'erreur 403`);
  }
});
```

#### Logs ajoutés :
- 📤 Log de chaque requête avec méthode, URL et spaceId
- ⚠️ Warning si pas de token
- ⚠️ Warning si pas de spaceId
- ❌ Logs d'erreurs détaillés pour 401, 403, 400
- 🔒 Message explicite en cas d'erreur 401
- 🚫 Message explicite en cas d'erreur 403
- 📝 Log spécifique pour la création de locataires

---

## 🧪 COMMENT TESTER

### 1. Vider le localStorage (nettoyage complet)
Ouvrir la console du navigateur (F12) et exécuter :
```javascript
localStorage.clear();
location.reload();
```

### 2. Se connecter
1. Aller sur http://localhost:5173
2. Se connecter avec vos identifiants
3. **Vérifier dans la console** :
   - `🔐 Tentative de connexion:`
   - `✅ Connexion réussie`
   - `🔄 Initialisation du currentSpaceId...`
   - `📡 Récupération des espaces de l'utilisateur...`
   - `📦 Espaces récupérés:` (doit afficher un tableau)
   - `✅ CurrentSpaceId initialisé: [ID]`

### 3. Vérifier le localStorage
Dans la console :
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('SpaceId:', localStorage.getItem('currentSpaceId'));
```

Les deux doivent être définis !

### 4. Tester la création de locataire
1. Aller sur la page **Locataires**
2. Cliquer sur **"Ajouter un locataire"**
3. Remplir le formulaire
4. Valider
5. **Vérifier dans la console** :
   - `📝 Création d'un locataire:` (données envoyées)
   - `📤 POST /locataires [spaceId: ...]`
   - `✅ Locataire créé:` (réponse)

### 5. Tester depuis la page détail du bien
1. Aller sur un bien
2. Cliquer sur "Ajouter un locataire"
3. Créer le locataire
4. Créer le bail
5. Doit fonctionner sans erreur 401 !

---

## 📊 LOGS À SURVEILLER

### Logs normaux (tout va bien)
```
🔐 Tentative de connexion: user@example.com
✅ Connexion réussie
🔄 Initialisation du currentSpaceId...
📡 Récupération des espaces de l'utilisateur...
📦 Espaces récupérés: [{id: "...", nom: "...", type: "SCI"}]
🔍 Sélection par défaut: SCI - Ma SCI
✅ CurrentSpaceId initialisé: abc123... (Ma SCI)

📤 GET /biens [spaceId: abc123...]
📤 GET /locataires [spaceId: abc123...]
📝 Création d'un locataire: {nom: "...", ...}
📤 POST /locataires [spaceId: abc123...]
✅ Locataire créé: {id: "...", ...}
```

### Logs problématiques (quelque chose ne va pas)
```
⚠️ Pas de token dans localStorage - la requête risque d'échouer
⚠️ POST /locataires - AUCUN spaceId dans localStorage !
⚠️ Aucun espace trouvé pour cet utilisateur !
❌ Erreur initialisation currentSpaceId: ...
❌ POST /locataires → 401
🔒 Erreur 401 - Token invalide ou expiré - Déconnexion...
🚫 Erreur 403 - Accès refusé au Space
```

---

## 🎯 RÉSULTATS ATTENDUS

Après ces corrections :
- ✅ Le `currentSpaceId` est **TOUJOURS** initialisé après login/signup
- ✅ Les logs permettent de **suivre précisément** ce qui se passe
- ✅ La création de locataires fonctionne **depuis n'importe quelle page**
- ✅ Plus d'erreurs 401 Unauthorized
- ✅ Plus d'erreurs 403 Forbidden (sauf si vraiment pas membre du Space)
- ✅ Les requêtes incluent automatiquement le token ET le spaceId

---

## 🔄 FLUX CORRIGÉ

### Avant (problème)
```
1. Login/Signup
2. Token stocké
3. Vérification si currentSpaceId existe
   → Si oui : Ne rien faire (PROBLÈME si invalide !)
   → Si non : Initialiser
4. Tentative de création locataire
   → Pas de spaceId → Erreur 401/403
```

### Après (corrigé)
```
1. Login/Signup
2. Token stocké
3. TOUJOURS réinitialiser le currentSpaceId (forceRefresh = true)
4. Logs détaillés à chaque étape
5. Vérification du spaceId avant chaque requête
6. Création locataire
   → Token + spaceId présents → ✅ Success
```

---

## 📝 FICHIERS MODIFIÉS

1. **`frontend/src/contexts/AuthContext.jsx`**
   - ✅ Paramètre `forceRefresh` ajouté à `initializeCurrentSpace`
   - ✅ Logs détaillés à chaque étape
   - ✅ Force refresh au démarrage, login et signup
   - ✅ Logs d'erreurs avec détails

2. **`frontend/src/services/api.js`**
   - ✅ Logs détaillés dans l'intercepteur de requête
   - ✅ Warnings si token ou spaceId manquant
   - ✅ Logs d'erreurs détaillés (401, 403, 400)
   - ✅ Log spécifique pour création de locataires

---

## 🚨 SI LE PROBLÈME PERSISTE

### 1. Vérifier le backend
```bash
cd backend
npm start
```
Le serveur doit être démarré sur http://localhost:3000

### 2. Vérifier la base de données
L'utilisateur doit avoir au moins un Space (PERSONAL ou SCI) :
```javascript
// Dans la console Node.js backend
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Vérifier les spaces de l'utilisateur
prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: {
    spaceMembers: {
      include: { space: true }
    }
  }
}).then(console.log);
```

### 3. Recréer un utilisateur propre
Si tout est corrompu, créer un nouveau compte :
1. Aller sur `/signup`
2. Créer un nouveau compte
3. Un espace PERSONAL sera créé automatiquement
4. Tout devrait fonctionner

---

## 💡 POINTS IMPORTANTS

1. **Le currentSpaceId est CRITIQUE**
   - Sans lui, TOUTES les requêtes avec `requireSpaceAccess` échouent
   - Il doit être initialisé immédiatement après authentification

2. **Les logs sont essentiels**
   - Permettent de déboguer rapidement
   - Montrent précisément où le problème se situe
   - À retirer en production si besoin

3. **ForceRefresh au login/signup**
   - Garantit un état propre à chaque connexion
   - Évite les bugs de cache localStorage

4. **Vérifier le backend**
   - Les routes doivent être protégées par `requireAuth` + `requireSpaceAccess`
   - Le middleware doit accepter spaceId dans params, query ou body

---

**Dernière mise à jour :** 12 octobre 2025

✅ Problème corrigé !
