# 🏠 Ajout de la Refacturation de Taxe Foncière dans les Baux

## 📝 Modifications apportées

### 1. Base de données (Schema Prisma)
✅ Ajout de 2 nouveaux champs dans le modèle `Bail` :
- `refactureTaxeFonciere` (Boolean) : Indique si la taxe foncière est refacturée
- `montantTaxeFonciere` (Float, optionnel) : Montant annuel de TF refacturé

### 2. Formulaire de bail
✅ Ajout d'une nouvelle section "Taxe Foncière" avec :
- Checkbox pour activer/désactiver la refacturation
- Champ de montant (apparaît si checkbox cochée)
- Animation fluide lors de l'affichage du champ

---

## 🚀 Instructions d'installation

### Étape 1 : Appliquer la migration de la base de données

Depuis le dossier `backend` :

```bash
# Méthode 1 : Via Node.js
node migrate-taxe-fonciere.js

# OU Méthode 2 : Via Prisma
npx prisma migrate dev --name add_taxe_fonciere_bail
```

### Étape 2 : Régénérer le client Prisma

```bash
npx prisma generate
```

### Étape 3 : Redémarrer le serveur backend

```bash
npm run dev
```

---

## 🎯 Utilisation

### Créer un nouveau bail avec TF refacturée

1. Ouvrir le formulaire de création de bail
2. Remplir les informations habituelles
3. Dans la section "🏠 Taxe Foncière" :
   - ✅ Cocher "Refacturer la taxe foncière au locataire"
   - 📝 Saisir le montant annuel (ex: 1500 €)
4. Le montant sera automatiquement divisé sur 12 mois

### Modifier un bail existant

1. Ouvrir le bail en édition
2. Activer/désactiver la refacturation de TF
3. Modifier le montant si nécessaire
4. Sauvegarder

---

## 📊 Structure des données

### Exemple de données en base

```json
{
  "id": "uuid",
  "loyerHC": 1200,
  "charges": 150,
  "refactureTaxeFonciere": true,
  "montantTaxeFonciere": 1500,
  "..."
}
```

### Calcul mensuel

Si `refactureTaxeFonciere = true` et `montantTaxeFonciere = 1500` :
- **Montant mensuel TF** : 1500 / 12 = 125 €/mois
- **Total charges mensuelles** : 150 + 125 = 275 €
- **Total à payer** : 1200 (loyer) + 275 (charges) = 1475 €/mois

---

## 🔄 Prochaines étapes (suggestions)

### 1. Afficher la TF dans les détails du bail
Modifier `BienDetailPage.jsx` pour afficher :
```jsx
{bailActif.refactureTaxeFonciere && (
  <div>
    <p>Taxe foncière refacturée</p>
    <p>{bailActif.montantTaxeFonciere} €/an</p>
    <p className="text-sm">Soit {(bailActif.montantTaxeFonciere / 12).toFixed(2)} €/mois</p>
  </div>
)}
```

### 2. Inclure dans les quittances
Modifier le générateur de quittances pour ajouter une ligne TF si `refactureTaxeFonciere = true`

### 3. Comptabilité
Créer automatiquement une charge de type "TAXE_FONCIERE" pour suivre la refacturation

---

## ✅ Tests à effectuer

- [ ] Créer un bail sans TF refacturée (comportement normal)
- [ ] Créer un bail avec TF refacturée
- [ ] Modifier un bail existant pour ajouter la TF
- [ ] Modifier un bail pour retirer la TF
- [ ] Vérifier que les données sont bien sauvegardées
- [ ] Vérifier l'affichage dans les détails

---

## 🐛 Résolution de problèmes

### Erreur lors de la migration
```
Error: no such column: refactureTaxeFonciere
```
→ La migration n'a pas été appliquée. Relancer `node migrate-taxe-fonciere.js`

### Le champ ne s'affiche pas
→ Vider le cache du navigateur et redémarrer le serveur

### Erreur de validation
→ Vérifier que `refactureTaxeFonciere` est un Boolean et `montantTaxeFonciere` un Float
