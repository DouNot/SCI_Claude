# 📄 Système PDF Amélioré - Documentation

## 🎯 Vue d'ensemble

Le système de génération de PDF a été entièrement repensé pour offrir :
- ✨ **Design moderne et professionnel**
- 🎨 **Templates réutilisables**
- 🔧 **Configuration centralisée**
- 📊 **Fonctionnalités avancées**
- 🔢 **Numérotation unique des documents**

## 📁 Structure des fichiers

```
backend/src/utils/pdf/
├── pdfConfig.js       # Configuration globale (couleurs, styles, infos SCI)
├── pdfHelpers.js      # Fonctions utilitaires (formatage, calculs)
└── pdfTemplates.js    # Composants réutilisables (header, footer, tableaux)

backend/src/controllers/
├── quittanceController.js     # Version originale (conservée)
└── quittanceController.v2.js  # Nouvelle version améliorée
```

## 🚀 Installation

### 1. Migration de la base de données

Ajoutez le champ `numeroQuittance` au modèle Quittance :

**Option A : Avec Prisma**
```bash
# Ajoutez dans schema.prisma :
model Quittance {
  # ... champs existants
  numeroQuittance String?
}

# Puis générez la migration
npx prisma migrate dev --name add_numero_quittance
```

**Option B : Avec le fichier SQL fourni**
```bash
# Exécutez le fichier MIGRATION_QUITTANCES.sql
sqlite3 prisma/dev.db < MIGRATION_QUITTANCES.sql
```

### 2. Configuration de votre SCI

Éditez `backend/src/utils/pdf/pdfConfig.js` pour personnaliser vos informations :

```javascript
company: {
  name: 'Votre SCI',
  address: 'Votre adresse',
  postalCode: '75000',
  city: 'Paris',
  phone: '01 23 45 67 89',
  email: 'contact@votresci.fr',
  siret: '123 456 789 00012',
},
```

### 3. Activation du nouveau contrôleur

Pour utiliser la nouvelle version des quittances, remplacez dans vos routes :

```javascript
// Avant
const quittanceController = require('./controllers/quittanceController');

// Après
const quittanceController = require('./controllers/quittanceController.v2');
```

**OU** renommez directement les fichiers :
```bash
cd backend/src/controllers
mv quittanceController.js quittanceController.old.js
mv quittanceController.v2.js quittanceController.js
```

## 📋 Nouvelles fonctionnalités

### 1. Quittances modernisées

#### Améliorations visuelles
- ✅ Design professionnel avec en-tête coloré
- ✅ Numéro de quittance unique (format: `Q202410-XXXXXXXX`)
- ✅ Cartes d'information pour bailleur/locataire
- ✅ Tableaux stylisés pour les montants
- ✅ Badges de statut (PAYÉ, EN ATTENTE, EN RETARD)
- ✅ Watermark "IMPAYÉ" si non réglé
- ✅ Historique des 5 derniers paiements

#### Améliorations fonctionnelles
- ✅ Détection automatique des retards de paiement
- ✅ Calcul des jours de retard
- ✅ Mentions légales conformes
- ✅ Pied de page avec coordonnées complètes

### 2. Nouvelles routes API

#### Génération en lot
```http
POST /api/quittances/generer-lot
Content-Type: application/json

{
  "mois": 10,
  "annee": 2024
}
```
Génère automatiquement toutes les quittances du mois pour les baux actifs.

#### Marquer comme payée
```http
PATCH /api/quittances/:id/payer
Content-Type: application/json

{
  "datePaiement": "2024-10-15"
}
```
Met à jour le statut de paiement d'une quittance existante.

## 🎨 Personnalisation

### Couleurs

Modifiez les couleurs dans `pdfConfig.js` :

```javascript
colors: {
  primary: '#2563eb',      // Couleur principale
  success: '#10b981',      // Vert (paiements)
  danger: '#ef4444',       // Rouge (impayés)
  warning: '#f59e0b',      // Orange (retards)
  // ...
}
```

### Polices

Le système utilise les polices Helvetica par défaut (incluses dans PDFKit).
Pour utiliser des polices personnalisées :

```javascript
// Dans pdfConfig.js
fonts: {
  custom: './fonts/MaPolice.ttf'
}

// Dans votre code
doc.font(config.fonts.custom);
```

### Templates personnalisés

Créez vos propres composants dans `pdfTemplates.js` :

```javascript
exports.drawMyCustomCard = (doc, options) => {
  // Votre code personnalisé
};
```

## 📊 Exemples d'utilisation

### Générer une quittance simple

