# 📋 Ajout des charges aux biens

## 🎯 Nouveaux champs ajoutés

Deux nouveaux champs optionnels ont été ajoutés au modèle Bien :

1. **Assurance mensuelle (€/mois)** 
   - Assurance PNO (Propriétaire Non Occupant)
   - GLI (Garantie Loyers Impayés)
   - Ou toute autre assurance liée au bien

2. **Taxe foncière annuelle (€/an)**
   - Montant annuel de la taxe foncière

## 💰 Impact sur le cash-flow

Ces charges sont **automatiquement déduites** du calcul du cash-flow dans le Dashboard :

```
Cash-flow = Loyers - Mensualités de prêt - Assurances - Taxes foncières
```

### Exemple concret :
- Loyers annuels : **18 000 €**
- Mensualités de prêt : **-12 000 €**
- Assurances (45€/mois) : **-540 €**
- Taxe foncière : **-1 200 €**
- **Cash-flow net : 4 260 €/an**

## 🚀 Installation

### Étape 1 : Appliquer la migration
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### Étape 2 : Redémarrer le serveur
```bash
# Arrêtez le serveur (Ctrl+C)
npm run dev
```

### Étape 3 : Actualiser le frontend
Actualisez simplement la page (F5)

## ✅ Vérification

Lance ce script pour vérifier que tout est OK :
```bash
node scripts/check-migration.js
```

## 📝 Utilisation

### À la création d'un bien
Dans le formulaire "Ajouter un bien", une nouvelle section **"Charges annuelles"** apparaît avec :
- Champ "Assurance mensuelle (€/mois)"
- Champ "Taxe foncière annuelle (€/an)"

Ces champs sont **optionnels** - vous pouvez les laisser vides.

### Sur le Dashboard
Le calcul du cash-flow affichera maintenant :
```
+ Loyers annuels
─────────────────
- Mensualités de prêt
- Assurances (PNO, GLI...)
- Taxes foncières
─────────────────
= Cash-flow net
```

## 🔄 Pour les biens existants

Pour ajouter ces informations aux biens déjà créés :
1. Cliquez sur un bien
2. Cliquez sur "Modifier"
3. Remplissez les nouveaux champs "Charges annuelles"
4. Enregistrez

## 📊 Résultat attendu

Le **taux de rentabilité net** sera maintenant **plus précis** car il prend en compte toutes les charges réelles du bien, pas seulement les mensualités de prêt.

---

**🎉 Vous avez maintenant un calcul de cash-flow complet et réaliste !**
