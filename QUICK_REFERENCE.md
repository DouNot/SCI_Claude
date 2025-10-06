# ⚡ QUICK REFERENCE - Migration Loyers

## 🎯 En bref

**Problème résolu :** Le loyer était dupliqué entre `Bien` et `Bail`, créant des incohérences.

**Solution :** Le loyer appartient maintenant uniquement au `Bail` (source unique de vérité).

---

## 📦 Fichiers modifiés

### Frontend (5)
- `BienForm.jsx` - Pas de loyer demandé
- `BienDetailPage.jsx` - Loyer depuis bail actif
- `BiensCard.jsx` - Statut calculé
- `BiensTable.jsx` - Loyer depuis bail actif
- `DashboardPage.jsx` - Calculs avec loyers des baux

### Backend (3)
- `schema.prisma` - Retrait loyerHC/charges
- `bienController.js` - Calcul statut + bail actif
- `bailController.js` - MAJ statut bien auto

---

## 🚀 Commandes rapides

```bash
# Migration
cd backend
npx prisma migrate dev --name remove_loyer_from_bien
npx prisma generate

# Redémarrage
cd backend && npm run dev
cd frontend && npm run dev  # autre terminal
```

---

## ✅ Tests essentiels

1. **Dashboard** → Loyers affichés ✓
2. **Liste biens** → Statuts corrects (Loué/Vacant) ✓
3. **Détails bien** → Loyer actuel + locataire ✓
4. **Créer bien** → Pas de loyer demandé ✓
5. **Créer bail** → Loyer demandé + bien → Loué ✓

---

## 🆘 Problème courant

**Les loyers n'apparaissent pas ?**
→ Vérifiez qu'il existe des baux avec `statut = 'ACTIF'`

**Statut incorrect ?**
→ Redémarrez le backend, rechargez la page

**Erreur migration ?**
→ Fermez tout, relancez la migration

---

## 📊 Nouvelle structure

```
BIEN
├─ Pas de loyer ❌
├─ Statut calculé auto ✓
└─ Lecture depuis bail actif ✓

BAIL (source unique)
├─ loyerHC ✓
├─ charges ✓
└─ statut: ACTIF/TERMINE ✓
```

---

## 💡 Ce qui change pour l'utilisateur

**AVANT :**
- Créer bien → demande loyer
- Statut manuel (peut être faux)
- Incohérences bien ≠ bail

**APRÈS :**
- Créer bien → pas de loyer
- Statut automatique (toujours juste)
- Une seule source : le bail

---

## 📚 Documentation complète

- `GUIDE_APPLICATION.md` - Guide étape par étape
- `MIGRATION_INSTRUCTIONS.md` - Détails techniques
- `RESUME_MODIFICATIONS.md` - Récapitulatif complet