```javascript
const response = await fetch('/api/quittances/generer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bailId: 'uuid-du-bail',
    mois: 10,
    annee: 2024,
    datePaiement: '2024-10-05' // Optionnel
  })
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
window.open(url); // Ouvre le PDF
```

### Générer toutes les quittances du mois

```javascript
const response = await fetch('/api/quittances/generer-lot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mois: 10,
    annee: 2024
  })
});

const result = await response.json();
console.log(result.message); 
// "5 quittance(s) générée(s) pour Octobre 2024"
```

## 🛠️ Helpers disponibles

### Formatage

```javascript
const { formatCurrency, formatDate, formatPhone } = require('../utils/pdf/pdfHelpers');

formatCurrency(1234.56);           // "1 234,56 €"
formatCurrency(1234.56, true);     // "+1 234,56 €"
formatDate(new Date(), 'long');    // "vendredi 10 octobre 2025"
formatPhone('0123456789');         // "01 23 45 67 89"
```

### Numérotation

```javascript
const { generateQuittanceNumber } = require('../utils/pdf/pdfHelpers');

generateQuittanceNumber('bail-uuid-123', 10, 2024);
// Résultat: "Q202410-BAILUUID"
```

### Calculs

```javascript
const { daysBetween, isPaymentLate } = require('../utils/pdf/pdfHelpers');

daysBetween(new Date('2024-10-01'), new Date('2024-10-15')); // 14
isPaymentLate(new Date('2024-10-15'), new Date('2024-10-05')); // true
```

## 📦 Templates disponibles

### En-tête
```javascript
templates.drawHeader(doc, 'TITRE', 'Sous-titre optionnel');
```

### Pied de page
```javascript
templates.drawFooter(doc, pageNumber, totalPages);
```

### Carte d'information
```javascript
templates.drawInfoCard(doc, {
  x: 50,
  y: 150,
  width: 245,
  title: 'BAILLEUR',
  content: ['Ligne 1', 'Ligne 2', 'Ligne 3'],
  borderColor: '#2563eb'
});
```

### Tableau
```javascript
templates.drawTable(doc, {
  headers: ['Colonne 1', 'Colonne 2'],
  rows: [
    ['Valeur 1', 'Valeur 2'],
    ['Valeur 3', 'Valeur 4']
  ],
  columnWidths: [300, 195]
});
```

### Badge de statut
```javascript
templates.drawBadge(doc, {
  x: 50,
  y: 200,
  text: 'PAYÉ',
  type: 'success' // 'success', 'danger', 'warning', 'info'
});
```

### Mise en valeur
```javascript
templates.drawHighlight(doc, {
  label: 'TOTAL',
  value: '1 250,00 €',
  color: '#10b981'
});
```

### Watermark (filigrane)
```javascript
templates.addWatermark(doc, 'IMPAYÉ');
```

## 🔮 Évolutions futures

### Prochaines fonctionnalités prévues

1. **QR Code sur les quittances**
   - Vérification d'authenticité
   - Lien vers un portail en ligne

2. **Graphiques et statistiques**
   - Évolution des loyers
   - Répartition des charges
   - Rentabilité mensuelle

3. **Multi-langue**
   - Support français/anglais
   - Templates internationaux

4. **Envoi automatique par email**
   - Génération et envoi en masse
   - Rappels automatiques

5. **Signature électronique**
   - Intégration DocuSign
   - Signature manuscrite digitale

## ❓ FAQ

### Comment migrer mes anciennes quittances ?

Les anciennes quittances restent valides. Le nouveau système :
- Détecte automatiquement si une quittance existe
- Ne génère pas de doublons
- Peut mettre à jour le statut de paiement

### Puis-je personnaliser complètement le design ?

Oui ! Vous pouvez :
1. Modifier `pdfConfig.js` pour les couleurs/styles
2. Créer vos propres templates dans `pdfTemplates.js`
3. Overrider complètement le contrôleur

### Les anciens PDF sont-ils toujours accessibles ?

Oui, l'ancien contrôleur est conservé en `.old.js`. Vous pouvez :
- Revenir à l'ancienne version à tout moment
- Utiliser les deux systèmes en parallèle
- Migrer progressivement

### Comment ajouter un logo ?

Dans `pdfConfig.js` :
```javascript
company: {
  logo: './assets/logo.png'
}
```

Puis dans `pdfTemplates.js` :
```javascript
if (company.logo) {
  doc.image(company.logo, 50, 30, { width: 50 });
}
```

## 📞 Support

Pour toute question ou suggestion :
- Consultez le code source commenté
- Ouvrez une issue sur le projet
- Contactez l'équipe de développement

---

**Version:** 2.0.0  
**Dernière mise à jour:** Octobre 2024  
**Compatibilité:** Node.js 16+, PDFKit 0.13+
