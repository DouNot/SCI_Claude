# 🔄 Guide de Migration : Ancien Modèle → Modèle Space

## 📋 Vue d'ensemble

Ce guide vous permet de migrer votre application existante vers le nouveau modèle **Space-based** que nous avons défini.

### Ancien Modèle
```
User → Compte → Biens
```

### Nouveau Modèle
```
User → Space (PERSONAL/SCI) → Membres + Associés → Biens
```

---

## ⚠️ IMPORTANT : Sauvegarde

**AVANT TOUTE CHOSE, faites une sauvegarde de votre base de données !**

```bash
# Sauvegarde SQLite
cp backend/prisma/dev.db backend/prisma/dev.db.backup

# Ou exportez tout
npx prisma db pull --schema=prisma/schema.prisma
```

---

## 🚀 Étapes de Migration

### Étape 1 : Préparer le nouveau schéma

```bash
cd backend

# 1. Sauvegarder l'ancien schéma
cp prisma/schema.prisma prisma/schema-old.prisma

# 2. Remplacer par le nouveau schéma
cp prisma/schema-new.prisma prisma/schema.prisma

# 3. Générer le nouveau client Prisma
npx prisma generate
```

### Étape 2 : Créer les nouvelles tables

```bash
# Appliquer les changements à la base de données
npx prisma db push

# ⚠️ ATTENTION : Cela va créer les nouvelles tables
# mais ne supprimera PAS les anciennes automatiquement
```

### Étape 3 : Exécuter le script de migration

```bash
# Installer les dépendances si besoin
npm install bcryptjs

# Exécuter le script de migration
node scripts/migrate-to-spaces.js
```

**Ce script va :**
1. ✅ Créer un espace personnel pour chaque utilisateur
2. ✅ Transformer chaque `Compte` en `Space` de type SCI
3. ✅ Créer les `SpaceMember` pour donner accès
4. ✅ Migrer les associés
5. ✅ Migrer les biens vers les nouveaux Spaces
6. ✅ Migrer contacts, notifications, AG

### Étape 4 : Vérifier la migration

```bash
# Ouvrir Prisma Studio pour vérifier
npx prisma studio
```

**Vérifications à faire :**
- [ ] Tous les utilisateurs ont un espace personnel
- [ ] Chaque ancien `Compte` a un `Space` correspondant
- [ ] Tous les biens sont liés aux bons Spaces
- [ ] Les SpaceMembers sont créés (OWNER pour chaque créateur)
- [ ] Les associés sont migrés avec les bons pourcentages

### Étape 5 : Mettre à jour le code backend

Plusieurs fichiers doivent être mis à jour pour utiliser le nouveau modèle.

#### 5.1 Middleware Auth (déjà fourni)

Créez le fichier `backend/src/middleware/auth.js` avec le code fourni dans le guide d'implémentation.

#### 5.2 Middleware SpaceAccess (déjà fourni)

Créez le fichier `backend/src/middleware/spaceAccess.js` avec le code fourni.

#### 5.3 Routes à mettre à jour

Vous devrez mettre à jour vos routes existantes pour :
- Remplacer `compteId` par `spaceId`
- Ajouter le middleware `requireSpaceAccess`
- Vérifier les permissions avec les rôles

**Exemple :**

**Avant :**
```javascript
router.get('/biens/:bienId', requireAuth, async (req, res) => {
  const bien = await prisma.bien.findUnique({
    where: { id: req.params.bienId }
  });
  res.json(bien);
});
```

**Après :**
```javascript
router.get('/spaces/:spaceId/biens/:bienId', 
  requireAuth, 
  requireSpaceAccess(), // Vérifie l'accès au Space
  async (req, res) => {
    const bien = await prisma.bien.findUnique({
      where: { 
        id: req.params.bienId,
        spaceId: req.params.spaceId // Sécurité : vérifier que le bien appartient au Space
      }
    });
    
    if (!bien) {
      return res.status(404).json({ error: 'Bien non trouvé' });
    }
    
    res.json(bien);
  }
);
```

### Étape 6 : Mettre à jour le frontend

#### 6.1 Ajouter le SpaceSwitcher

