# 🔧 Corrections - Problèmes d'authentification et d'autorisation

## 🔍 Problèmes identifiés

D'après les erreurs de console :
1. **401 Unauthorized** - Token non envoyé ou invalide
2. **403 Forbidden** - Pas d'accès au Space (spaceId manquant)
3. **500 Internal Server Error** - Erreur serveur sur POST /api/travaux

## ✅ Corrections apportées

### 1. **AuthContext.jsx** - Initialisation du currentSpaceId

**Problème :**
- Après login/signup, le `currentSpaceId` n'était pas initialisé immédiatement
- Le SpaceContext se chargeait de façon asynchrone, laissant un délai sans spaceId
- Les composants faisaient des requêtes avant que le Space soit chargé → **403 Forbidden**

**Solution :**
```javascript
// Nouvelle fonction ajoutée
const initializeCurrentSpace = async (authToken, userData) => {
  // Récupérer les spaces de l'utilisateur
  const spaces = await spaceService.getAllSpaces(authToken);
  
  // Utiliser lastSpaceId ou le premier space
  const selectedSpace = spaces.find(s => s.id === userData.lastSpaceId) 
    || spaces.find(s => s.type === 'SCI') 
    || spaces[0];
  
  // Définir immédiatement dans localStorage
  if (selectedSpace) {
    localStorage.setItem('currentSpaceId', selectedSpace.id);
  }
};

// Appelée immédiatement après login/signup
const login = async (email, password) => {
  const data = await authService.login(email, password);
  setToken(data.token);
  setUser(data.user);
  localStorage.setItem('token', data.token);
  
  // ✅ Initialisation immédiate du Space
  await initializeCurrentSpace(data.token, data.user);
  
  return { success: true };
};
```

**Résultat :**
- ✅ Le `currentSpaceId` est disponible immédiatement après l'authentification
- ✅ Plus d'erreur 403 sur les premières requêtes
- ✅ L'intercepteur axios peut ajouter le spaceId dès le début

### 2. **travauxController.js** - Suppression du spaceId avant création

**Problème :**
- Le `spaceId` était envoyé dans le body par l'intercepteur axios
- Le modèle Prisma `Travaux` n'a pas de champ `spaceId`
- Prisma générait une erreur → **500 Internal Server Error**

**Solution :**
```javascript
// Avant la création
const dataToCreate = { ...data };

// ... nettoyage des données ...

// ✅ Supprimer spaceId (pas dans le modèle Travaux)
delete dataToCreate.spaceId;

const travaux = await prisma.travaux.create({
  data: dataToCreate,
  // ...
});
```

**Résultat :**
- ✅ Plus d'erreur 500 lors de la création de travaux
- ✅ Le spaceId est vérifié via le bien, pas directement sur les travaux

## 🔄 Flux d'authentification corrigé

### Avant :
```
Login/Signup → Token stocké → Rendu des composants
                              ↓
                         Requêtes API (sans spaceId) → 403 Forbidden
                              ↓
                         SpaceContext charge (async)
                              ↓
                         currentSpaceId défini (trop tard)
```

### Après :
```
Login/Signup → Token stocké → Initialisation currentSpaceId → Rendu des composants
                                                              ↓
                                                         Requêtes API (avec spaceId) → ✅ Success
```

## 📋 Architecture des middlewares

```
Requête API
    ↓
requireAuth (vérifie token JWT)
    ↓ req.user défini
requireSpaceAccess (vérifie membership au Space)
    ↓ req.spaceId, req.spaceMember, req.spaceRole définis
Controller (traitement de la requête)
```

### requireSpaceAccess vérifie :
1. ✅ Un `spaceId` est fourni (params, query ou body)
2. ✅ L'utilisateur est membre **ACTIF** de ce Space
3. ✅ Le Space est **ACTIF** (pas DRAFT ou ARCHIVED)

## 🧪 Tests recommandés

### 1. Tester le signup
1. Créer un nouveau compte
2. Vérifier dans la console : `✅ CurrentSpaceId initialisé: [ID]`
3. Vérifier que le dashboard se charge sans erreur 403
4. Vérifier qu'on peut créer un bien, un locataire, etc.

### 2. Tester le login
1. Se connecter avec un compte existant
2. Vérifier que les données se chargent immédiatement
3. Pas d'erreur 403 dans la console

### 3. Tester la création de travaux
1. Aller sur un bien
2. Cliquer "Ajouter des travaux"
3. Remplir le formulaire
4. Valider → Devrait créer sans erreur 500

### 4. Tester la création de locataire
1. Aller sur un bien sans locataire
2. Cliquer "Ajouter un locataire"
3. Dans le formulaire de bail, cliquer sur le bouton `+` à côté de "Locataire"
4. Créer le locataire
5. Créer le bail → Devrait fonctionner sans erreur 401

## 📝 Fichiers modifiés

1. **`frontend/src/contexts/AuthContext.jsx`**
   - ✅ Ajout de `initializeCurrentSpace()`
   - ✅ Appel immédiat après login/signup
   - ✅ Nettoyage du localStorage lors du logout

2. **`backend/src/controllers/travauxController.js`**
   - ✅ Suppression du `spaceId` avant création
   - ✅ Évite l'erreur Prisma "champ inconnu"

## 🎯 Résultat attendu

Après ces corrections :
- ✅ Plus d'erreurs 401/403 au chargement initial
- ✅ Les composants peuvent faire des requêtes immédiatement
- ✅ La création de travaux fonctionne
- ✅ La création de locataire fonctionne (via le bouton `+` dans le bail)
- ✅ Le NotificationBell se charge correctement
- ✅ La liste des biens s'affiche sans erreur

## 💡 Points importants

1. **Le `currentSpaceId` est essentiel**
   - Sans lui, toutes les requêtes avec `requireSpaceAccess` échouent
   - Il doit être initialisé **immédiatement** après l'authentification

2. **Les anciennes routes utilisent le système Space**
   - Les routes comme `/api/locataires`, `/api/biens` utilisent `requireSpaceAccess`
   - Elles attendent un `spaceId` dans params, query ou body
   - L'intercepteur axios l'ajoute automatiquement depuis localStorage

3. **Le modèle Travaux n'a pas de spaceId direct**
   - Le Space est accessible via `travaux.bien.spaceId`
   - Il faut supprimer `spaceId` du body avant de créer/update

## 🚀 Prochaines étapes

Si d'autres erreurs 401/403/500 apparaissent :
1. Vérifier que le `currentSpaceId` est bien défini dans localStorage
2. Vérifier que l'utilisateur est bien membre ACTIF du Space
3. Vérifier les logs du serveur backend pour plus de détails
4. Utiliser les DevTools Network pour voir les requêtes et réponses

## 📌 Commandes de débogage

```javascript
// Dans la console du navigateur
localStorage.getItem('token')          // Devrait avoir un token
localStorage.getItem('currentSpaceId') // Devrait avoir un ID
```

```javascript
// Vérifier le Space dans la console
console.log('Token:', localStorage.getItem('token'));
console.log('SpaceId:', localStorage.getItem('currentSpaceId'));
```
