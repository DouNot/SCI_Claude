# ✅ GUIDE DE TEST - CORRECTIONS BUGS

## 🚀 Démarrage rapide

### 1️⃣ Redémarrer les serveurs

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Attendre que les deux serveurs soient démarrés :
- Backend : `http://localhost:3000`
- Frontend : `http://localhost:5173`

---

## 🧪 Tests à effectuer (5 minutes)

### ✅ TEST 1 : Création locataire depuis BailForm (BUG #1)

**Avant** : Erreur 401 Unauthorized  
**Après** : ✅ Devrait fonctionner

**Étapes** :
1. Se connecter à l'application
2. Aller sur **Biens** → Cliquer sur un bien
3. Descendre à la section **Locataire actuel**
4. Cliquer sur **"Ajouter un locataire"**
5. Dans le formulaire de bail, à côté de "Locataire", cliquer sur le bouton **"+"**
6. Remplir le formulaire de création locataire
7. Cliquer sur **"Créer"**

**Résultat attendu** : 
- ✅ Le locataire est créé
- ✅ Il apparaît dans la liste déroulante
- ✅ Pas d'erreur 401 dans la console

---

### ✅ TEST 2 : Modification bail (BUG #2)

**Avant** : Ouvrait le formulaire locataire  
**Après** : ✅ Ouvre le formulaire bail

**Étapes** :
1. Aller sur **Biens** → Cliquer sur un bien avec un bail actif
2. Dans la section **Locataire actuel**, cliquer sur l'icône **crayon** (✏️)

**Résultat attendu** :
- ✅ Le formulaire de **modification du bail** s'ouvre
- ✅ On peut modifier le loyer et les charges
- ❌ Ce n'est PAS le formulaire locataire qui s'ouvre

---

### ✅ TEST 3 : Couleurs page login (BUG #3)

**Avant** : Couleurs vertes  
**Après** : ✅ Couleurs bleu-violet

**Étapes** :
1. Se déconnecter
2. Observer la page de login

**Résultat attendu** :
- ✅ Logo : Gradient bleu → violet
- ✅ Titre "SCI Manager" : Gradient bleu → violet
- ✅ Bouton "Se connecter" : Gradient bleu → violet
- ❌ Plus de vert nulle part

---

### ✅ TEST 4 : Suppression locataire (BUG #4)

**Avant** : Erreur 500  
**Après** : ✅ Suppression OK ou erreur claire si bail actif

**Étapes - Cas 1 : Locataire SANS bail actif**
1. Aller sur **Locataires**
2. Créer un locataire de test (sans lui attribuer de bail)
3. Cliquer sur la corbeille pour le supprimer
4. Confirmer

**Résultat attendu** :
- ✅ Locataire supprimé avec succès
- ✅ Message de confirmation
- ✅ Plus d'erreur 500

**Étapes - Cas 2 : Locataire AVEC bail actif**
1. Aller sur **Locataires**
2. Essayer de supprimer un locataire qui a un bail actif

**Résultat attendu** :
- ❌ Suppression refusée
- ✅ Message d'erreur clair : "Impossible de supprimer un locataire avec un bail actif"
- ✅ Pas d'erreur 500

---

### ✅ TEST 5 : Suppression prêt (BUG #5)

**Avant** : Erreur 500  
**Après** : ✅ Suppression OK

**Étapes** :
1. Aller sur **Biens** → Détail d'un bien
2. Descendre à la section **Prêts immobiliers**
3. Cliquer sur la corbeille d'un prêt
4. Confirmer

**Résultat attendu** :
- ✅ Prêt supprimé avec succès
- ✅ Il disparaît de la liste
- ✅ Plus d'erreur 500

---

### ✅ TEST 6 : Ajout charge (BUG #6)

**Avant** : Erreur 500  
**Après** : ✅ Création OK

**Étapes** :
1. Aller sur **Charges** (dans le menu)
2. Cliquer sur **"Ajouter une charge"**
3. Remplir le formulaire :
   - Type : Assurance PNO
   - Libellé : Test charge
   - Montant : 50
   - Fréquence : Mensuelle
   - Date début : Aujourd'hui
   - Bien : Sélectionner un bien
4. Cliquer sur **"Créer"**

**Résultat attendu** :
- ✅ Charge créée avec succès
- ✅ Elle apparaît dans la liste
- ✅ Plus d'erreur 500

---

## 📊 Checklist rapide

Après avoir effectué tous les tests :

- [ ] ✅ Création locataire fonctionne (TEST 1)
- [ ] ✅ Modification bail ouvre le bon formulaire (TEST 2)
- [ ] ✅ Couleurs login harmonisées (TEST 3)
- [ ] ✅ Suppression locataire gérée (TEST 4)
- [ ] ✅ Suppression prêt fonctionne (TEST 5)
- [ ] ✅ Ajout charge fonctionne (TEST 6)

---

## 🐛 En cas de problème

### Si un test échoue :

1. **Vérifier les logs backend**
   ```bash
   # Dans le terminal backend, regarder les erreurs
   ```

2. **Vérifier la console navigateur**
   ```
   F12 → Console → Regarder les erreurs
   ```

3. **Vérifier que le token est présent**
   ```
   F12 → Application → Local Storage → Vérifier 'token'
   ```

4. **Redémarrer les serveurs**
   ```bash
   Ctrl+C dans chaque terminal
   Puis relancer npm start / npm run dev
   ```

---

## 🎯 Résultat attendu final

Si tous les tests passent :
- ✅ Application stable
- ✅ Toutes les fonctionnalités critiques fonctionnent
- ✅ Messages d'erreur clairs
- ✅ Interface cohérente

**→ L'application est prête pour la phase suivante !** 🚀

---

## 📞 Besoin d'aide ?

Si un test échoue :
1. Noter le numéro du test qui échoue
2. Copier le message d'erreur (console ou backend)
3. Vérifier le fichier `RAPPORT_CORRECTIONS_BUGS.md` pour plus de détails

---

**Durée estimée** : 5-10 minutes  
**Niveau** : Facile  
**Prérequis** : Backend et Frontend démarrés
