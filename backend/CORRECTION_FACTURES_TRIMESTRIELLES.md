# ✅ CORRECTION FACTURES TRIMESTRIELLES + ANTI-DOUBLON

## 🎯 Problèmes résolus

### 1. ✅ **Factures trimestrielles non sauvegardées**
**Avant** : Les factures trimestrielles généraient un PDF mais n'étaient PAS enregistrées en BDD
**Après** : Création de 3 entrées en BDD (une par mois du trimestre)

### 2. ✅ **Pas de protection anti-doublon**
**Avant** : Possibilité de générer plusieurs fois la même facture
**Après** : Vérification + message d'erreur clair

### 3. ✅ **Factures invisibles dans Documents**
**Avant** : Pas de moyen de retrouver les factures émises
**Après** : Nouvel endpoint pour lister toutes les factures

---

## 📝 Modifications apportées

### **1. Fichier : `quittanceController.js`**

#### **A. Sauvegarde des factures trimestrielles (NOUVELLE)**

```javascript
// Ligne 94-122 : CORRECTION MAJEURE
if (typePeriode === 'TRIMESTRIELLE') {
  // Calcul des 3 mois
  const mois1 = parseInt(mois);
  const mois2 = mois1 + 1 > 12 ? 1 : mois1 + 1;
  const mois3 = mois1 + 2 > 12 ? (mois1 + 2) - 12 : mois1 + 2;
  
  // ✅ VÉRIFICATION DOUBLON
  const quittancesExistantes = await prisma.quittance.findMany({
    where: {
      bailId,
      annee: parseInt(annee),
      mois: { in: [mois1, mois2, mois3] }
    }
  });
  
  if (quittancesExistantes.length > 0) {
    return res.status(409).json({
      success: false,
      error: 'QUITTANCES_ALREADY_EXIST',
      message: `Des factures existent déjà pour ce trimestre...`,
      data: {
        existingMonths: quittancesExistantes.map(q => q.mois),
        quittances: quittancesExistantes
      }
    });
  }
  
  // Génération du PDF...
  
  // ✅ SAUVEGARDE : Créer 3 entrées en BDD
  const quittancesData = [mois1, mois2, mois3].map(m => ({
    bailId,
    mois: m,
    annee: parseInt(annee),
    numeroQuittance: helpers.generateQuittanceNumber(bailId, m, annee),
    montantLoyer,
    montantCharges,
    montantTotal: montantLoyer + montantCharges,
    datePaiement: null,
    estPaye: false,
  }));
  
  await prisma.quittance.createMany({
    data: quittancesData
  });
}
```

#### **B. Protection anti-doublon pour factures mensuelles (AMÉLIORÉ)**

```javascript
// Ligne 139-157 : AMÉLIORATION
const quittanceExistante = await prisma.quittance.findFirst({
  where: {
    bailId,
    mois: parseInt(mois),
    annee: parseInt(annee),
  },
});

if (quittanceExistante) {
  return res.status(409).json({
    success: false,
    error: 'QUITTANCE_ALREADY_EXISTS',
    message: `Une facture existe déjà pour ${moisNom} ${annee}. Retrouvez-la dans la section Documents.`,
    data: {
      quittance: quittanceExistante,
      mois: parseInt(mois),
      annee: parseInt(annee)
    }
  });
}
```

#### **C. Nouvel endpoint pour lister les factures (NOUVEAU)**

```javascript
/**
 * @desc    Récupérer toutes les quittances/factures d'un space (pour Documents)
 * @route   GET /api/spaces/:spaceId/quittances
 * @access  Auth + Space (VIEWER minimum)
 */
exports.getQuittancesBySpace = asyncHandler(async (req, res) => {
  const { spaceId } = req.params;
  const { annee, bailId } = req.query;

  const where = {
    bail: {
      bien: {
        spaceId
      }
    }
  };

  if (annee) {
    where.annee = parseInt(annee);
  }

  if (bailId) {
    where.bailId = bailId;
  }

  const quittances = await prisma.quittance.findMany({
    where,
    include: {
      bail: {
        include: {
          bien: { select: { adresse: true, ville: true } },
          locataire: { select: { nom: true, prenom: true, raisonSociale: true, typeLocataire: true } }
        }
      }
    },
    orderBy: [{ annee: 'desc' }, { mois: 'desc' }],
  });

  res.status(200).json({
    success: true,
    count: quittances.length,
    data: quittances,
  });
});
```

### **2. Fichier : `quittanceRoutes.js`**

```javascript
// Ajout de 2 nouvelles routes

// Route pour lister toutes les factures d'un space (pour Documents)
router.get('/space/:spaceId', requireAuth, requireSpaceAccess, getQuittancesBySpace);

// Route pour marquer une facture comme payée
router.patch('/:id/payer', requireAuth, requireSpaceAccess, marquerPayee);
```

---

## 🔍 Fonctionnement détaillé

### **Cas 1 : Génération d'une facture mensuelle**

```bash
POST /api/spaces/:spaceId/quittances/generer
Body: {
  bailId: "xxx",
  mois: 1,
  annee: 2025,
  typePeriode: "MENSUELLE",
  typeDocument: "FACTURE"
}
```

**Comportement** :
1. ✅ Vérifier si une facture existe déjà pour Janvier 2025
2. ❌ Si OUI → Erreur 409 avec message : "Une facture existe déjà pour Janvier 2025"
3. ✅ Si NON → Génère le PDF + Sauvegarde 1 entrée en BDD

---

### **Cas 2 : Génération d'une facture trimestrielle**