Ajoutez le composant `SpaceSwitcher` dans votre layout principal (code fourni dans le guide).

#### 6.2 Mettre à jour les routes

**Avant :**
```
/dashboard
/biens
/biens/:id
```

**Après :**
```
/spaces/:spaceId/dashboard
/spaces/:spaceId/biens
/spaces/:spaceId/biens/:id
```

#### 6.3 Adapter les appels API

**Avant :**
```javascript
const biens = await fetch('/api/biens');
```

**Après :**
```javascript
const currentSpaceId = useAuthStore(state => state.currentSpace?.id);
const biens = await fetch(`/api/spaces/${currentSpaceId}/biens`);
```

### Étape 7 : Tester l'application

1. **Connexion** : Les utilisateurs existants peuvent se connecter avec leurs identifiants
2. **Navigation** : Le switcher d'espaces doit afficher :
   - L'espace personnel
   - Les SCI (anciens Comptes)
3. **Données** : Toutes les données (biens, baux, etc.) doivent être accessibles
4. **Permissions** : Les utilisateurs doivent avoir le rôle OWNER sur leurs SCI

---

## 🔧 Migration Progressive (Alternative)

Si vous préférez une **migration progressive** sans tout casser :

### Option 1 : Dual Mode
Garder l'ancien système et ajouter le nouveau en parallèle.

```javascript
// Dans vos routes, supporter les deux formats temporairement
router.get(['/biens/:bienId', '/spaces/:spaceId/biens/:bienId'], ...)
```

### Option 2 : Feature Flag
Ajouter un flag pour activer/désactiver le nouveau système.

```javascript
const USE_SPACES = process.env.USE_SPACES === 'true';

if (USE_SPACES) {
  // Nouveau code avec Spaces
} else {
  // Ancien code avec Comptes
}
```

---

## 🐛 Problèmes Courants

### Erreur : "Table Compte not found"
**Solution :** Les anciennes tables sont conservées, mais le client Prisma ne les voit plus après `prisma generate`. C'est normal.

### Erreur : "Column compteId doesn't exist"
**Solution :** Vous devez mettre à jour tous les appels à `compteId` vers `spaceId` dans votre code.

### Les biens n'apparaissent plus
**Solution :** Vérifiez que le script de migration a bien lié les biens aux Spaces :
```sql
SELECT id, adresse, spaceId FROM Bien;
```

### Permissions refusées
**Solution :** Vérifiez que les SpaceMembers sont créés avec le bon rôle (OWNER).

---

## ✅ Checklist de Validation

Une fois la migration terminée, vérifiez :

- [ ] Tous les utilisateurs peuvent se connecter
- [ ] Le switcher d'espaces fonctionne
- [ ] Les biens sont visibles dans les bons Spaces
- [ ] Les baux et locataires sont accessibles
- [ ] Les factures sont liées aux bons biens
- [ ] Les documents et photos s'affichent correctement
- [ ] Les notifications fonctionnent
- [ ] Les assemblées générales sont accessibles

---

## 🗑️ Nettoyage Final

**Seulement après avoir validé que tout fonctionne !**

### Supprimer l'ancien modèle Compte

```prisma
// Dans schema.prisma, supprimer le modèle Compte
// model Compte { ... } ← À SUPPRIMER

// Puis :
npx prisma db push
```

### Supprimer les fichiers de sauvegarde

```bash
rm prisma/schema-old.prisma
rm prisma/dev.db.backup
```

---

## 📞 Besoin d'Aide ?

Si vous rencontrez des problèmes :

1. **Vérifiez les logs** du script de migration
2. **Consultez Prisma Studio** pour voir l'état des données
3. **Restaurez la sauvegarde** si nécessaire : `cp dev.db.backup dev.db`
4. **Testez étape par étape** plutôt que tout d'un coup

---

## 🎯 Prochaines Étapes

Une fois la migration validée :

1. **Système d'invitations** : Permettre d'inviter des membres
2. **Gestion des rôles** : MANAGER, MEMBER, COMPTABLE, VIEWER
3. **Onboarding** : Écran de bienvenue pour nouveaux utilisateurs
4. **Page création SCI** : Wizard en 3 étapes

**Vous êtes prêt à migrer ! 🚀**
