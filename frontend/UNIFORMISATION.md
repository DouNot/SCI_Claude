# 🎨 GUIDE D'UNIFORMISATION - SCI MANAGER

## Style Unifié (Basé sur la page Locataires)

### ✅ Couleurs à utiliser PARTOUT

```jsx
// FONDS
bg-[#0a0a0a]      // Fond principal (TOUTES les pages)
bg-[#1a1a1a]      // Cartes et conteneurs
bg-[#0f0f0f]      // Inputs et champs

// TEXTES
text-white        // Titres principaux
text-gray-400     // Sous-titres et descriptions  
text-gray-500     // Labels de formulaires
text-gray-600     // Footer

// BORDURES
border-gray-800   // Bordures de cartes
border-gray-700   // Bordures d'inputs

// BOUTON PRINCIPAL (UNIQUE - Bleu-Violet)
className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold transition shadow-lg"

// BADGES DE STATUT
Actif:    bg-green-500/20 border-green-500/30 text-green-400
Inactif:  bg-gray-500/20 border-gray-500/30 text-gray-400  
Attention: bg-yellow-500/20 border-yellow-500/30 text-yellow-400
Erreur:   bg-red-500/20 border-red-500/30 text-red-400

// BOUTONS SECONDAIRES
Bleu:  bg-blue-600 hover:bg-blue-500
Rouge: bg-red-500/20 hover:bg-red-500/30 text-red-400
Gris:  border-gray-700 hover:bg-gray-800
```

---

## 🔄 Pages à uniformiser

### ✅ DÉJÀ FAIT
- [x] LoginPage
- [x] SignupPage
- [x] ProjectionsPage  
- [x] ProjectionDetailPage

### 🔄 À UNIFORMISER
- [ ] DashboardPage
- [ ] BiensPage
- [ ] BienDetailPage
- [ ] LocatairesPage ← MODÈLE DE RÉFÉRENCE
- [ ] BauxPage
- [ ] AssociesPage
- [ ] AssocieDetailPage
- [ ] ChargesPage
- [ ] EvenementsFiscauxPage
- [ ] ContactsPage
- [ ] PretsPage
- [ ] TravauxPage
- [ ] FacturesPage
- [ ] DocumentsPage
- [ ] MembersPage
- [ ] ParametresPage
- [ ] RapportsPage
- [ ] ComptesPage

---

## 📝 Template Standard (à copier pour chaque page)

```jsx
import { Plus, Search } from 'lucide-react';

function MaPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        
        {/* Header - FORMAT STANDARD */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Titre de la Page
            </h1>
            <p className="text-gray-400">
              Description de la page
            </p>
          </div>

          <button className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold transition shadow-lg">
            <Plus className="h-5 w-5" />
            Ajouter
          </button>
        </div>

        {/* Barre de recherche + Filtres - FORMAT STANDARD */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold">
              Tous
            </button>
            <button className="px-4 py-3 bg-[#1a1a1a] border border-gray-800 text-gray-400 rounded-xl hover:bg-gray-800 transition">
              Actifs
            </button>
            <button className="px-4 py-3 bg-[#1a1a1a] border border-gray-800 text-gray-400 rounded-xl hover:bg-gray-800 transition">
              Anciens
            </button>
          </div>
        </div>

        {/* Cartes - FORMAT STANDARD */}
        <div className="space-y-4">
          <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 hover:border-blue-500/50 p-6 transition cursor-pointer group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition">
                  Nom de l'élément
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Description
                </p>

                <div className="flex items-center gap-4 mt-4">
                  <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg text-xs font-semibold">
                    Actif
                  </div>
                  <span className="text-sm text-gray-400">
                    Info complémentaire
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-xl transition">
                  {/* Icône */}
                </button>
                <button className="p-2 hover:bg-red-500/20 text-red-400 rounded-xl transition">
                  {/* Icône */}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
```

---

## ❌ À SUPPRIMER (variations de couleurs)

```jsx
// ❌ PLUS DE GRADIENT VERT-BLEU
from-green-400 to-blue-400

// ❌ PLUS DE GRADIENT VERT
from-green-600 to-blue-600

// ❌ PLUS DE ROSE/MAGENTA
from-pink-500 to-purple-500

// ✅ UNIQUEMENT BLEU-VIOLET
from-blue-600 to-purple-600
```

---

## 🎯 Checklist pour chaque page

Avant de valider une page, vérifier :

- [ ] Fond principal en `bg-[#0a0a0a]`
- [ ] Titre en `text-white` (PAS de gradient)
- [ ] Sous-titre en `text-gray-400`
- [ ] Bouton principal en gradient bleu-violet
- [ ] Cartes en `bg-[#1a1a1a]` avec `border-gray-800`
- [ ] Inputs en `bg-[#0f0f0f]` avec `border-gray-700`
- [ ] Badges avec les bonnes couleurs (vert = actif, rouge = danger)
- [ ] Pas de fond blanc nulle part
- [ ] Hover cohérent : `hover:border-blue-500/50` sur les cartes

---

## 🚀 Prochaines étapes

1. Je vais uniformiser TOUTES les pages une par une
2. Chaque page aura exactement le même style
3. Cohérence totale dans toute l'application

**Dis-moi si tu es d'accord et je commence l'uniformisation complète !**
