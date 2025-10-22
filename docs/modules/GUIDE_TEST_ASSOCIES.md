# 🧪 GUIDE DE TEST - GESTION DES ASSOCIÉS

## 🚀 Démarrage Rapide

### 1. Lancer le Backend
```bash
cd backend
npm run dev
```
Le backend démarre sur `http://localhost:3000`

### 2. Lancer le Frontend
```bash
cd frontend
npm run dev
```
Le frontend démarre sur `http://localhost:5173`

### 3. Migration de la Base de Données
```bash
cd backend
npx prisma db push
```

---

## ✅ CHECKLIST DE TEST

### Phase 1 : Création d'Associés

#### Test 1.1 : Créer un premier associé (Personne Physique)
1. Se connecter à l'application
2. Aller sur `/associes`
3. Cliquer sur "Ajouter un associé"
4. Remplir :
   - Type : **Personne Physique**
   - Nom : **Dupont**
   - Prénom : **Jean**
   - Email : `jean.dupont@email.com`
   - Téléphone : `06 12 34 56 78`
   - Nombre de parts : **500** (sur un capital de 1000)
   - Date d'entrée : Date du jour
5. Vérifier :
   - ✅ Le pourcentage s'affiche automatiquement : **50%**
   - ✅ L'associé apparaît dans la liste
   - ✅ La barre de progression affiche 50%
   - ✅ Le solde CCA est à 0€

#### Test 1.2 : Créer un second associé (Personne Morale)
1. Cliquer sur "Ajouter un associé"
2. Remplir :
   - Type : **Personne Morale**
   - Nom : **SCI Patrimoine**
   - Prénom : **Gestion**
   - Email : `contact@sci-patrimoine.fr`
   - Nombre de parts : **300**
   - Date d'entrée : Date du jour
3. Vérifier :
   - ✅ Pourcentage : **30%**
   - ✅ Total affiché : **80%** (en orange car < 100%)
   - ✅ 2 associés dans la liste
   - ✅ Icône différente pour Personne Morale (Building2)

#### Test 1.3 : Compléter à 100%
1. Ajouter un 3ème associé
2. Nombre de parts : **200**
3. Vérifier :
   - ✅ Total = **100%** (en vert)
   - ✅ Message de validation disparaît
   - ✅ Parts disponibles = **0**

#### Test 1.4 : Tenter de dépasser 100%
1. Essayer d'ajouter un 4ème associé avec 100 parts
2. Vérifier :
   - ✅ Message d'erreur affiché
   - ✅ Création bloquée
   - ✅ Le total reste à 100%

---

### Phase 2 : Modification d'Associés

#### Test 2.1 : Modifier un associé
1. Cliquer sur le bouton **Modifier** (icône Edit) d'un associé
2. Changer le nombre de parts de 500 à 400
3. Vérifier :
   - ✅ Pourcentage recalculé automatiquement : **40%**
   - ✅ Le formulaire se pré-remplit avec les données existantes
   - ✅ Les autres associés ne changent pas
   - ✅ Total mis à jour dans les stats

#### Test 2.2 : Modifier les coordonnées
1. Modifier un associé
2. Changer email et téléphone
3. Vérifier :
   - ✅ Nouvelles coordonnées affichées
   - ✅ Les liens mailto: et tel: fonctionnent

---

### Phase 3 : Compte Courant Associé (CCA)

#### Test 3.1 : Accéder à la page de détail
1. Cliquer sur l'**icône Dollar** ($) d'un associé
   OU cliquer sur la carte "Solde CCA"
   OU cliquer sur l'avatar
2. Vérifier :
   - ✅ Page de détail s'affiche
   - ✅ Informations complètes de l'associé
   - ✅ Solde CCA = 0€
   - ✅ Historique vide avec message d'accueil

#### Test 3.2 : Ajouter un APPORT
1. Cliquer sur "Nouveau mouvement"
2. Remplir :
   - Type : **APPORT**
   - Montant : **5000**
   - Libellé : `Apport en compte courant - Janvier 2025`
   - Date : Date du jour
   - Référence : `VIR-2025-001`
   - Notes : `Virement bancaire depuis compte personnel`
3. Vérifier :
   - ✅ Aperçu du nouveau solde : **+5 000,00 €**
   - ✅ Couleur verte pour l'aperçu
4. Valider
5. Vérifier :
   - ✅ Mouvement apparaît dans l'historique
   - ✅ Solde CCA mis à jour : **5 000,00 €**
   - ✅ Icône TrendingUp (flèche montante) verte
   - ✅ Stats mises à jour (Total Apports = 5 000€)

#### Test 3.3 : Ajouter un RETRAIT
1. Ajouter un nouveau mouvement
2. Type : **RETRAIT**
3. Montant : **2000**
4. Libellé : `Remboursement partiel`
5. Vérifier :
   - ✅ Aperçu du solde : **3 000,00 €** (5000 - 2000)
   - ✅ Couleur rouge pour l'aperçu
6. Valider
7. Vérifier :
   - ✅ Solde CCA : **3 000,00 €**
   - ✅ Icône TrendingDown (flèche descendante) rouge
   - ✅ Total Retraits = 2 000€
   - ✅ 2 mouvements dans l'historique (ordre chronologique inverse)

#### Test 3.4 : Ajouter des INTÉRÊTS
1. Ajouter un mouvement
2. Type : **INTERETS**
3. Montant : **150**
4. Libellé : `Intérêts trimestriels - T1 2025`
5. Vérifier :
   - ✅ Solde CCA : **3 150,00 €**
   - ✅ Icône DollarSign bleue
   - ✅ Stats correctes

