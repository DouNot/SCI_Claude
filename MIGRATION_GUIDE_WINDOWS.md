# 🪟 Guide Migration - Version Windows

## 🚀 Méthode Ultra-Simple (Recommandée)

### Option 1 : Double-clic sur le fichier .bat

1. **Corriger npm (si nécessaire)**
   ```
   Double-clic sur : fix-npm.bat
   ```

2. **Lancer la migration**
   ```
   Double-clic sur : migrate-to-spaces.bat
   ```

C'est tout ! Le script fait tout automatiquement. ✨

---

### Option 2 : PowerShell (Plus moderne)

1. **Ouvrir PowerShell en tant qu'administrateur**
   - Clic droit sur PowerShell → "Exécuter en tant qu'administrateur"

2. **Autoriser l'exécution de scripts**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Lancer la migration**
   ```powershell
   cd C:\Users\orous\OneDrive\Bureau\Projet_Dev\SCI_Claude\backend
   .\migrate-to-spaces.ps1
   ```

---

## 📝 Commandes PowerShell (Si vous voulez le faire manuellement)

### 1. Corriger le problème npm

```powershell
# Créer le dossier npm
New-Item -Path "$env:APPDATA\npm" -ItemType Directory -Force

# Vérifier
Test-Path "$env:APPDATA\npm"

# Réinstaller npm
npm install -g npm@latest
```

### 2. Naviguer vers le dossier

```powershell
cd C:\Users\orous\OneDrive\Bureau\Projet_Dev\SCI_Claude\backend
```

### 3. Sauvegarde

```powershell
Copy-Item prisma\dev.db prisma\dev.db.backup
```

### 4. Remplacer le schéma

```powershell
Copy-Item prisma\schema-new.prisma prisma\schema.prisma -Force
```

### 5. Générer le client Prisma

```powershell
npx prisma generate
```

### 6. Appliquer les changements

```powershell
npx prisma db push
```

### 7. Migrer les données

```powershell
node scripts\migrate-to-spaces.js
```

### 8. Vérifier

```powershell
npx prisma studio
```

---

## 🔧 Commandes Utiles Windows

### Copier un fichier
```powershell
Copy-Item source.txt destination.txt
```

### Créer un dossier
```powershell
New-Item -Path "chemin\dossier" -ItemType Directory
```

### Vérifier si un fichier existe
```powershell
Test-Path "chemin\fichier.txt"
```

### Lister les fichiers
```powershell
Get-ChildItem
# ou simplement
dir
```

### Naviguer
```powershell
cd chemin\vers\dossier
```

### Remonter d'un dossier
```powershell
cd ..
```

---

## ⚠️ Si le script .bat ne fonctionne pas

### Problème : "Prisma n'est pas reconnu"

**Solution :**
```powershell
# Installer Prisma globalement
npm install -g prisma

# Ou utiliser npx (recommandé)
npx prisma generate
```

### Problème : "node n'est pas reconnu"

**Solution :**
```powershell
# Vérifier que Node.js est installé
node --version

# Si pas installé, télécharger : https://nodejs.org
```

### Problème : "Accès refusé"

**Solution :**
```powershell
# Ouvrir PowerShell en tant qu'administrateur
# Clic droit → "Exécuter en tant qu'administrateur"
```

---

## 🎯 Ordre Recommandé

1. ✅ **Corriger npm** (si besoin)
   ```
   Double-clic : fix-npm.bat
   ```

2. ✅ **Lancer la migration**
   ```
   Double-clic : migrate-to-spaces.bat
   ```

3. ✅ **Vérifier dans Prisma Studio**
   ```powershell
   npx prisma studio
   ```

4. ✅ **Tester l'application**
   ```powershell
   npm run dev
   ```

---

## 📊 Checklist Visuelle

```
[ ] fix-npm.bat exécuté
[ ] migrate-to-spaces.bat exécuté
[ ] Aucune erreur affichée
[ ] Prisma Studio ouvert
[ ] Tables visibles : User, Space, SpaceMember, Associe
[ ] Données migrées correctement
[ ] Application lancée
[ ] Connexion fonctionne
```

---

## 🆘 En Cas de Problème

### Restaurer la sauvegarde

```powershell
cd C:\Users\orous\OneDrive\Bureau\Projet_Dev\SCI_Claude\backend
Copy-Item prisma\dev.db.backup prisma\dev.db -Force
```

### Voir les logs d'erreur

```powershell
node scripts\migrate-to-spaces.js > migration.log 2>&1
notepad migration.log
```

### Réinitialiser complètement

```powershell
# Restaurer l'ancien schéma
Copy-Item prisma\schema-old.prisma prisma\schema.prisma -Force

# Restaurer la base
Copy-Item prisma\dev.db.backup prisma\dev.db -Force

# Régénérer
npx prisma generate
```

---

## 🎉 Succès !

Si tout fonctionne :

```
✅ Migration terminée avec succès !
✅ Les Spaces sont créés
✅ L'application fonctionne
✅ Vous pouvez maintenant implémenter les nouvelles features
```

**Prochaines étapes :**
- Créer les routes API (voir API_ROUTES_SPACE.md)
- Créer le SpaceSwitcher frontend
- Implémenter le système d'invitations
- Tester l'isolation des données

---

**🪟 Ce guide est spécialement adapté pour Windows !**
