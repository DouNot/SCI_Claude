# 🚀 GUIDE DÉMARRAGE RAPIDE - BUSINESS PLANS BANCAIRES

## ⚡ Créer votre premier business plan en 3 minutes

### **Étape 1 : Vérifier que tout fonctionne** ✅

**Backend + Frontend doivent être lancés**

Terminal 1 (Backend) :
```bash
cd backend
npm start
```

Terminal 2 (Frontend) :
```bash
cd frontend
npm run dev
```

✅ Si les deux serveurs sont up, passez à l'étape 2

---

### **Étape 2 : Accéder à la page Business Plans** 💼

1. Ouvrir `http://localhost:5173/business-plans`
2. Ou cliquer sur "Business Plans" dans la sidebar (icône 💼)

---

### **Étape 3 : Créer votre premier business plan** 📝

1. **Cliquer** sur "Nouveau business plan"

2. **Remplir le formulaire** :
   ```
   Nom du projet : Acquisition immeuble Paris
   Description : Achat d'un immeuble de 5 lots
   Type : Acquisition
   Montant demandé : 500000
   Durée : 240 mois (20 ans)
   Taux estimé : 3.5
   Banque : Crédit Agricole
   Contact : M. Dupont
   ✓ Générer le PDF immédiatement
   ```

3. **Cliquer** "Créer"

4. **Attendre** ~3-5 secondes (génération PDF)

5. **Télécharger** le PDF en cliquant sur l'icône ⬇️

---

### **Étape 4 : Explorer le PDF généré** 📄

Ouvrir le PDF et vérifier :

✅ **Page 1** : Couverture professionnelle  
✅ **Page 2** : Sommaire exécutif avec 4 KPIs  
✅ **Page 3** : Présentation de votre SCI  
✅ **Page 4** : Détails du projet  
✅ **Page 5** : Situation patrimoniale  
✅ **Page 6** : Projections sur 10 ans  
✅ **Page 7** : Ratios financiers  
✅ **Page 8** : Garanties  
✅ **Page 9** : Conclusion et signature

**Félicitations ! 🎉**  
Vous venez de créer votre premier business plan bancaire professionnel !

---

## 🎯 Workflows typiques

### **Workflow 1 : Demande de prêt classique** 🏦

```
1. Créer business plan
2. Générer PDF
3. Relire et vérifier
4. Télécharger
5. Marquer "Envoyé" après transmission
6. Attendre retour banque
7. Marquer "Validé" ou "Rejeté"
```

### **Workflow 2 : Comparaison de plusieurs scénarios** 📊

```
1. Créer BP #1 : 20 ans à 3.5%
2. Créer BP #2 : 25 ans à 3.8%
3. Créer BP #3 : 15 ans à 3.2%
4. Comparer les cashflows
5. Choisir le meilleur
6. Envoyer à la banque
```

### **Workflow 3 : Plusieurs banques** 🏦🏦🏦

```
1. Créer 1 business plan générique
2. Dupliquer (ou créer) pour chaque banque
3. Personnaliser le nom de la banque
4. Générer tous les PDFs
5. Envoyer à chaque banque
6. Suivre les statuts séparément
```

---

## 💡 Astuces et conseils

### **Pour un dossier solide** 💪

1. **Soyez réaliste** sur les montants
2. **Prévoyez une marge** (+10-15%)
3. **Vérifiez les ratios** :
   - Taux d'endettement < 35%
   - LTV < 70%
4. **Relisez** avant d'envoyer
5. **Joignez les justificatifs** nécessaires

### **Pour gagner du temps** ⚡

- Créez un template de description à réutiliser
- Sauvegardez vos hypothèses standards
- Générez immédiatement à la création
- Utilisez le statut pour suivre l'avancement

### **Pour maximiser vos chances** 🎯

- Présentez un patrimoine existant rentable
- Montrez un historique de cashflow positif
- Proposez des garanties solides
- Restez cohérent dans vos chiffres
- Consultez un courtier pour le taux

---

## 📋 Checklist avant envoi

### **Vérifications essentielles** ✓

