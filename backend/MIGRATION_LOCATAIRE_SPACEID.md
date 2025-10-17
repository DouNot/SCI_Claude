# 🔧 MIGRATION - Ajout spaceId aux Locataires

**Date :** 16 octobre 2025  
**Objectif :** Corriger le problème des locataires créés qui n'apparaissent pas dans la liste

---

## 🐛 **PROBLÈME IDENTIFIÉ**

Les locataires créés depuis la page Locataires **n'apparaissent pas** dans la liste car :

1. Le modèle `Locataire` n'avait pas de champ `spaceId` direct
2. Le `getAllLocataires` filtrait uniquement sur :
   - Locataires avec un `bienId` assigné
   - OU locataires avec des baux existants
3. Les locataires "orphelins" (sans bien ni bail) étaient invisibles

---

## ✅ **SOLUTION**

Ajouter un champ `spaceId` au modèle `Locataire` pour pouvoir récupérer **tous** les locataires d'un Space, qu'ils aient ou non un bien assigné.

---

## 📋 **ÉTAPES DE MIGRATION**

### **Étape 1 : Arrêter le serveur backend**

```bash
cd backend
# Ctrl+C dans le terminal du serveur
```

---

### **Étape 2 : Appliquer la migration du schéma Prisma**

Le schéma Prisma a déjà été modifié. Il faut maintenant appliquer les changements à la base de données.

```bash
cd backend
npx prisma migrate dev --name add_spaceid_to_locataires
```

**Cette commande va :**
- Créer une nouvelle migration
- Ajouter la colonne `space_id` à la table `locataires`
- Créer l'index
- Régénérer le client Prisma

---

### **Étape 3 : Migrer les locataires existants**

Il faut assigner un `spaceId` aux locataires existants.

```bash
cd backend
node migrate-locataires-spaceid.js
```

**Ce script va :**
- Trouver tous les locataires sans `spaceId`
- Les assigner au Space via leur `bienId` ou leurs baux
- Afficher un résumé de la migration

**Résultat attendu :**
```
🔄 Migration des locataires - Ajout du spaceId

📊 X locataires sans spaceId trouvés

✅ Locataire abc123... → Space def456...
✅ Locataire 789xyz... → Space def456...

📊 Résumé:
   ✅ Migrés: X
   ❌ Erreurs: 0
   📦 Total: X

✅ Migration terminée avec succès !
```

---

### **Étape 4 : Vérifier la migration (optionnel)**

```bash
cd backend
npx prisma studio
```

Dans Prisma Studio :
1. Ouvrir la table `locataires`
2. Vérifier que tous les locataires ont un `space_id`

---

### **Étape 5 : Redémarrer le serveur**

```bash
cd backend
npm start
```

---

### **Étape 6 : Tester la création de locataire**

1. Aller sur `/locataires`
2. Cliquer "Ajouter un locataire"
3. Remplir le formulaire (au minimum nom, prénom, email)
4. Valider

**Observer la console backend :**
```
📝 Création locataire - spaceId: 06654355...
📝 Données reçues: {...}
📝 Données nettoyées: {...}
✅ Locataire créé: abc123...
```

**Observer la console frontend :**
```
📝 Création d'un locataire: {...}
📤 POST /locataires [spaceId: 06654355...]
✅ Locataire créé: {...}
```

**Vérifier que le locataire apparaît dans la liste !**

---

## 🔍 **CE QUI A ÉTÉ MODIFIÉ**

### 1. **Schema Prisma** (`backend/prisma/schema.prisma`)

**Avant :**
```prisma
model Locataire {
  id             String    @id @default(uuid())
  // ... autres champs
  bienId         String?   @map("bien_id")
  // PAS DE spaceId
}
```

**Après :**
```prisma
model Locataire {
  id             String    @id @default(uuid())
  // ... autres champs
  spaceId        String    @map("space_id") // ✅ NOUVEAU
  bienId         String?   @map("bien_id")
  
  // Relations
  space          Space     @relation(fields: [spaceId], references: [id], onDelete: Cascade) // ✅ NOUVEAU
  
  @@index([spaceId]) // ✅ NOUVEAU
}
```

---

### 2. **Controller** (`backend/src/controllers/locataireController.js`)

**Avant :**
```javascript
exports.getAllLocataires = asyncHandler(async (req, res) => {
  const locataires = await prisma.locataire.findMany({
    where: {
      OR: [
        { bien: { spaceId: spaceId } },
        { baux: { some: { bien: { spaceId: spaceId } } } }
      ]
    },
  });
});
```

