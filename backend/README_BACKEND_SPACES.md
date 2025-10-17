# 🚀 Backend - Nouveau Modèle Space

## ✅ Fichiers Créés

### Middleware
- ✅ `src/middleware/auth.js` - Authentification JWT
- ✅ `src/middleware/spaceAccess.js` - Vérification accès aux Spaces

### Routes
- ✅ `src/routes/auth.js` - Signup, Login, Profile
- ✅ `src/routes/spaces.js` - CRUD Spaces (SCI)
- ✅ `src/routes/members.js` - Gestion membres
- ✅ `src/routes/invitations.js` - Système d'invitations

### Serveur
- ✅ `server-spaces.js` - Nouveau serveur avec toutes les routes

---

## 🎯 Démarrage

### Option 1 : Utiliser le Nouveau Serveur (Recommandé)

```bash
# Lancer avec le nouveau serveur
node server-spaces.js
```

### Option 2 : Modifier package.json

```json
{
  "scripts": {
    "dev": "nodemon server-spaces.js",
    "start": "node server-spaces.js"
  }
}
```

Puis :
```bash
npm run dev
```

---

## 🧪 Tester les Routes

### 1. Créer un Compte

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "nom": "Dupont",
    "prenom": "Jean"
  }'
```

**Réponse :**
```json
{
  "message": "Compte créé avec succès",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "nom": "Dupont",
    "prenom": "Jean",
    "lastSpaceId": "uuid-espace-personnel"
  }
}
```

### 2. Se Connecter

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Lister Mes Spaces

```bash
curl -X GET http://localhost:3000/api/spaces \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse :**
```json
[
  {
    "id": "uuid",
    "type": "PERSONAL",
    "nom": "Espace Personnel",
    "slug": "personal-uuid",
    "statut": "ACTIVE",
    "myRole": "OWNER",
    "nbBiens": 0,
    "nbAssocies": 0
  }
]
```

### 4. Créer une SCI

```bash
curl -X POST http://localhost:3000/api/spaces \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "SCI Immobilier Paris",
    "siret": "12345678901234",
    "capitalSocial": 5000,
    "dateCloture": "31/12",
    "regimeFiscal": "IR"
  }'
```

### 5. Inviter un Membre

```bash
curl -X POST http://localhost:3000/api/spaces/SPACE_ID/members/invite \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "membre@example.com",
    "role": "MEMBER"
  }'
```

---

## 📊 Variables d'Environnement

Créez ou mettez à jour `.env` :

```env
# Base de données
DATABASE_URL="file:./prisma/dev.db"

# JWT Secret (CHANGEZ EN PRODUCTION !)
JWT_SECRET="votre-secret-super-securise-a-changer"

# Port du serveur
PORT=3000

# URL du frontend (pour CORS et liens d'invitation)
FRONTEND_URL="http://localhost:5173"

# Node Environment
NODE_ENV="development"
```

---

## 🔐 Sécurité

### JWT Secret

**⚠️ IMPORTANT :** Changez le `JWT_SECRET` en production !

Générer un secret sécurisé :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### CORS

Le serveur accepte les requêtes depuis :
- `http://localhost:5173` (Vite dev server)
- Ajustez `FRONTEND_URL` selon votre besoin

---

## 📁 Structure des Routes

```
/api
├── /auth
│   ├── POST   /signup           # Créer compte
│   ├── POST   /login            # Se connecter
│   ├── GET    /me               # Mon profil
│   ├── PATCH  /me               # Mettre à jour profil
│   └── POST   /change-password  # Changer mot de passe
│
├── /spaces
│   ├── GET    /                 # Liste mes spaces
│   ├── POST   /                 # Créer une SCI
│   ├── GET    /:spaceId         # Détails space
│   ├── PATCH  /:spaceId         # Modifier space
│   ├── DELETE /:spaceId         # Archiver space
│   ├── PATCH  /:spaceId/switch  # Changer espace actif
│   │
│   ├── GET    /:spaceId/members            # Liste membres
│   ├── POST   /:spaceId/members/invite     # Inviter
│   ├── PATCH  /:spaceId/members/:memberId  # Modifier rôle
│   └── DELETE /:spaceId/members/:memberId  # Retirer membre
│
└── /invitations
    ├── GET    /:token          # Détails invitation
    ├── POST   /:token/accept   # Accepter
    ├── POST   /:token/decline  # Refuser
    └── POST   /:token/resend   # Renvoyer
```

---

## 🛠️ Développement

### Logs et Debug

Le serveur affiche des logs clairs :

```
========================================
🚀 Serveur démarré sur http://localhost:3000
📊 Environnement: development
========================================
✅ Nouvelles routes disponibles:
   - POST   /api/auth/signup
   - POST   /api/auth/login
   - GET    /api/spaces
   ...
========================================
```

### Prisma Studio

Pour visualiser la base de données :

```bash
npx prisma studio
```

### Hot Reload

Avec nodemon :

```bash
npm install -g nodemon
nodemon server-spaces.js
```

---

## 🧪 Tests avec Postman/Thunder Client

### Collection Postman

Importez cette collection pour tester rapidement :

```json
{
  "info": {
    "name": "SCI Claude - Space API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Signup",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/signup",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\",\n  \"nom\": \"Dupont\",\n  \"prenom\": \"Jean\"\n}"
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}"
            }
          }
        }
      ]
    }
  ]
}
```

---

## 🔄 Migration des Anciennes Routes

Les anciennes routes (`/api/biens`, `/api/locataires`, etc.) fonctionnent toujours !

Pour les migrer vers le nouveau système :

1. **Ajouter spaceId dans les routes**
   ```javascript
   // Avant
   GET /api/biens
   
   // Après
   GET /api/spaces/:spaceId/biens
   ```

2. **Ajouter les middleware**
   ```javascript
   router.get('/:spaceId/biens', 
     requireAuth, 
     requireSpaceAccess(),
     async (req, res) => { ... }
   );
   ```

3. **Filtrer par spaceId**
   ```javascript
   const biens = await prisma.bien.findMany({
     where: { spaceId: req.params.spaceId }
   });
   ```

---

## ❓ FAQ

### Q: Les anciennes routes fonctionnent-elles toujours ?
**R:** Oui ! Le nouveau serveur inclut toutes les anciennes routes pour compatibilité.

### Q: Comment basculer vers le nouveau système ?
**R:** Remplacez `server.js` par `server-spaces.js` dans package.json, ou renommez les fichiers.

### Q: Le JWT est-il sécurisé ?
**R:** Oui, mais **CHANGEZ le JWT_SECRET en production** !

### Q: Comment gérer les emails d'invitation ?
**R:** Les routes sont prêtes, il faut ajouter un service email (Resend, SendGrid, etc.)

### Q: Prisma fonctionne-t-il avec SQLite ?
**R:** Oui, parfait pour le développement. En production, passez à PostgreSQL.

---

## 📚 Documentation Complète

- `API_ROUTES_SPACE.md` - Documentation API détaillée
- `MIGRATION_GUIDE_WINDOWS.md` - Guide de migration
- `schema-new.prisma` - Nouveau schéma de base

---

## ✅ Checklist Backend

- [x] Middleware auth créé
- [x] Middleware spaceAccess créé
- [x] Routes auth (signup, login, me)
- [x] Routes spaces (CRUD)
- [x] Routes members (invitations)
- [x] Routes invitations (accept/decline)
- [x] Serveur configuré
- [ ] Service email (à ajouter)
- [ ] Tests unitaires (à ajouter)
- [ ] Documentation Swagger (optionnel)

---

**🎉 Votre backend est prêt ! Passez au frontend maintenant !**
