# 🚀 Guide de Démarrage Rapide - Système Space

## ✅ Vérification de la Migration

La migration a été effectuée avec succès ! Vérifions que tout fonctionne.

### 1. Vérifier les Données Migrées

```powershell
# Ouvrir Prisma Studio
cd C:\Users\orous\OneDrive\Bureau\Projet_Dev\SCI_Claude\backend
npx prisma studio
```

**Dans Prisma Studio, vérifiez :**
- [ ] Table `User` existe avec `passwordHash`
- [ ] Table `Space` contient des espaces PERSONAL et SCI
- [ ] Table `SpaceMember` a des membres ACTIVE avec rôle OWNER
- [ ] Table `Associe` a un champ `spaceId`
- [ ] Table `Bien` a un champ `spaceId`

---

## 🔄 Démarrer le Nouveau Backend

### Option A : Remplacer complètement (Recommandé)

```powershell
cd backend

# Backup de l'ancien server.js
Copy-Item server.js server-old.js

# Remplacer par le nouveau
Copy-Item server-new.js server.js -Force

# Démarrer le serveur
npm run dev
```

### Option B : Test côte à côte

```powershell
# Lancer le nouveau serveur sur un autre port
$env:PORT=3001
node server-new.js
```

---

## 🧪 Tests API

### 1. Créer un Compte

```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signup" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"test@test.com","password":"password123","nom":"Test","prenom":"User"}'
```

**Réponse attendue :**
```json
{
  "message": "Compte créé avec succès",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "test@test.com",
    "nom": "Test",
    "prenom": "User",
    "lastSpaceId": "uuid-espace-personnel"
  }
}
```

**Actions automatiques :**
- ✅ User créé
- ✅ Espace Personnel créé automatiquement
- ✅ SpaceMember OWNER créé
- ✅ Token JWT généré

---

### 2. Se Connecter

```powershell
# Sauvegarder le token dans une variable
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"test@test.com","password":"password123"}'

$token = $response.token
```

---

### 3. Lister les Spaces

```powershell
$headers = @{ Authorization = "Bearer $token" }

Invoke-RestMethod -Uri "http://localhost:3000/api/spaces" `
  -Method GET `
  -Headers $headers
```

**Réponse attendue :**
```json
[
  {
    "id": "uuid",
    "type": "PERSONAL",
    "nom": "Espace Personnel",
    "statut": "ACTIVE",
    "myRole": "OWNER",
    "nbBiens": 0,
    "nbAssocies": 0
  }
]
```

---

### 4. Créer une SCI

```powershell
$sci = Invoke-RestMethod -Uri "http://localhost:3000/api/spaces" `
  -Method POST `
  -Headers $headers `
  -ContentType "application/json" `
  -Body '{"nom":"Ma Première SCI","capitalSocial":5000,"regimeFiscal":"IR","dateCloture":"31/12"}'

$spaceId = $sci.space.id
```

**Actions automatiques :**
- ✅ Space SCI créé
- ✅ User ajouté comme OWNER
- ✅ lastSpaceId mis à jour

---

### 5. Créer un Bien dans la SCI

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/spaces/$spaceId/biens" `
  -Method POST `
  -Headers $headers `
  -ContentType "application/json" `
  -Body '{
    "adresse": "123 Rue de la République",
    "ville": "Lyon",
    "codePostal": "69001",
    "pays": "France",
    "type": "APPARTEMENT",
    "surface": 75,
    "nbPieces": 3,
    "prixAchat": 250000,
    "dateAchat": "2024-01-15"
  }'
```

**Réponse attendue :**
```json
{
  "success": true,
  "message": "Bien créé avec succès",
  "data": {
    "id": "uuid",
    "adresse": "123 Rue de la République",
    "ville": "Lyon",
    "statut": "LIBRE",
    "spaceId": "uuid-de-la-sci"
  }
}
```

---

### 6. Lister les Biens de la SCI

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/spaces/$spaceId/biens" `
  -Method GET `
  -Headers $headers
```

---

## ✅ Checklist de Validation

Une fois ces tests effectués, vérifiez :

