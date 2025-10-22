# 🚀 GUIDE DE DÉMARRAGE RAPIDE - RAPPORTS PDF

## ⚡ Test en 5 minutes

### **Étape 1 : Vérifier l'installation** ✅

```bash
cd backend
npm list pdfkit
```

✅ Si `pdfkit` est listé, c'est bon !  
❌ Sinon : `npm install pdfkit`

---

### **Étape 2 : Lancer les serveurs** 🚀

**Terminal 1 - Backend**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```

---

### **Étape 3 : Préparer les données** 📊

**Option A : Si vous avez déjà des données**
- Assurez-vous d'avoir au moins 1 SCI avec quelques biens
- Passez directement à l'étape 4

**Option B : Créer des données de test rapide**

1. Connectez-vous à votre SCI ou créez-en une
2. Ajoutez 2-3 biens (valeurs au choix)
3. Ajoutez 1-2 locataires
4. Créez quelques baux
5. Générez quelques quittances et marquez-les comme payées

💡 **Astuce** : Utilisez l'année en cours pour voir des données dans le rapport !

---

### **Étape 4 : Générer votre premier rapport** 📄

1. **Aller sur la page Rapports**
   - Ouvrir `http://localhost:5173/rapports` dans votre navigateur
   - Ou cliquer sur "Rapports" dans le menu

2. **Créer un nouveau rapport**
   - Cliquer sur "Nouveau rapport"
   - Remplir :
     ```
     Nom : Mon Premier Rapport
     Année : 2024
     Type : Complet
     ✓ Générer le PDF immédiatement
     ```
   - Cliquer "Créer"

3. **Attendre la génération**
   - Un loader apparaît pendant ~2-5 secondes
   - Le rapport passe en statut "Généré" ✅

4. **Télécharger le PDF**
   - Cliquer sur l'icône de téléchargement (⬇️)
   - Le PDF s'ouvre ou se télécharge

---

### **Étape 5 : Explorer le PDF** 🔍

Ouvrez le PDF et naviguez à travers :

1. **Page 1** : Belle couverture avec votre nom de SCI
2. **Page 2** : Table des matières
3. **Page 3** : Synthèse avec 4 KPIs colorés
4. **Pages suivantes** : 
   - Analyse patrimoniale
   - Revenus mensuels (graphique)
   - Charges par catégorie
   - Cashflow
   - Performance
   - Associés (si SCI)

✅ **Félicitations !** Vous avez généré votre premier rapport professionnel !

---

## 🧪 Test automatique (optionnel)

Si vous voulez tester via un script :

```bash
cd backend
node test-rapport-pdf.js
```

Le script :
- Trouve automatiquement votre SCI
- Collecte les données
- Génère le PDF
- Affiche le chemin du fichier

---

## 🎨 Personnalisation

### **Modifier les infos de la SCI**

Fichier : `backend/src/utils/pdf/pdfConfig.js`

```javascript
company: {
  name: 'VOTRE SCI',          // ← Modifiez ici
  address: 'Votre adresse',   // ← Et ici
  postalCode: '75000',
  city: 'Paris',
  phone: '01 23 45 67 89',
  siren: '123456789',
}
```

Relancez le backend après modification.

---

## 📊 Ajouter des données de test

### **Via l'interface web** (recommandé)

1. **Biens** : Allez sur `/biens` → Ajoutez 3 biens variés
2. **Locataires** : `/locataires` → Ajoutez 2-3 locataires
3. **Baux** : Associez locataires aux biens
4. **Quittances** : Générez des quittances et marquez-les payées
5. **Factures** : Ajoutez quelques factures (entretien, travaux)
6. **Prêts** : Si vous avez des emprunts

### **Via Prisma Studio** (avancé)

```bash
cd backend
npx prisma studio
```

Ajoutez des données directement dans la base.

---

## 🐛 Dépannage

### **Erreur "pdfkit not found"**
```bash
cd backend
npm install pdfkit
```

### **Dossier uploads manquant**
Créez-le manuellement :
```bash
mkdir -p backend/uploads/rapports
```

### **PDF vide ou erreur**
- Vérifiez que vous avez des données dans l'année sélectionnée
- Regardez les logs du terminal backend
- Testez avec l'année en cours

### **Frontend ne charge pas la page**
- Vérifiez que les routes sont montées dans `server.js`
- Vérifiez que `RapportsPage.jsx` existe
- Redémarrez les serveurs

### **"Space not found"**
- Assurez-vous d'être connecté
- Vérifiez que vous avez au moins un espace (perso ou SCI)
- Rechargez la page

---

## 💡 Cas d'usage rapides

### **Assemblée Générale demain matin** 🏃
1. Créer rapport type COMPLET
2. Année en cours
3. Générer + télécharger
4. Imprimer en recto-verso
5. **Prêt !**

### **Comptable demande un récap** 📊
1. Rapport type FISCAL
2. Année fiscale concernée
3. Envoyer par email

### **Investisseurs veulent des chiffres** 💼
1. Rapport type SIMPLIFIÉ
2. Focus sur la synthèse (page 3)
3. Extrait ou PDF complet

---

## 🎯 Prochaines étapes

Une fois que votre premier rapport fonctionne :

1. **Testez avec plus de données** pour voir tous les graphiques
2. **Créez des rapports pour plusieurs années** pour comparer
3. **Partagez avec vos associés** pour feedback
4. **Explorez les autres modules** (Projections, Business Plans...)

---

## 📞 Besoin d'aide ?

Consultez :
- `RAPPORT_PDF_AMELIORE.md` : Documentation complète
- `CHECKLIST_TEST_RAPPORTS.md` : Liste de tests détaillée
- Console du navigateur (F12) : Erreurs frontend
- Terminal backend : Erreurs serveur

---

**Bon test ! 🎉**

Si le PDF se génère correctement, vous êtes prêt pour la production !
