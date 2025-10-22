# ✅ CHECKLIST DE TEST - RAPPORTS PDF AMÉLIORÉS

## 🎯 Objectif
Valider le bon fonctionnement de la génération de rapports PDF améliorés dans tous les scénarios.

---

## 🧪 Tests à effectuer

### **Test 1 : Installation et dépendances** ✅ / ❌

- [ ] Les dépendances sont installées (`pdfkit` présent)
- [ ] Le dossier `uploads/rapports/` existe ou est créé automatiquement
- [ ] Les routes `/api/spaces/:spaceId/rapports` répondent
- [ ] Le frontend charge la page `/rapports` sans erreur

---

### **Test 2 : Génération basique** ✅ / ❌

**Prérequis** : Au moins 1 SCI avec 1 bien

1. [ ] Aller sur `/rapports`
2. [ ] Cliquer sur "Nouveau rapport"
3. [ ] Remplir :
   - Nom : "Rapport Test 2024"
   - Année : 2024
   - Type : COMPLET
   - ✓ Générer immédiatement
4. [ ] Cliquer "Créer"
5. [ ] Le rapport apparaît dans la liste avec statut "Généré"
6. [ ] Cliquer sur l'icône de téléchargement
7. [ ] Le PDF se télécharge correctement
8. [ ] Ouvrir le PDF et vérifier :
   - [ ] Page de couverture avec nom SCI
   - [ ] Table des matières
   - [ ] Synthèse avec KPIs
   - [ ] Toutes les sections présentes
   - [ ] Pieds de page numérotés

**Résultat attendu** : PDF professionnel de 8-12 pages

---

### **Test 3 : Cas avec données complètes** ✅ / ❌

**Prérequis** : SCI avec 3+ biens, baux, quittances payées, factures

1. [ ] Créer un rapport pour l'année en cours
2. [ ] Générer le PDF
3. [ ] Vérifier les sections :
   - [ ] **Synthèse** : KPIs avec valeurs réelles
   - [ ] **Patrimoine** : Graphique types de biens visible
   - [ ] **Revenus** : Graphique mensuel avec courbe
   - [ ] **Charges** : Tableau par catégorie rempli
   - [ ] **Financière** : Cashflow mensuel avec données
   - [ ] **Performance** : Taux d'occupation calculé
   - [ ] **Associés** : Liste et graphique (si SCI)

**Résultat attendu** : Toutes les données sont correctes et cohérentes

---

### **Test 4 : Cas edge - Pas de données** ✅ / ❌

**Prérequis** : SCI vide (sans biens)

1. [ ] Créer un rapport
2. [ ] Générer le PDF
3. [ ] Vérifier :
   - [ ] Pas d'erreur à la génération
   - [ ] KPIs à 0€
   - [ ] Message "Aucun bien" ou tableau vide
   - [ ] Graphiques vides ou masqués
   - [ ] PDF généré malgré tout

**Résultat attendu** : PDF généré sans crash, valeurs à 0

---

### **Test 5 : Cas edge - Valeurs négatives** ✅ / ❌

**Prérequis** : SCI avec plus de charges que de revenus

1. [ ] Créer un rapport
2. [ ] Générer le PDF
3. [ ] Vérifier :
   - [ ] Résultat net négatif en rouge
   - [ ] Cashflow négatif affiché avec couleur rouge
   - [ ] Graphique cashflow avec ligne zéro visible
   - [ ] Pas de crash

**Résultat attendu** : Valeurs négatives gérées proprement

---

### **Test 6 : Plusieurs types de rapports** ✅ / ❌

1. [ ] Créer rapport type COMPLET → OK
2. [ ] Créer rapport type SIMPLIFIÉ → OK
3. [ ] Créer rapport type FISCAL → OK
4. [ ] Tous les types se génèrent
5. [ ] Le type est mentionné dans le rapport

**Résultat attendu** : 3 rapports différents générés

---

### **Test 7 : Gestion des années** ✅ / ❌

1. [ ] Créer rapport année 2023 → Données 2023 uniquement
2. [ ] Créer rapport année 2024 → Données 2024 uniquement
3. [ ] Créer rapport année 2025 → Peut-être vide si pas de données
4. [ ] Vérifier que les quittances/factures filtrées sont bonnes

**Résultat attendu** : Filtrage correct par année

---

### **Test 8 : Performance avec gros volumes** ✅ / ❌

**Prérequis** : SCI avec 10+ biens, 100+ quittances, 50+ factures

1. [ ] Créer rapport
2. [ ] Mesurer le temps de génération (devrait être < 10 sec)
3. [ ] Vérifier :
   - [ ] Pas de timeout
   - [ ] Taille du PDF raisonnable (< 5 MB)
   - [ ] Tous les biens listés
   - [ ] Pagination automatique des tableaux

**Résultat attendu** : Génération rapide, PDF cohérent

---

### **Test 9 : Espace PERSONAL** ✅ / ❌

**Prérequis** : Espace de type PERSONAL (pas SCI)

1. [ ] Créer un rapport
2. [ ] Générer le PDF
3. [ ] Vérifier :
   - [ ] Pas de section "Associés"
   - [ ] Pas de mention SIRET
   - [ ] Reste du rapport normal

**Résultat attendu** : Rapport adapté pour espace personnel

---

### **Test 10 : Multi-utilisateurs** ✅ / ❌