- [ ] ✅ Signup fonctionne
- [ ] ✅ Login fonctionne et retourne un token
- [ ] ✅ GET /spaces retourne l'espace personnel
- [ ] ✅ POST /spaces crée une SCI
- [ ] ✅ POST /spaces/:id/biens crée un bien
- [ ] ✅ GET /spaces/:id/biens liste les biens
- [ ] ✅ Les données sont isolées par Space

---

## 🔧 Dépannage

### Erreur : "Token manquant"
**Cause :** Le token n'est pas dans le header  
**Solution :** Vérifiez que le header `Authorization: Bearer {token}` est présent

### Erreur : "Space non trouvé"
**Cause :** Le spaceId est incorrect  
**Solution :** Vérifiez le spaceId avec `GET /api/spaces`

### Erreur : "Accès refusé"
**Cause :** Vous n'êtes pas membre du Space  
**Solution :** Vérifiez vos SpaceMembers dans Prisma Studio

### Les anciennes routes ne fonctionnent plus
**Cause :** Le nouveau server.js n'inclut que les nouvelles routes  
**Solution :** Utilisez le nouveau format `/api/spaces/:spaceId/*`

---

## 📊 Données de Test Complètes

Pour créer un jeu de données complet :

```powershell
# 1. Créer un compte
$signup = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signup" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"demo@sci.com","password":"demo1234","nom":"Dupont","prenom":"Jean"}'

$token = $signup.token
$headers = @{ Authorization = "Bearer $token" }

# 2. Créer 2 SCI
$sci1 = Invoke-RestMethod -Uri "http://localhost:3000/api/spaces" `
  -Method POST -Headers $headers -ContentType "application/json" `
  -Body '{"nom":"SCI Immobilier Paris","capitalSocial":10000,"regimeFiscal":"IR"}'

$sci2 = Invoke-RestMethod -Uri "http://localhost:3000/api/spaces" `
  -Method POST -Headers $headers -ContentType "application/json" `
  -Body '{"nom":"SCI Lyon Centre","capitalSocial":5000,"regimeFiscal":"IS"}'

# 3. Ajouter 2 biens dans la SCI 1
$spaceId1 = $sci1.space.id

Invoke-RestMethod -Uri "http://localhost:3000/api/spaces/$spaceId1/biens" `
  -Method POST -Headers $headers -ContentType "application/json" `
  -Body '{
    "adresse": "15 Avenue des Champs-Élysées",
    "ville": "Paris",
    "codePostal": "75008",
    "type": "APPARTEMENT",
    "surface": 85,
    "nbPieces": 3,
    "prixAchat": 450000,
    "dateAchat": "2023-06-15"
  }'

Invoke-RestMethod -Uri "http://localhost:3000/api/spaces/$spaceId1/biens" `
  -Method POST -Headers $headers -ContentType "application/json" `
  -Body '{
    "adresse": "28 Rue de Rivoli",
    "ville": "Paris",
    "codePostal": "75004",
    "type": "BUREAU",
    "surface": 120,
    "prixAchat": 380000,
    "dateAchat": "2023-09-20"
  }'

# 4. Vérifier
Invoke-RestMethod -Uri "http://localhost:3000/api/spaces" -Headers $headers
Invoke-RestMethod -Uri "http://localhost:3000/api/spaces/$spaceId1/biens" -Headers $headers
```

---

## 🎯 Prochaines Étapes

Une fois le backend validé :

1. **Frontend** :
   - Adapter les appels API pour utiliser `/api/spaces/:spaceId/*`
   - Créer le composant SpaceSwitcher
   - Mettre à jour les routes React

2. **Fonctionnalités** :
   - Système d'invitations
   - Gestion des membres
   - Onboarding

3. **Migration complète** :
   - Adapter toutes les routes au format Space
   - Supprimer les anciennes routes
   - Nettoyer le code

---

## 📞 Aide Rapide

```powershell
# Voir les logs du serveur
npm run dev

# Réinitialiser la DB
Copy-Item prisma\dev.db.backup prisma\dev.db -Force
npx prisma generate

# Voir la structure
npx prisma studio
```

**Le backend Space est prêt ! 🎉**