```bash
POST /api/spaces/:spaceId/quittances/generer
Body: {
  bailId: "xxx",
  mois: 1,  # Premier mois du trimestre (1, 4, 7 ou 10)
  annee: 2025,
  typePeriode: "TRIMESTRIELLE",
  typeDocument: "FACTURE"
}
```

**Comportement** :
1. ✅ Calcule les 3 mois du trimestre (ex: 1, 2, 3 pour T1)
2. ✅ Vérifier si des factures existent déjà pour ces 3 mois
3. ❌ Si OUI → Erreur 409 avec message : "Des factures existent déjà pour ce trimestre (2/3 mois : Janvier, Février)"
4. ✅ Si NON → Génère le PDF + Sauvegarde **3 entrées** en BDD (une par mois)

---

### **Cas 3 : Tentative de doublon**

```bash
# Première génération
POST → Facture Janvier 2025 → ✅ OK, sauvegardée

# Deuxième génération (doublon)
POST → Facture Janvier 2025 → ❌ ERREUR 409
Response:
{
  "success": false,
  "error": "QUITTANCE_ALREADY_EXISTS",
  "message": "Une facture existe déjà pour Janvier 2025. Retrouvez-la dans la section Documents.",
  "data": {
    "quittance": { ... },  // Facture existante
    "mois": 1,
    "annee": 2025
  }
}
```

---

## 📊 Utilisation dans le Frontend

### **1. Afficher les factures dans Documents**

```javascript
// Appel API
const response = await fetch(`/api/spaces/${spaceId}/quittances`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data: factures } = await response.json();

// Afficher la liste
factures.forEach(facture => {
  console.log(`${helpers.getMonthName(facture.mois)} ${facture.annee}`);
  console.log(`Locataire : ${facture.bail.locataire.raisonSociale}`);
  console.log(`Bien : ${facture.bail.bien.adresse}`);
  console.log(`Montant : ${facture.montantTotal} €`);
  console.log(`Payée : ${facture.estPaye ? 'Oui' : 'Non'}`);
});
```

### **2. Filtrer les factures**

```javascript
// Par année
const factures2025 = await fetch(`/api/spaces/${spaceId}/quittances?annee=2025`);

// Par bail
const facturesBail = await fetch(`/api/spaces/${spaceId}/quittances?bailId=${bailId}`);

// Les deux
const factures = await fetch(`/api/spaces/${spaceId}/quittances?annee=2025&bailId=${bailId}`);
```

### **3. Gérer l'erreur de doublon**

```javascript
try {
  const response = await fetch(`/api/spaces/${spaceId}/quittances/generer`, {
    method: 'POST',
    body: JSON.stringify({ bailId, mois, annee, typePeriode: 'TRIMESTRIELLE' })
  });
  
  if (response.status === 409) {
    const error = await response.json();
    // Afficher message : "Des factures existent déjà pour ce trimestre"
    // + Bouton "Voir dans Documents"
    alert(error.message);
  }
} catch (error) {
  console.error(error);
}
```

---

## 🧪 Tests à effectuer

### **Test 1 : Facture trimestrielle**
1. ✅ Générer une facture T1 2025 (mois 1)
2. ✅ Vérifier que 3 quittances sont créées en BDD (mois 1, 2, 3)
3. ✅ Tenter de régénérer T1 2025 → Doit afficher erreur 409

### **Test 2 : Facture mensuelle**
1. ✅ Générer facture Janvier 2025
2. ✅ Vérifier qu'1 quittance est créée en BDD
3. ✅ Tenter de régénérer Janvier 2025 → Doit afficher erreur 409

### **Test 3 : Liste des factures**
1. ✅ Appeler GET `/api/spaces/:spaceId/quittances`
2. ✅ Vérifier que toutes les factures apparaissent
3. ✅ Filtrer par année → `/api/spaces/:spaceId/quittances?annee=2025`

### **Test 4 : Marquer comme payée**
1. ✅ PATCH `/api/quittances/:id/payer` avec `datePaiement`
2. ✅ Vérifier que `estPaye = true` en BDD

---

## 📋 Checklist frontend (à implémenter)

- [ ] Créer une section "Factures" dans Documents
- [ ] Afficher la liste des factures avec filtres (année, bail)
- [ ] Bouton "Télécharger" pour régénérer le PDF
- [ ] Gérer l'erreur 409 (doublon) avec message + lien Documents
- [ ] Badge "Payée" / "Impayée" sur chaque facture
- [ ] Action "Marquer comme payée" avec sélection de date

---

## 🎯 Résultat final

### **Avant** ❌
- Factures trimestrielles perdues (pas en BDD)
- Doublons possibles
- Impossible de retrouver les factures émises

### **Après** ✅
- Toutes les factures sauvegardées (mensuelles + trimestrielles)
- Protection anti-doublon avec message clair
- Endpoint pour lister et filtrer les factures
- Prêt pour intégration frontend dans Documents

---

## 📞 Prochaines étapes

1. **Frontend** : Créer la page "Factures" dans Documents
2. **UX** : Afficher un message clair en cas de doublon avec lien "Voir dans Documents"
3. **Amélioration** : Pouvoir régénérer un PDF existant (sans créer de doublon)
4. **Export** : Bouton pour télécharger toutes les factures d'une année en ZIP

---

**Date de correction** : 18 octobre 2025  
**Fichiers modifiés** : 2 (quittanceController.js, quittanceRoutes.js)  
**Status** : ✅ **TOUTES LES CORRECTIONS APPLIQUÉES**
