# 🗂️ Nouvelles Routes API - Modèle Space

## 📋 Table des Matières

1. [Authentification](#authentification)
2. [Spaces (SCI)](#spaces-sci)
3. [Membres](#membres)
4. [Associés](#associés)
5. [Invitations](#invitations)
6. [Biens](#biens)

---

## 🔐 Authentification

### POST `/api/auth/signup`
Créer un nouveau compte utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "motdepasse123",
  "nom": "Dupont",
  "prenom": "Jean"
}
```

**Response 201:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "nom": "Dupont",
    "prenom": "Jean"
  }
}
```

**Actions automatiques :**
- Crée un espace personnel
- Ajoute l'utilisateur comme OWNER
- Met à jour `lastSpaceId`

---

### POST `/api/auth/login`
Se connecter.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "nom": "Dupont",
    "prenom": "Jean",
    "lastSpaceId": "uuid-du-dernier-space"
  }
}
```

---

### GET `/api/auth/me`
Récupérer les infos de l'utilisateur connecté.

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "nom": "Dupont",
  "prenom": "Jean",
  "lastSpaceId": "uuid",
  "emailVerified": false
}
```

---

## 🏢 Spaces (SCI)

### GET `/api/spaces`
Liste tous les espaces accessibles par l'utilisateur.

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
[
  {
    "id": "uuid-1",
    "type": "PERSONAL",
    "nom": "Espace Personnel",
    "slug": "personal-uuid",
    "statut": "ACTIVE",
    "myRole": "OWNER",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  },
  {
    "id": "uuid-2",
    "type": "SCI",
    "nom": "SCI Immobilier Paris",
    "slug": "sci-immobilier-paris",
    "siret": "12345678901234",
    "capitalSocial": 5000,
    "regimeFiscal": "IR",
    "dateCloture": "31/12",
    "statut": "ACTIVE",
    "myRole": "OWNER",
    "createdAt": "2024-02-01T14:30:00Z",
    "updatedAt": "2024-02-01T14:30:00Z"
  }
]
```

---

### POST `/api/spaces`
Créer une nouvelle SCI.

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "nom": "SCI Immobilier Lyon",
  "siret": "98765432109876",
  "capitalSocial": 10000,
  "dateCloture": "31/12",
  "regimeFiscal": "IS",
  "dateCreation": "2024-01-01",
  "adresse": "123 Rue de la République, 69001 Lyon",
  "objetSocial": "Acquisition et gestion de biens immobiliers"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "type": "SCI",
  "nom": "SCI Immobilier Lyon",
  "slug": "sci-immobilier-lyon",
  "siret": "98765432109876",
  "capitalSocial": 10000,
  "statut": "DRAFT",
  "createdAt": "2024-03-10T09:15:00Z",
  "updatedAt": "2024-03-10T09:15:00Z"
}
```

**Actions automatiques :**
- Crée un SpaceMember OWNER pour l'utilisateur
- Met à jour `lastSpaceId`

---

### GET `/api/spaces/:spaceId`
Détails complets d'un espace.

**Headers:**
```
Authorization: Bearer {token}
```

**Permissions:** Accès au Space requis (n'importe quel rôle)

**Response 200:**
```json
{
  "id": "uuid",
  "type": "SCI",
  "nom": "SCI Immobilier Paris",
  "slug": "sci-immobilier-paris",
  "siret": "12345678901234",
  "capitalSocial": 5000,
  "regimeFiscal": "IR",
  "statut": "ACTIVE",
  "myRole": "OWNER",
  "members": [
    {
      "id": "member-uuid-1",
      "role": "OWNER",
      "statut": "ACTIVE",
      "user": {
        "id": "user-uuid-1",
        "email": "owner@example.com",
        "nom": "Dupont",
        "prenom": "Jean"
      }
    },
    {
      "id": "member-uuid-2",
      "role": "MEMBER",
      "statut": "ACTIVE",
      "user": {
        "id": "user-uuid-2",
        "email": "member@example.com",
        "nom": "Martin",
        "prenom": "Marie"
      }
    }
  ],
  "associes": [
    {
      "id": "associe-uuid-1",
      "nom": "Dupont",
      "prenom": "Jean",
      "pourcentage": 50,
      "nombreParts": 500,
      "statut": "ACTIF"
    },
    {
      "id": "associe-uuid-2",
      "nom": "Martin",
      "prenom": "Marie",
      "pourcentage": 30,
      "nombreParts": 300,
      "statut": "ACTIF"
    }
  ]
}
```

---

### PATCH `/api/spaces/:spaceId`
Modifier un espace.

**Headers:**
```
Authorization: Bearer {token}
```

**Permissions:** OWNER uniquement

**Body:**
```json
{
  "nom": "SCI Immobilier Paris Centre",
  "capitalSocial": 8000,
  "statut": "ACTIVE"
}
```

**Response 200:**
```json
{
  "id": "uuid",
  "nom": "SCI Immobilier Paris Centre",
  "capitalSocial": 8000,
  "statut": "ACTIVE",
  "updatedAt": "2024-03-10T10:30:00Z"
}
```

---

### PATCH `/api/spaces/:spaceId/switch`
Changer l'espace actif (met à jour `lastSpaceId`).

**Headers:**
```
Authorization: Bearer {token}
```

**Permissions:** Accès au Space requis

**Response 200:**
```json
{
  "success": true
}
```

---

## 👥 Membres

### GET `/api/spaces/:spaceId/members`
Liste tous les membres d'un espace.

**Headers:**
```
Authorization: Bearer {token}
```

**Permissions:** MEMBER minimum

**Response 200:**
```json
[
  {
    "id": "member-uuid-1",
    "role": "OWNER",
    "statut": "ACTIVE",
    "createdAt": "2024-01-15T10:00:00Z",
    "user": {
      "id": "user-uuid-1",
      "email": "owner@example.com",
      "nom": "Dupont",
      "prenom": "Jean"
    }
  },
  {
    "id": "member-uuid-2",
    "role": "COMPTABLE",
    "statut": "ACTIVE",
    "createdAt": "2024-02-01T14:00:00Z",
    "user": {
      "id": "user-uuid-2",
      "email": "compta@cabinet.fr",
      "nom": "Durand",
      "prenom": "Sophie"
    }
  },
  {
    "id": "member-uuid-3",
    "role": "MEMBER",
    "statut": "PENDING",
    "invitationSentAt": "2024-03-10T09:00:00Z",
    "user": {
      "id": "user-uuid-3",
      "email": "invited@example.com",
      "nom": "Bernard",
      "prenom": "Luc"
    }
  }
]
```

---

### POST `/api/spaces/:spaceId/members/invite`
Inviter un nouveau membre.

**Headers:**
```
Authorization: Bearer {token}
```

**Permissions:** MANAGER minimum

**Body:**
```json
{
  "email": "nouveau@example.com",
  "role": "MEMBER"
}
```

**Rôles possibles :** `MANAGER`, `MEMBER`, `VIEWER`, `COMPTABLE`

**Response 201:**
```json
{
  "id": "member-uuid",
  "invitationToken": "abc123xyz789",
  "invitationLink": "https://app.com/invite/abc123xyz789",
  "message": "Invitation envoyée par email"
}
```

**Actions automatiques :**
- Crée un SpaceMember avec statut PENDING
- Génère un token d'invitation unique
- Envoie un email d'invitation

---

### PATCH `/api/spaces/:spaceId/members/:memberId`
Modifier le rôle d'un membre.

**Headers:**
```
Authorization: Bearer {token}
```

**Permissions:** OWNER uniquement

**Body:**
```json
{
  "role": "MANAGER"
}
```

**Response 200:**
```json
{
  "id": "member-uuid",
  "role": "MANAGER",
  "updatedAt": "2024-03-10T11:00:00Z"
}
```

---

### DELETE `/api/spaces/:spaceId/members/:memberId`
Retirer un membre d'un espace.

**Headers:**
```
Authorization: Bearer {token}
```

**Permissions:** OWNER uniquement

**Response 200:**
```json
{
  "message": "Membre retiré avec succès"
}
```

**Note :** On ne peut pas retirer le dernier OWNER.

---

## 💼 Associés

### GET `/api/spaces/:spaceId/associes`
Liste tous les associés (cap table).

**Headers:**
```
Authorization: Bearer {token}
```

**Permissions:** MEMBER minimum

**Response 200:**
```json
[
  {
    "id": "associe-uuid-1",
    "userId": "user-uuid-1",
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "type": "PERSONNE_PHYSIQUE",
    "nombreParts": 500,
    "pourcentage": 50,
    "valeurNominale": 10,
    "soldeCCA": 0,
    "statut": "ACTIF",
    "dateEntree": "2024-01-01",
    "user": {
      "id": "user-uuid-1",
      "email": "jean.dupont@example.com",
      "nom": "Dupont",
      "prenom": "Jean"
    }
  },
  {
    "id": "associe-uuid-2",
    "userId": null,
    "nom": "Martin",
    "prenom": "Marie",
    "email": "marie.martin@example.com",
    "type": "PERSONNE_PHYSIQUE",
    "nombreParts": 300,
    "pourcentage": 30,
    "soldeCCA": 5000,
    "statut": "ACTIF",
    "dateEntree": "2024-01-01"
  }
]
```

---

### POST `/api/spaces/:spaceId/associes`
Ajouter un associé.

**Headers:**
```
Authorization: Bearer {token}
```

**Permissions:** MANAGER minimum

**Body:**
```json
{
  "nom": "Bernard",
  "prenom": "Luc",
  "email": "luc.bernard@example.com",
  "telephone": "0612345678",
  "type": "PERSONNE_PHYSIQUE",
  "nombreParts": 200,
  "valeurNominale": 10,
  "dateEntree": "2024-03-01"
}
```

**Response 201:**
```json
{
  "id": "associe-uuid",
  "nom": "Bernard",
  "prenom": "Luc",
  "nombreParts": 200,
  "pourcentage": 20,
  "statut": "ACTIF",
  "createdAt": "2024-03-10T12:00:00Z"
}
```

**Validation :**
- Le total des parts ne doit pas dépasser le capital social

---

### PATCH `/api/spaces/:spaceId/associes/:associeId`
Modifier un associé.

**Headers:**
```
Authorization: Bearer {token}
```

**Permissions:** OWNER uniquement

**Body:**
```json
{
  "nombreParts": 250,
  "soldeCCA": 10000
}
```

**Response 200:**
```json
{
  "id": "associe-uuid",
  "nombreParts": 250,
  "pourcentage": 25,
  "soldeCCA": 10000,
  "updatedAt": "2024-03-10T13:00:00Z"
}
```

---

### DELETE `/api/spaces/:spaceId/associes/:associeId`
Marquer un associé comme sorti (soft delete).

**Headers:**
```
Authorization: Bearer {token}
```

**Permissions:** OWNER uniquement

**Response 200:**
```json
{
  "message": "Associé marqué comme sorti",
  "dateSortie": "2024-03-10"
}
```

**Note :** Modifie le statut à "SORTI" et ajoute une `dateSortie`.

---

## ✉️ Invitations

### GET `/api/invitations/:token`
Détails d'une invitation (page publique).

**Aucune authentification requise**

**Response 200:**
```json
{
  "id": "invitation-uuid",
  "space": {
    "id": "space-uuid",
    "nom": "SCI Immobilier Paris",
    "type": "SCI"
  },
  "role": "MEMBER",
  "invitedBy": {
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com"
  },
  "invitationSentAt": "2024-03-10T09:00:00Z"
}
```

**Response 404:** Si le token est invalide ou expiré

---

### POST `/api/invitations/:token/accept`
Accepter une invitation.

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "message": "Invitation acceptée",
  "space": {
    "id": "space-uuid",
    "nom": "SCI Immobilier Paris"
  },
  "redirectTo": "/spaces/space-uuid"
}
```

**Actions automatiques :**
- Met à jour le statut du SpaceMember à ACTIVE
- Enregistre `invitationAcceptedAt`
- Met à jour `lastSpaceId` de l'utilisateur

---

### POST `/api/invitations/:token/decline`
Refuser une invitation.

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "message": "Invitation refusée"
}
```

**Actions automatiques :**
- Supprime le SpaceMember

---

## 🏠 Biens (Exemples adaptés au modèle Space)

### GET `/api/spaces/:spaceId/biens`
Liste tous les biens d'un espace.

**Headers:**
```
Authorization: Bearer {token}
```

**Permissions:** VIEWER minimum

**Response 200:**
```json
[
  {
    "id": "bien-uuid-1",
    "adresse": "123 Rue de la République",
    "ville": "Lyon",
    "codePostal": "69001",
    "type": "APPARTEMENT",
    "surface": 75,
    "prixAchat": 250000,
    "valeurActuelle": 280000,
    "statut": "LOUE"
  }
]
```

---

### POST `/api/spaces/:spaceId/biens`
Créer un nouveau bien.

**Headers:**
```
Authorization: Bearer {token}
```

**Permissions:** MEMBER minimum

**Body:**
```json
{
  "adresse": "456 Avenue des Champs",
  "ville": "Paris",
  "codePostal": "75008",
  "type": "APPARTEMENT",
  "surface": 85,
  "nbPieces": 3,
  "prixAchat": 450000,
  "dateAchat": "2024-01-15"
}
```

**Response 201:**
```json
{
  "id": "bien-uuid",
  "adresse": "456 Avenue des Champs",
  "spaceId": "space-uuid",
  "createdAt": "2024-03-10T14:00:00Z"
}
```

---

## 🔐 Matrice des Permissions

| Action | OWNER | MANAGER | MEMBER | VIEWER | COMPTABLE |
|--------|-------|---------|--------|--------|-----------|
| Voir les données | ✅ | ✅ | ✅ | ✅ | ✅ |
| Créer/Modifier biens | ✅ | ✅ | ✅ | ❌ | ❌ |
| Supprimer biens | ✅ | ✅ | ✅ | ❌ | ❌ |
| Inviter membres | ✅ | ✅ | ❌ | ❌ | ❌ |
| Changer rôles | ✅ | ❌ | ❌ | ❌ | ❌ |
| Retirer membres | ✅ | ❌ | ❌ | ❌ | ❌ |
| Gérer associés | ✅ | ✅ | ❌ | ❌ | ❌ |
| Modifier SCI | ✅ | ❌ | ❌ | ❌ | ❌ |
| Supprimer SCI | ✅ | ❌ | ❌ | ❌ | ❌ |
| Accès comptabilité | ✅ | ✅ | ✅ | ❌ | ✅ |
| Modifier comptabilité | ✅ | ✅ | ✅ | ❌ | ✅ |

---

## 📝 Notes Importantes

1. **Toutes les routes nécessitent le token JWT** sauf `/api/invitations/:token`
2. **Le spaceId doit toujours être vérifié** dans le middleware
3. **Les permissions sont vérifiées à chaque requête** via le middleware
4. **Les données sont isolées par Space** - impossible d'accéder aux données d'un autre Space
5. **Le lastSpaceId est mis à jour automatiquement** lors du switch ou de la création

---

## 🚀 Utilisation Côté Frontend

```javascript
// Récupérer le Space actif
const currentSpace = useAuthStore(state => state.currentSpace);

// Faire une requête
const response = await fetch(`/api/spaces/${currentSpace.id}/biens`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

**Vous avez maintenant toutes les routes nécessaires pour votre application Space-based ! 🎉**
