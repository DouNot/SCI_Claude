# 🚀 GUIDE D'APPLICATION - MIGRATION LOYERS

## ⚠️ IMPORTANT : À lire avant de commencer

Cette migration va :
- ✅ Supprimer les colonnes `loyerHC` et `charges` de la table `Bien`
- ✅ Calculer automatiquement le statut de tous les biens (Loué/Libre)
- ✅ Les loyers seront désormais affichés depuis les baux actifs

**Les données des baux ne seront PAS perdues** - seules les colonnes inutilisées du modèle Bien seront supprimées.

---

## 📋 ÉTAPE 1 : Vérifier que tous les fichiers sont modifiés

Avant d'appliquer la migration, vérifiez que vous avez bien tous ces fichiers modifiés :

### Frontend (5 fichiers)
- ✅ `frontend/src/components/BienForm.jsx`
- ✅ `frontend/src/pages/BienDetailPage.jsx`
- ✅ `frontend/src/components/BiensCard.jsx`
- ✅ `frontend/src/components/BiensTable.jsx`
- ✅ `frontend/src/pages/DashboardPage.jsx`

### Backend (3 fichiers)
- ✅ `backend/prisma/schema.prisma`
- ✅ `backend/src/controllers/bienController.js`
- ✅ `backend/src/controllers/bailController.js`

---

## 🗄️ ÉTAPE 2 : Appliquer la migration de base de données

### Option A : Migration automatique Prisma (RECOMMANDÉ)

```bash
# 1. Aller dans le dossier backend
cd backend

# 2. Créer et appliquer la migration
npx prisma migrate dev --name remove_loyer_from_bien

# 3. Si tout se passe bien, Prisma va :
#    - Détecter les changements dans schema.prisma
#    - Créer un fichier de migration SQL
#    - Appliquer la migration à la base de données
#    - Régénérer le client Prisma automatiquement

# 4. Vérifier que la migration est bien appliquée
npx prisma studio
# Ouvrir la table "Bien" et vérifier que loyerHC et charges n'existent plus
```

### Option B : Migration manuelle (si Option A échoue)

```bash
# 1. Aller dans le dossier backend
cd backend

# 2. Appliquer le script SQL manuel
sqlite3 prisma/dev.db < prisma/migrations/manual_remove_loyer_from_bien.sql

# 3. Régénérer le client Prisma
npx prisma generate

# 4. Marquer la migration comme appliquée dans Prisma
npx prisma migrate resolve --applied remove_loyer_from_bien
```

---

## 🔄 ÉTAPE 3 : Redémarrer les serveurs

### Backend
```bash
cd backend
npm run dev
```

Vous devriez voir :
```
✓ Serveur backend démarré sur http://localhost:3000
✓ Base de données connectée
```

### Frontend (dans un nouveau terminal)
```bash
cd frontend
npm run dev
```

Vous devriez voir :
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## ✅ ÉTAPE 4 : Vérifications post-migration

### Test 1 : Dashboard
1. ✅ Ouvrir la page Dashboard
2. ✅ Vérifier que les "Loyers mensuels" s'affichent correctement
3. ✅ Vérifier que le "Cash-flow annuel" est calculé

**Si les loyers n'apparaissent pas :**
- Vérifiez qu'il existe des baux ACTIFS dans votre base
- Ouvrez la console du navigateur (F12) et vérifiez les erreurs
- Vérifiez les logs du backend

### Test 2 : Liste des biens
1. ✅ Aller sur la page "Biens"
2. ✅ Vérifier que les biens avec bail actif affichent "Loué"
3. ✅ Vérifier que les biens sans bail affichent "Vacant"
4. ✅ Vérifier que le loyer s'affiche dans la vue tableau

**Si le statut est incorrect :**
- Vérifiez dans Prisma Studio que les baux ont bien le statut "ACTIF"
- Rechargez la page (Ctrl+R)

### Test 3 : Détails d'un bien loué
1. ✅ Cliquer sur un bien qui a un bail actif
2. ✅ Dans l'onglet "Général", vérifier que :
   - Le "Loyer actuel HC" s'affiche
   - Les "Charges actuelles" s'affichent
   - La section "Locataire actuel" apparaît avec toutes les infos

### Test 4 : Création d'un bien
1. ✅ Cliquer sur "Ajouter un bien"
2. ✅ Vérifier que le formulaire NE demande PAS :
   - Le loyer
   - Les charges
   - Le statut
3. ✅ Créer le bien
4. ✅ Vérifier qu'il apparaît avec le statut "Vacant"