**Après :**
```javascript
exports.getAllLocataires = asyncHandler(async (req, res) => {
  // Beaucoup plus simple !
  const locataires = await prisma.locataire.findMany({
    where: {
      spaceId: spaceId // ✅ Filtre direct sur spaceId
    },
  });
});
```

**Création de locataire :**
```javascript
exports.createLocataire = asyncHandler(async (req, res) => {
  // ...
  dataToCreate.spaceId = spaceId; // ✅ Ajout du spaceId
  
  const locataire = await prisma.locataire.create({
    data: dataToCreate,
  });
});
```

---

## 📊 **AVANTAGES**

✅ **Simplicité** : Requêtes plus simples et plus rapides  
✅ **Fiabilité** : Tous les locataires d'un Space sont récupérés  
✅ **Performance** : Index sur `spaceId` pour des requêtes rapides  
✅ **Cohérence** : Même pattern que les autres modèles (Bien, Contact, etc.)

---

## ⚠️ **SI LA MIGRATION ÉCHOUE**

### Problème : Certains locataires n'ont pas de spaceId

**Solution 1 : Les assigner manuellement**
```sql
-- Dans Prisma Studio ou via SQL
UPDATE locataires 
SET space_id = '[votre-space-id]' 
WHERE space_id IS NULL;
```

**Solution 2 : Les supprimer**
```sql
-- Supprimer les locataires orphelins
DELETE FROM locataires WHERE space_id IS NULL;
```

---

### Problème : Erreur "column space_id already exists"

La colonne existe déjà mais Prisma ne la connaît pas encore.

**Solution :**
```bash
cd backend
npx prisma db pull  # Synchroniser le schéma avec la DB
npx prisma generate # Régénérer le client
```

---

### Problème : Erreur au démarrage du serveur

```
Error: Unknown argument `spaceId`. Did you mean `spaceId`?
```

**Solution :**
```bash
cd backend
npx prisma generate  # Régénérer le client Prisma
npm start
```

---

## 🧪 **TESTS À EFFECTUER**

### Test 1 : Créer un locataire sans bien
1. Aller sur `/locataires`
2. Cliquer "Ajouter un locataire"
3. Remplir uniquement : nom, prénom, email, type PARTICULIER
4. **Ne PAS assigner de bien**
5. Valider
6. **Vérifier que le locataire apparaît dans la liste** ✅

### Test 2 : Créer un locataire avec un bien
1. Créer un locataire et assigner un bien
2. Vérifier qu'il apparaît dans la liste ✅

### Test 3 : Filtrer les locataires
1. Créer plusieurs locataires
2. Filtrer par "Actifs" / "Anciens"
3. Vérifier que tous apparaissent correctement ✅

### Test 4 : Créer un bail
1. Aller sur un bien sans locataire
2. Créer un bail avec un nouveau locataire
3. Vérifier que le locataire apparaît dans `/locataires` ✅

---

## 📁 **FICHIERS CRÉÉS/MODIFIÉS**

1. ✅ `backend/prisma/schema.prisma` - Ajout `spaceId` au modèle Locataire
2. ✅ `backend/src/controllers/locataireController.js` - Utilisation du `spaceId`
3. ✅ `backend/prisma/migrations/add_spaceid_to_locataires.sql` - Migration SQL
4. ✅ `backend/migrate-locataires-spaceid.js` - Script de migration des données
5. ✅ `backend/MIGRATION_LOCATAIRE_SPACEID.md` - Ce fichier

---

## 🎯 **RÉSULTAT ATTENDU**

Après cette migration :
- ✅ Tous les locataires créés apparaissent dans la liste
- ✅ Les locataires sans bien sont visibles
- ✅ Les requêtes sont plus simples et plus rapides
- ✅ Cohérence avec les autres modèles (Bien, Contact, etc.)

---

## 🚀 **PROCHAINES ÉTAPES**

Une fois la migration réussie :
1. **Tester** la création/modification/suppression de locataires
2. **Vérifier** que les baux fonctionnent correctement
3. **Nettoyer** les logs de débogage si souhaité
4. **Passer** aux autres corrections/améliorations

---

**Besoin d'aide ?** Suivez les étapes dans l'ordre et vérifiez les logs à chaque étape !

---

**Dernière mise à jour :** 16 octobre 2025

✅ Prêt pour la migration !
