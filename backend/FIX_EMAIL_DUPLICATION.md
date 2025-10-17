# 🔴 PROBLÈME : Duplication d'email

## Diagnostic

Votre base de données SQLite n'est pas synchronisée avec le schéma Prisma actuel.

**Cause :** 
- La migration existante (`20251009194017_init`) utilise l'ANCIEN modèle (table `User`, `Compte`)
- Votre `schema.prisma` actuel utilise le NOUVEAU modèle Space (table `users`, `Space`, `SpaceMember`)
- La contrainte `UNIQUE` sur l'email n'est donc pas appliquée correctement dans la vraie base

## 🔧 Solutions

### Option 1 : Reset complet (RECOMMANDÉ si pas de données importantes)

**Avantage :** Propre et rapide, garantit une base cohérente
**Inconvénient :** Perd toutes les données existantes

**Exécuter :**
```powershell
# Sur Windows PowerShell
.\reset-database.ps1

# OU sur cmd
reset-database.bat
```

**Ce qui est fait automatiquement :**
1. ✅ Suppression de l'ancienne base `dev.db`
2. ✅ Suppression des anciennes migrations
3. ✅ Création d'une nouvelle migration avec le modèle Space
4. ✅ Génération du client Prisma
5. ✅ Contrainte UNIQUE sur l'email appliquée

### Option 2 : Migration manuelle (si vous avez des données à conserver)

**Étape 1 - Sauvegarder la base actuelle :**
```powershell
Copy-Item prisma\dev.db prisma\dev.db.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')
```

**Étape 2 - Réinitialiser les migrations :**
```powershell
# Supprimer les migrations
Remove-Item -Recurse -Force prisma\migrations

# Créer une nouvelle migration
npx prisma migrate dev --name init_space_model
```

**Étape 3 - Vérifier la structure :**
```powershell
npx prisma studio
```

### Option 3 : Forcer la synchronisation du schéma (développement uniquement)

**⚠️ ATTENTION : Peut causer des pertes de données !**

```powershell
npx prisma db push --force-reset
npx prisma generate
```

## ✅ Vérification post-migration

Après avoir appliqué une solution, vérifiez que tout fonctionne :

1. **Tester la contrainte unique :**
```powershell
# Démarrer le serveur
npm run dev
```

2. **Essayer de créer 2 comptes avec le même email**
   - Le 2e devrait échouer avec l'erreur "Cet email est déjà utilisé"

3. **Vérifier dans Prisma Studio :**
```powershell
npx prisma studio
```
   - Aller dans la table `users`
   - Vérifier qu'il n'y a pas de doublons d'email

## 📝 Remarques importantes

- Le nouveau modèle Space est incompatible avec l'ancien modèle Compte
- Si vous avez des données de production, créez un script de migration des données
- La contrainte `@unique` dans Prisma doit TOUJOURS être reflétée dans la base de données
- SQLite nécessite une migration pour appliquer les contraintes

## 🎯 Recommandation

**Pour votre cas (développement / pas de données prod) :** 
👉 **Utilisez l'Option 1** (reset complet) - C'est le plus simple et le plus sûr.