1. [ ] Utilisateur A crée un rapport
2. [ ] Utilisateur B (membre du même Space) voit le rapport
3. [ ] Utilisateur B peut le télécharger
4. [ ] Utilisateur C (pas membre) ne voit pas le rapport

**Résultat attendu** : Contrôle d'accès respecté

---

### **Test 11 : Suppression** ✅ / ❌

1. [ ] Créer un rapport et le générer
2. [ ] Noter le nom du fichier PDF
3. [ ] Supprimer le rapport via UI
4. [ ] Vérifier :
   - [ ] Rapport supprimé de la liste
   - [ ] Fichier PDF supprimé du dossier `uploads/rapports/`
   - [ ] Entrée supprimée de la base

**Résultat attendu** : Nettoyage complet

---

### **Test 12 : Brouillon sans génération** ✅ / ❌

1. [ ] Créer rapport sans cocher "Générer immédiatement"
2. [ ] Vérifier :
   - [ ] Statut "Brouillon"
   - [ ] Icône "Générer" visible
   - [ ] Pas de bouton téléchargement
3. [ ] Cliquer "Générer"
4. [ ] Vérifier :
   - [ ] Statut passe à "Généré"
   - [ ] Bouton téléchargement apparaît
   - [ ] Icône "Générer" disparaît

**Résultat attendu** : Workflow brouillon → généré OK

---

### **Test 13 : API directe** ✅ / ❌

**Avec un outil REST (Postman/Insomnia)**

1. [ ] POST `/api/spaces/:spaceId/rapports` → Rapport créé
2. [ ] GET `/api/spaces/:spaceId/rapports` → Liste des rapports
3. [ ] GET `/api/spaces/:spaceId/rapports/:id` → Détail rapport
4. [ ] POST `/api/spaces/:spaceId/rapports/:id/generer` → PDF généré
5. [ ] GET `/api/spaces/:spaceId/rapports/:id/download` → Fichier téléchargé
6. [ ] DELETE `/api/spaces/:spaceId/rapports/:id` → Rapport supprimé

**Résultat attendu** : Toutes les routes fonctionnent

---

### **Test 14 : Script de test automatique** ✅ / ❌

1. [ ] Ouvrir un terminal dans `/backend`
2. [ ] Lancer `node test-rapport-pdf.js`
3. [ ] Vérifier :
   - [ ] Espace trouvé
   - [ ] Données collectées
   - [ ] PDF généré
   - [ ] Aucune erreur

**Résultat attendu** : Test passe sans erreur

---

### **Test 15 : Qualité visuelle du PDF** ✅ / ❌

Ouvrir un PDF généré et vérifier manuellement :

#### Page de couverture
- [ ] Fond sombre élégant
- [ ] Logo/icône visible
- [ ] Année en grand
- [ ] Nom de la SCI lisible
- [ ] Informations complètes

#### Table des matières
- [ ] Sections numérotées
- [ ] Lignes pointillées
- [ ] Numéros de pages alignés

#### Synthèse Executive
- [ ] 4 KPIs en grille
- [ ] Couleurs appropriées (vert/rouge/bleu)
- [ ] Icônes emoji visibles
- [ ] Points clés lisibles

#### Graphiques
- [ ] Barres des types de biens proportionnelles
- [ ] Courbe des revenus fluide
- [ ] Cashflow avec points visibles
- [ ] Labels des mois présents

#### Tableaux
- [ ] En-têtes avec fond gris
- [ ] Lignes alternées claires/foncées
- [ ] Bordures visibles
- [ ] Montants alignés à droite

#### Pieds de page
- [ ] Sur toutes les pages sauf couverture
- [ ] Nom de la SCI visible
- [ ] Numérotation correcte

**Résultat attendu** : PDF professionnel, prêt pour impression

---

## 📊 Résumé des tests

| Test | Description | Statut |
|------|-------------|--------|
| 1 | Installation | ⬜ |
| 2 | Génération basique | ⬜ |
| 3 | Données complètes | ⬜ |
| 4 | Pas de données | ⬜ |
| 5 | Valeurs négatives | ⬜ |
| 6 | Types de rapports | ⬜ |
| 7 | Gestion années | ⬜ |
| 8 | Performance | ⬜ |
| 9 | Espace PERSONAL | ⬜ |
| 10 | Multi-utilisateurs | ⬜ |
| 11 | Suppression | ⬜ |
| 12 | Brouillon | ⬜ |
| 13 | API | ⬜ |
| 14 | Script auto | ⬜ |
| 15 | Qualité visuelle | ⬜ |

**Total** : ___/15 tests réussis

---

## 🐛 Bugs trouvés

| # | Description | Gravité | Statut |
|---|-------------|---------|--------|
| 1 | | 🔴🟡🟢 | ⬜ |
| 2 | | 🔴🟡🟢 | ⬜ |
| 3 | | 🔴🟡🟢 | ⬜ |

---

## ✅ Validation finale

- [ ] Tous les tests critiques passent (1-7, 11-14)
- [ ] Pas de bugs bloquants (🔴)
- [ ] PDF professionnel et prêt pour production
- [ ] Performance acceptable (< 10 sec)
- [ ] Sécurité respectée (accès Space)

**Date de validation** : _______________  
**Validé par** : _______________

---

## 📝 Notes

```
[Espace pour notes de test]
```

---

**Version** : 2.0  
**Document** : Checklist de test rapports PDF
