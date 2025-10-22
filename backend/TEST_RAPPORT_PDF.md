# 🧪 GUIDE DE TEST - RAPPORT PDF CORRIGÉ

## ⚡ Test Rapide (5 minutes)

### 1. Générer un nouveau rapport
```bash
# Depuis le frontend, aller dans :
Rapports > Créer un rapport annuel > Générer le PDF
```

### 2. Checklist visuelle rapide

#### ✅ Page 1 (Couverture)
- [ ] Fond BLANC (pas noir !)
- [ ] Texte "RAPPORT" au lieu d'un emoji bizarre
- [ ] Nom de votre SCI affiché correctement
- [ ] Année en grand et en bleu

#### ✅ Pages suivantes (En-têtes/Pieds)
- [ ] En haut à droite : votre nom de SCI (pas "SCI Claude")
- [ ] En bas à gauche : votre nom de SCI
- [ ] En bas à droite : "Page 2/11" (pas "Page 2/X")

#### ✅ Page 3 (Synthèse Executive)
Vérifier les 4 grandes cartes :

| Carte | Valeur attendue |
|-------|----------------|
| **REVENUS TOTAUX** | Même montant que le dashboard |
| **CHARGES TOTALES** | Même montant que le dashboard |
| **RÉSULTAT NET** | Revenus - Charges (cohérent !) |
| **PATRIMOINE NET** | Même montant que le dashboard |

**IMPORTANT :** Pas de caractères bizarres (Ø=ÜÊ) nulle part !

#### ✅ Page 6 (Analyse des Charges)
Vérifier le tableau doit avoir **4 lignes** :
1. Factures et entretien
2. Charges récurrentes
3. Mensualités de prêts
4. **TOTAL** (somme des 3 au-dessus)

#### ✅ Dernière page (Mentions Légales)
- [ ] "Fait à [VOTRE VILLE]" (pas toujours Paris)
- [ ] Date du jour correcte

---

## 📊 Comparaison Dashboard vs PDF

### Ouvrir côte à côte :
1. Dashboard (page d'accueil)
2. PDF généré

### Vérifier que ces chiffres sont IDENTIQUES :

```
Dashboard                      PDF
─────────────────────────────────────────
Revenus : 104 400 €     =     104 400 €
Charges : 93 067 €      =      93 067 €
Résultat : 11 333 €     =      11 333 €
Patrimoine : 1 327 214€ =   1 327 214 €
```

---

## 🐛 Si vous voyez encore des problèmes

### Caractères bizarres (Ø=ÜÊ) ?
➡️ Vérifier que vous avez bien redémarré le serveur backend :
```bash
cd backend
npm run dev
```

### Nom de SCI incorrect ?
➡️ Vérifier dans Paramètres > Espaces que le nom de votre SCI est bien renseigné

### Données financières incohérentes ?
➡️ Vérifier que :
- Les quittances sont bien marquées comme payées
- Les factures sont bien marquées comme payées
- Les charges récurrentes ont des paiements enregistrés

### Page 1 toujours noire ?
➡️ Supprimer le cache du PDF :
```bash
cd backend
rm -rf uploads/rapports/*.pdf
```
Puis régénérer le rapport.

---

## 📝 Tests avancés (optionnel)

### Test avec différentes configurations

#### Test 1 : SCI avec associés
- [ ] Vérifier que la page "Répartition des Associés" apparaît
- [ ] Tableau des associés correct
- [ ] Graphique en barres horizontales

#### Test 2 : SCI sans prêts
- [ ] Pas de section "Situation d'endettement"
- [ ] Charges totales = factures + récurrentes seulement

#### Test 3 : SCI avec plusieurs biens
- [ ] Graphique de répartition par type
- [ ] Liste ou tableau des biens selon le nombre

#### Test 4 : Période personnalisée
- [ ] Dates de période correctes en couverture
- [ ] Données filtrées sur la bonne période

---

## ✅ Validation finale

Si TOUS ces points sont validés, le rapport est correct :

- [x] Fond blanc sur toutes les pages
- [x] Aucun caractère bizarre nulle part
- [x] Nom de SCI dynamique et correct
- [x] Numérotation pages correcte
- [x] Données financières = Dashboard
- [x] Toutes les charges incluses
- [x] Adresse de signature correcte

---

## 🚨 En cas de bug persistant

### 1. Vérifier les fichiers modifiés
```bash
cd backend/src/services
cat pdfService.js | grep "donnees.space.nom"  # Doit apparaître plusieurs fois

cd ../utils/pdf
cat pdfTemplates.js | grep "sciName"  # Doit apparaître dans drawHeader et drawFooter
```

### 2. Logs de débogage
Pendant la génération, vérifier dans la console backend :
```
📊 Collecte des données pour le rapport 2025...
✅ Données collectées : X biens, Y quittances, Z factures
🎨 Génération du PDF pour le rapport 2025...
✅ PDF généré : rapport_annuel_VOTRE_SCI_2025.pdf
```

### 3. Tester la collecte des données
Créer un test rapide :
```javascript
// backend/test-rapport-data.js
const { collecterDonneesRapport } = require('./src/services/pdfService');

async function test() {
  const donnees = await collecterDonneesRapport(
    'votre-space-id',
    2025,
    new Date(2025, 0, 1),
    new Date(2025, 11, 31)
  );
  
  console.log('Revenus:', donnees.stats.totalRevenus);
  console.log('Charges:', donnees.stats.totalChargesAnnee);
  console.log('Résultat:', donnees.stats.resultatNet);
}

test();
```

---

## 📞 Support

Si un problème persiste :
1. Capturer une screenshot du PDF problématique
2. Noter le message d'erreur exact (si erreur)
3. Vérifier que les fichiers ont bien été modifiés (comparer les dates)

---

**Dernier test effectué :** [À remplir après test]  
**Résultat :** ✅ Validé / ❌ À corriger  
**Notes :**