#### Test 3.5 : Supprimer un mouvement
1. Passer la souris sur un mouvement
2. Bouton "Supprimer" (Trash) apparaît
3. Cliquer et confirmer
4. Vérifier :
   - ✅ Mouvement supprimé
   - ✅ Solde CCA recalculé automatiquement
   - ✅ Stats mises à jour

---

### Phase 4 : Visualisations et Stats

#### Test 4.1 : Barre de progression
1. Retourner sur `/associes`
2. Vérifier :
   - ✅ Barre de progression montre tous les associés
   - ✅ Chaque segment a une couleur différente
   - ✅ Hover sur un segment affiche le nom et %
   - ✅ Largeur proportionnelle au pourcentage

#### Test 4.2 : Cartes statistiques
1. Vérifier les 4 cartes en haut :
   - ✅ **Total Parts** : somme correcte
   - ✅ **Répartition** : pourcentage total (100% = vert, <100% = orange)
   - ✅ **Parts disponibles** : capital - total parts
   - ✅ **Associés actifs** : nombre correct

#### Test 4.3 : Cartes individuelles
1. Vérifier pour chaque associé :
   - ✅ Avatar coloré avec initiales ou icône
   - ✅ Nom et prénom affichés
   - ✅ Date d'entrée correcte
   - ✅ 3 mini-stats : Parts, Pourcentage, Solde CCA
   - ✅ Coordonnées (email + téléphone) si présentes
   - ✅ Couleur unique par associé

---

### Phase 5 : Suppression (Soft Delete)

#### Test 5.1 : Marquer un associé comme SORTI
1. Cliquer sur le bouton rouge "Supprimer" (Trash)
2. Confirmer l'action
3. Vérifier :
   - ✅ L'associé disparaît de la liste
   - ✅ Les stats sont recalculées
   - ✅ La barre de progression est mise à jour
   - ✅ Parts disponibles augmentent

Note : L'associé n'est pas supprimé de la BDD, juste marqué `statut = 'SORTI'`

---

### Phase 6 : Navigation et UX

#### Test 6.1 : Bouton "Retour"
1. Depuis la page de détail d'un associé
2. Cliquer sur "Retour aux associés"
3. Vérifier :
   - ✅ Retour à la liste
   - ✅ Données à jour

#### Test 6.2 : Navigation entre espaces
1. Changer de Space (si plusieurs SCI)
2. Vérifier :
   - ✅ Liste des associés change
   - ✅ Stats correctes pour le nouveau Space
   - ✅ Pas de mélange de données

#### Test 6.3 : Responsive Design
1. Redimensionner la fenêtre
2. Tester sur mobile (DevTools)
3. Vérifier :
   - ✅ Grilles s'adaptent (colonnes → lignes)
   - ✅ Formulaires lisibles
   - ✅ Boutons accessibles
   - ✅ Pas de dépassement horizontal

---

## 🐛 TESTS D'ERREURS

### Erreur 1 : Champs obligatoires manquants
1. Essayer de créer un associé sans nom
2. Vérifier : ✅ Message d'erreur affiché

### Erreur 2 : Capital social non défini
1. Créer une SCI sans capital social
2. Essayer d'ajouter un associé
3. Vérifier : ✅ Message clair "Capital social doit être défini"

### Erreur 3 : Montant CCA négatif
1. Essayer de retirer plus que le solde disponible
2. Vérifier : ✅ Le formulaire permet la saisie mais le solde peut être négatif (comportement accepté pour CCA)

---

## ✅ RÉSULTAT ATTENDU

Après tous ces tests, vous devriez avoir :
- ✅ 2-3 associés actifs
- ✅ Total = 100% du capital
- ✅ Plusieurs mouvements CCA sur au moins 1 associé
- ✅ Soldes CCA corrects
- ✅ Statistiques cohérentes
- ✅ Navigation fluide
- ✅ Interface moderne et responsive

---

## 🔥 TESTS BONUS

### Test Avancé 1 : Transaction Prisma
1. Ouvrir la console backend
2. Ajouter un mouvement CCA
3. Vérifier dans les logs :
   - ✅ Transaction démarrée
   - ✅ Mouvement créé
   - ✅ Solde associé mis à jour
   - ✅ Transaction committée

### Test Avancé 2 : Persistance des données
1. Créer des associés et mouvements
2. Redémarrer le backend
3. Rafraîchir le frontend
4. Vérifier : ✅ Toutes les données sont conservées

### Test Avancé 3 : Authentification
1. Se déconnecter
2. Essayer d'accéder à `/associes` directement
3. Vérifier : ✅ Redirection vers `/login`

---

## 📊 CHECKLIST FINALE

- [ ] Backend démarre sans erreur
- [ ] Frontend démarre sans erreur
- [ ] Migration Prisma réussie
- [ ] Création d'associés fonctionne
- [ ] Modification d'associés fonctionne
- [ ] Suppression (soft delete) fonctionne
- [ ] CCA : Ajout de mouvements fonctionne
- [ ] CCA : Suppression de mouvements fonctionne
- [ ] Calculs automatiques corrects (%, solde)
- [ ] Validation 100% fonctionne
- [ ] Navigation fluide entre les pages
- [ ] Responsive design OK
- [ ] Aucune erreur console

## 🎉 FIN DES TESTS

Si tous les tests passent, le module de gestion des associés est **OPÉRATIONNEL** ! 🚀