- [ ] Toutes les informations sont exactes
- [ ] Montant et durée sont réalistes
- [ ] Taux estimé est cohérent avec le marché
- [ ] Description claire et sans fautes
- [ ] PDF généré et téléchargé
- [ ] Ratios acceptables (< 35% endettement, < 70% LTV)
- [ ] Banque et contact renseignés

### **Documents à joindre** 📎

- [ ] Business Plan PDF
- [ ] Statuts de la SCI
- [ ] Extrait Kbis (< 3 mois)
- [ ] 3 derniers bilans (si IS)
- [ ] Avis d'imposition des associés
- [ ] Justificatifs de revenus locatifs
- [ ] Compromis de vente (si acquisition)
- [ ] Diagnostics techniques
- [ ] Justificatifs d'identité

---

## 🔧 Dépannage rapide

### **Le PDF ne se génère pas** ❌

**Solutions** :
1. Vérifier que vous avez au moins 1 bien dans la SCI
2. Regarder les logs du terminal backend
3. Vérifier que le dossier `uploads/business-plans/` existe
4. Recharger la page et réessayer

### **Les chiffres sont bizarres** 🤔

**Solutions** :
1. Vérifier que les valeurs des biens sont à jour
2. Vérifier que les baux sont bien actifs
3. Vérifier les prêts existants
4. Recalculer en modifiant puis sauvegardant

### **Je ne vois pas le menu** 👀

**Solutions** :
1. Vérifier que vous êtes dans un espace (pas déconnecté)
2. Recharger la page (F5)
3. Vider le cache du navigateur
4. Vérifier que les serveurs sont lancés

---

## 🎓 Exemples de projets

### **Exemple 1 : Petit projet** 💰

```
Type : Travaux
Montant : 30 000€
Durée : 7 ans (84 mois)
Taux : 3.2%
Mensualité : ~396€
Objectif : Rénovation d'un appartement
```

### **Exemple 2 : Projet moyen** 💼

```
Type : Acquisition
Montant : 250 000€
Durée : 20 ans (240 mois)
Taux : 3.5%
Mensualité : ~1 442€
Objectif : Achat d'un immeuble de rapport
```

### **Exemple 3 : Gros projet** 🏢

```
Type : Acquisition
Montant : 800 000€
Durée : 25 ans (300 mois)
Taux : 3.8%
Mensualité : ~4 104€
Objectif : Achat d'un immeuble commercial
```

---

## 💼 Conseils par type de projet

### **Pour une ACQUISITION** 🏢

- Apport : Minimum 10-20%
- Garantie : Hypothèque sur le bien
- Durée : 15-25 ans
- Taux : 3.0-4.5%
- Documents : Compromis de vente, diagnostics

### **Pour un REFINANCEMENT** 🔄

- Objectif : Baisser le taux ou les mensualités
- Garantie : Hypothèque existante transférée
- Durée : Identique ou plus longue
- Taux : Au moins -0.5% pour être intéressant
- Documents : Tableaux d'amortissement actuels

### **Pour des TRAVAUX** 🔨

- Montant : Devis précis et détaillés
- Garantie : Hypothèque ou caution
- Durée : 5-10 ans
- Taux : 3.0-4.0%
- Documents : Devis, photos avant, plans

---

## 📞 Support et ressources

### **En cas de blocage**

1. Consulter `BUSINESS_PLAN_DOCUMENTATION.md` (doc complète)
2. Vérifier les logs backend (terminal)
3. Vérifier la console navigateur (F12)
4. Tester avec des données simples d'abord

### **Ressources utiles**

- 📚 Documentation complète : `BUSINESS_PLAN_DOCUMENTATION.md`
- 🧪 Tests : Utiliser des données fictives d'abord
- 💡 Exemples : Voir section ci-dessus

---

## 🎉 Prochaines étapes

Une fois votre premier business plan créé avec succès :

1. ✅ **Testez avec vos vraies données**
2. ✅ **Créez plusieurs scénarios**
3. ✅ **Présentez à votre banque**
4. ✅ **Suivez l'avancement** avec les statuts
5. ✅ **Partagez avec vos associés**

---

**Bonne chance pour votre financement ! 💼🚀**

Le business plan professionnel est un atout majeur pour convaincre votre banquier !

---

**Temps de lecture** : 5 minutes  
**Temps de création d'un BP** : 2-3 minutes  
**Niveau** : Débutant ✅