### Test 5 : Création d'un bail
1. ✅ Aller sur la page "Locataires"
2. ✅ Créer un bail pour un bien vacant
3. ✅ Le formulaire doit demander le loyer et les charges
4. ✅ Après création, retourner sur "Biens"
5. ✅ Le bien doit maintenant afficher "Loué"

### Test 6 : Suppression d'un bail
1. ✅ Supprimer le bail créé au Test 5
2. ✅ Retourner sur "Biens"
3. ✅ Le bien doit redevenir "Vacant"

---

## 🐛 Résolution des problèmes

### Problème : "Erreur lors de la migration Prisma"

**Cause possible :** La base de données est verrouillée

**Solution :**
```bash
# 1. Arrêter tous les serveurs (backend et frontend)
# 2. Fermer Prisma Studio si ouvert
# 3. Relancer la migration
cd backend
npx prisma migrate dev --name remove_loyer_from_bien
```

### Problème : "loyerActuel is undefined" dans la console

**Cause :** Le backend ne retourne pas encore les bons champs

**Solution :**
```bash
# 1. Vérifier que bienController.js a bien été modifié
# 2. Redémarrer le serveur backend
cd backend
# Ctrl+C pour arrêter
npm run dev
```

### Problème : "Les loyers n'apparaissent pas dans le dashboard"

**Cause 1 :** Aucun bail actif dans la base

**Solution :** Créer au moins un bail avec le statut "ACTIF"

**Cause 2 :** Les données ne sont pas encore chargées

**Solution :** 
1. Ouvrir la console du navigateur (F12)
2. Vérifier l'onglet Network
3. Chercher la requête `GET /api/biens`
4. Vérifier que la réponse contient `loyerActuel`

### Problème : "Le statut des biens est incorrect"

**Solution :**
```bash
# Réappliquer le script SQL de mise à jour du statut
cd backend
sqlite3 prisma/dev.db
```
```sql
UPDATE "Bien" SET "statut" = 'LOUE'
WHERE "id" IN (
    SELECT DISTINCT "bienId" FROM "Bail" WHERE "statut" = 'ACTIF'
);

UPDATE "Bien" SET "statut" = 'LIBRE'
WHERE "id" NOT IN (
    SELECT DISTINCT "bienId" FROM "Bail" WHERE "statut" = 'ACTIF'
);
```

---

## 📊 Vérifier les données directement dans la base

Si vous voulez vérifier directement les données :

```bash
cd backend
npx prisma studio
```

Puis :
1. Ouvrir la table `Bien`
2. ✅ Vérifier que les colonnes `loyerHC` et `charges` n'existent plus
3. ✅ Vérifier que la colonne `statut` contient "LOUE" ou "LIBRE"

4. Ouvrir la table `Bail`
5. ✅ Vérifier que les colonnes `loyerHC` et `charges` existent et contiennent des valeurs

---

## 📞 Checklist finale

Avant de considérer la migration terminée, vérifiez que **TOUS** ces points sont OK :

- [ ] ✅ Migration Prisma appliquée sans erreur
- [ ] ✅ Client Prisma régénéré
- [ ] ✅ Backend redémarré
- [ ] ✅ Frontend redémarré
- [ ] ✅ Dashboard affiche les loyers
- [ ] ✅ Liste des biens affiche les bons statuts
- [ ] ✅ Détails d'un bien loué affichent le loyer actuel
- [ ] ✅ Création d'un bien ne demande plus le loyer
- [ ] ✅ Création d'un bail met le bien en "Loué"
- [ ] ✅ Suppression d'un bail met le bien en "Libre"

---

## 🎉 Félicitations !

Si tous les tests passent, la migration est **réussie** ! 

Votre application a maintenant :
- ✅ Une architecture cohérente
- ✅ Une seule source de vérité pour les loyers
- ✅ Un calcul automatique des statuts
- ✅ Aucune duplication de données

---

## 📚 Prochaines étapes possibles

Maintenant que l'architecture est propre, vous pouvez facilement ajouter :
- 📈 Historique des révisions de loyer
- 🔔 Alertes avant expiration des baux
- 📊 Graphiques d'évolution des loyers
- 💰 Simulation de rentabilité
- 📄 Génération automatique de quittances

---

**Besoin d'aide ?** Consultez les fichiers :
- `MIGRATION_INSTRUCTIONS.md` - Guide détaillé
- `RESUME_MODIFICATIONS.md` - Récapitulatif des changements
