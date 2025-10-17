# Script PowerShell pour la Migration
# Encodage UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Migration vers le modèle Space" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Étape 1 : Sauvegarde
Write-Host "Étape 1 : Sauvegarde de la base de données..." -ForegroundColor Yellow
if (Test-Path "prisma\dev.db") {
    Copy-Item "prisma\dev.db" "prisma\dev.db.backup" -Force
    Write-Host "[OK] Sauvegarde créée : dev.db.backup" -ForegroundColor Green
} else {
    Write-Host "[ERREUR] Fichier dev.db non trouvé !" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}
Write-Host ""

# Étape 2 : Remplacement du schéma
Write-Host "Étape 2 : Remplacement du schema Prisma..." -ForegroundColor Yellow
if (Test-Path "prisma\schema-new.prisma") {
    Copy-Item "prisma\schema-new.prisma" "prisma\schema.prisma" -Force
    Write-Host "[OK] Schema remplacé" -ForegroundColor Green
} else {
    Write-Host "[ERREUR] Fichier schema-new.prisma non trouvé !" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}
Write-Host ""

# Étape 3 : Génération du client
Write-Host "Étape 3 : Génération du client Prisma..." -ForegroundColor Yellow
$output = npx prisma generate 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Client généré" -ForegroundColor Green
} else {
    Write-Host "[ERREUR] Génération du client échouée" -ForegroundColor Red
    Write-Host $output -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}
Write-Host ""

# Étape 4 : Application des changements
Write-Host "Étape 4 : Application des changements à la base..." -ForegroundColor Yellow
$output = npx prisma db push 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Base de données mise à jour" -ForegroundColor Green
} else {
    Write-Host "[ERREUR] Application des changements échouée" -ForegroundColor Red
    Write-Host $output -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}
Write-Host ""

# Étape 5 : Migration des données
Write-Host "Étape 5 : Migration des données..." -ForegroundColor Yellow
$output = node scripts\migrate-to-spaces.js 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Données migrées" -ForegroundColor Green
} else {
    Write-Host "[ERREUR] Migration des données échouée" -ForegroundColor Red
    Write-Host $output -ForegroundColor Red
    Write-Host ""
    Write-Host "RESTAURATION DE LA SAUVEGARDE..." -ForegroundColor Yellow
    Copy-Item "prisma\dev.db.backup" "prisma\dev.db" -Force
    Write-Host "[OK] Base restaurée" -ForegroundColor Green
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}
Write-Host ""

# Succès
Write-Host "========================================" -ForegroundColor Green
Write-Host "Migration terminée avec succès !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines étapes :" -ForegroundColor Cyan
Write-Host "1. Ouvrir Prisma Studio pour vérifier : npx prisma studio" -ForegroundColor White
Write-Host "2. Lancer l'application : npm run dev" -ForegroundColor White
Write-Host "3. Tester la connexion et le switcher d'espaces" -ForegroundColor White
Write-Host ""
Read-Host "Appuyez sur Entrée pour continuer"
