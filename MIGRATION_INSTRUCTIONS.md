# 🔄 Instructions de Migration - Refonte de la gestion des loyers et du statut

## 📋 Vue d'ensemble des changements

Cette migration corrige plusieurs incohérences majeures dans la gestion des biens immobiliers :

1. **Le loyer appartient au bail, pas au bien** - Les champs `loyerHC` et `charges` ont été retirés du modèle `Bien`
2. **Le statut est calculé automatiquement** - Le statut d'un bien est déterminé par la présence d'un bail actif
3. **Affichage cohérent** - Le loyer et le locataire actuels sont affichés depuis le bail actif

## 🎯 Changements effectués

### ✅ **Frontend modifié**

#### 1. **BienForm.jsx** - Formulaire de création/édition de bien
- ❌ Retrait des champs `loyerHC` et `charges` 
- ❌ Retrait du sélecteur de statut (LIBRE/LOUÉ)
- ✅ Le statut sera calculé automatiquement côté backend

#### 2. **BienDetailPage.jsx** - Page de détail du bien
- ✅ Affichage du loyer et des charges depuis le bail actif (`bien.loyerActuel` et `bien.chargesActuelles`)
- ✅ Nouvelle section "Locataire actuel" dans l'onglet général
- ✅ Affichage des informations du locataire et du bail actif

#### 3. **BiensCard.jsx** - Carte de bien (vue grille)
- ✅ Utilisation de `bien.statut === 'LOUE'` au lieu de `bien.loyerHC > 0`
- ✅ Badge "Loué" / "Vacant" basé sur le statut calculé

#### 4. **BiensTable.jsx** - Tableau des biens (vue liste)
- ✅ Utilisation de `bien.loyerActuel` au lieu de `bien.loyerHC`
- ✅ Statut basé sur `bien.statut` ou `bien.bailActif`

### ✅ **Backend modifié**

#### 1. **schema.prisma** - Schéma de base de données
- ❌ Retrait des champs `loyerHC` et `charges` du modèle `Bien`
- ℹ️ Le champ `statut` reste mais est mis à jour automatiquement

#### 2. **bienController.js** - Controller des biens
- ✅ `getAllBiens()` : Calcul dynamique du statut et inclusion du bail actif
- ✅ `getBienById()` : Calcul dynamique du statut et inclusion du bail actif
- ✅ `createBien()` : Statut initialisé à "LIBRE"
- ✅ Ajout de champs calculés :
  - `bailActif` : Le bail actif du bien
  - `loyerActuel` : Le loyer du bail actif
  - `chargesActuelles` : Les charges du bail actif
  - `locataireActuel` : Le locataire du bail actif

#### 3. **bailController.js** - Controller des baux
- ✅ `createBail()` : Met à jour le statut du bien à "LOUÉ" si le bail est actif
- ✅ `updateBail()` : Met à jour le statut du bien selon l'état du bail
- ✅ `deleteBail()` : Met à jour le statut du bien à "LIBRE" si c'était le dernier bail actif

## 📦 Étapes pour appliquer la migration

### 1. Créer et appliquer la migration Prisma
```bash
cd backend
npx prisma migrate dev --name remove_loyer_from_bien_and_auto_status
```

### 2. Générer le client Prisma
```bash
npx prisma generate
```

### 3. Redémarrer les serveurs
```bash
# Backend
cd backend
npm run dev

# Frontend (dans un autre terminal)
cd frontend
npm run dev
```

## ⚠️ Impact sur les données existantes

### Données supprimées :
- ❌ Les colonnes `loyerHC` et `charges` de la table `Bien` seront supprimées
- ⚠️ Ces données existantes seront perdues (mais elles sont dans la table `Bail`)

### Données préservées :
- ✅ Tous les loyers et charges dans la table `Bail` sont préservés
- ✅ Le statut sera recalculé automatiquement lors de l'accès aux biens

## 🔍 Vérifications post-migration

Après la migration, vérifiez que :

### Frontend
- ✅ La création d'un bien ne demande plus de loyer ni de statut
- ✅ Les biens avec bail actif affichent "Loué" 
- ✅ Les biens sans bail affichent "Vacant"
- ✅ Le loyer actuel s'affiche dans les détails du bien (depuis le bail)
- ✅ Le locataire actuel s'affiche dans l'onglet général
- ✅ Les cartes et le tableau affichent le bon statut

### Backend
- ✅ `GET /api/biens` retourne le statut calculé et le bail actif
- ✅ `GET /api/biens/:id` retourne les infos du bail et du locataire actuels
- ✅ `POST /api/baux` met à jour le statut du bien à "LOUÉ"
- ✅ `PUT /api/baux/:id` met à jour le statut du bien selon l'état
- ✅ `DELETE /api/baux/:id` met à jour le statut du bien à "LIBRE"

## 🎯 Avantages de cette refonte

### Architecture
1. **Logique métier correcte** : Le loyer appartient au bail, pas au bien
2. **Source unique de vérité** : Le loyer vient toujours du bail actif
3. **Cohérence garantie** : Le statut est calculé automatiquement, pas de désynchronisation possible

### Fonctionnalités
1. **Historique des loyers** : Un bien peut avoir plusieurs baux avec des loyers différents
2. **Pas de duplication** : Fini les incohérences entre le loyer du bien et celui du bail
3. **Évolutivité** : Facilite l'ajout de fonctionnalités comme les révisions de loyer

### Expérience utilisateur
1. **Simplicité** : Moins de champs à remplir lors de la création d'un bien
2. **Clarté** : Le statut reflète la réalité (bail actif = loué)
3. **Transparence** : Les informations du locataire et du loyer sont toujours visibles

## 🐛 Résolution des problèmes courants

### "Le statut n'est pas mis à jour après création d'un bail"
- Vérifiez que le bail a bien le statut "ACTIF"
- Rechargez la page des biens pour voir le statut mis à jour

### "Le loyer n'apparaît pas dans les détails du bien"
- Vérifiez qu'un bail actif existe pour ce bien
- Vérifiez que le bail a bien un `loyerHC` défini

### "Erreur lors de la migration Prisma"
- Vérifiez que la base de données est accessible
- Assurez-vous qu'aucune autre application n'utilise la base
- Si nécessaire, sauvegardez et recréez la base de données

## 📚 Structure de données après migration

### Modèle Bien (simplifié)
```javascript
{
  id: "uuid",
  adresse: "string",
  type: "string",
  surface: "float",
  prixAchat: "float",
  dateAchat: "date",
  statut: "string", // Calculé automatiquement
  // Plus de loyerHC ni charges ici !
  
  // Champs calculés côté backend
  bailActif: { ... },
  loyerActuel: "float",
  chargesActuelles: "float",
  locataireActuel: { ... }
}
```

### Modèle Bail
```javascript
{
  id: "uuid",
  typeBail: "string",
  dateDebut: "date",
  loyerHC: "float", // Source de vérité pour le loyer
  charges: "float", // Source de vérité pour les charges
  statut: "string",
  bienId: "uuid",
  locataireId: "uuid"
}
```

## ✨ Conclusion

Cette migration améliore considérablement l'architecture de l'application en :
- Éliminant les duplications de données
- Automatisant la logique métier
- Garantissant la cohérence des informations
- Facilitant les évolutions futures

Le loyer et le statut d'un bien reflètent désormais la réalité de sa location !
