# Correctif pour les problèmes de formatage PDF

## Problèmes identifiés et corrigés

### ✅ 1. Formatage des montants (résolu dans quittances)
**Problème** : Les montants s'affichent comme "1 /500,00 €" au lieu de "1 500,00 €"
**Cause** : `.toLocaleString('fr-FR')` utilise des espaces insécables qui causent des problèmes d'encodage
**Solution** : Utiliser `helpers.formatCurrency()` qui utilise des espaces normaux

### ✅ 2. Numéro de quittance (résolu)
**Avant** : `Q202510-70BDA071` (pas lisible)
**Après** : `Q2025-10-001` (format simple ANNÉE-MOIS-NUMÉRO)

### ✅ 3. Section paiement (résolu)
**Supprimé** : "PAYE EN RETARD" avec détails des jours de retard
**Gardé** : Badge simple "PAYE" + date de paiement

### ✅ 4. Chevauchements de texte (résolu)
**Solution** : Ajout d'espacement avec `.moveDown()` entre les sections

## 🔧 À faire : Corriger exportController.js

Le fichier `exportController.js` utilise encore `.toLocaleString('fr-FR')` dans plusieurs endroits.
Pour corriger, remplacez toutes les occurrences de formatage de montants.

### Rechercher et remplacer :

**Dans le dashboard PDF (ligne ~550+)** :
```javascript
// Avant
${loyersMensuels.toLocaleString('fr-FR')} €
${cashFlowAnnuel.toLocaleString('fr-FR')} €
${loyersAnnuels.toLocaleString('fr-FR')} €
// etc...

// Après : Importer les helpers en haut du fichier
const helpers = require('../utils/pdf/pdfHelpers');

// Puis utiliser
${helpers.formatCurrency(loyersMensuels)}
${helpers.formatCurrency(cashFlowAnnuel, true)} // true pour afficher le signe +/-
${helpers.formatCurrency(loyersAnnuels, true)}
// etc...
```

### Occurrences à remplacer dans exportController.js :
- `loyersMensuels.toLocaleString('fr-FR')` → `helpers.formatCurrency(loyersMensuels)`
- `cashFlowAnnuel.toLocaleString('fr-FR')` → `helpers.formatCurrency(cashFlowAnnuel, true)`
- `loyersAnnuels.toLocaleString('fr-FR')` → `helpers.formatCurrency(loyersAnnuels, true)`
- `chargesPrets.toLocaleString('fr-FR')` → `helpers.formatCurrency(chargesPrets)`
- `autresChargesAnnuelles.toLocaleString('fr-FR')` → `helpers.formatCurrency(autresChargesAnnuelles)`
- Tous les autres montants avec `.toLocaleString('fr-FR')`

### Dans la fonction exportBienBilanPDF (ligne ~260+) :
- `loyersTotal.toLocaleString('fr-FR')` → `helpers.formatCurrency(loyersTotal)`
- `chargesTotal.toLocaleString('fr-FR')` → `helpers.formatCurrency(chargesTotal)`
- `mensualitesPrets.toLocaleString('fr-FR')` → `helpers.formatCurrency(mensualitesPrets)`
- `facturesTotal.toLocaleString('fr-FR')` → `helpers.formatCurrency(facturesTotal)`
- `travauxTotal.toLocaleString('fr-FR')` → `helpers.formatCurrency(travauxTotal)`
- `cashFlow.toLocaleString('fr-FR')` → `helpers.formatCurrency(cashFlow, true)`

### Dans la fonction exportAmortissementPDF (ligne ~30+) :
- `montant.toLocaleString('fr-FR')` → `helpers.formatCurrency(montant)`
- `mensualite.toLocaleString('fr-FR')` → `helpers.formatCurrency(mensualite)`

## ✅ Tests à effectuer après les corrections :

1. **Quittance** : Générer une quittance et vérifier que les montants s'affichent correctement (ex: "1 500,00 €")
2. **Dashboard PDF** : Vérifier tous les montants dans les KPI et les totaux
3. **Bilan de bien** : Tester l'export d'un bilan et vérifier le formatage
4. **Numéros de quittance** : Vérifier le nouveau format Q2025-10-001

## 📝 Note importante :

Le formatage avec `.toLocaleString('fr-FR')` fonctionne bien en JavaScript mais cause des problèmes 
d'encodage avec PDFKit car il utilise des caractères spéciaux (espace insécable U+00A0) qui ne sont 
pas toujours bien gérés par les polices PDF standard.

La solution avec `helpers.formatCurrency()` utilise un espace normal et garantit un affichage correct.
