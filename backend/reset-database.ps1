# ========================================
# RESET DATABASE - NOUVEAU SCHEMA SPACE
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESET DATABASE - NOUVEAU SCHEMA SPACE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "ATTENTION : Cette operation va SUPPRIMER toutes les donnees !" -ForegroundColor Red
Write-Host ""
$confirmation = Read-Host "Voulez-vous continuer ? (oui/non)"

if ($confirmation -ne "oui") {
    Write-Host "Operation annulee." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "1. Suppression de l'ancienne base de donnees..." -ForegroundColor Yellow
Remove-Item -Path "prisma\dev.db" -ErrorAction SilentlyContinue
Remove-Item -Path "prisma\dev.db-journal" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "2. Suppression des migrations existantes..." -ForegroundColor Yellow
Remove-Item -Path "prisma\migrations" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "3. Creation de la nouvelle migration..." -ForegroundColor Yellow
npx prisma migrate dev --name init_space_model

Write-Host ""
Write-Host "4. Generation du client Prisma..." -ForegroundColor Yellow
npx prisma generate

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "BASE DE DONNEES REINITIALISEE !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "La nouvelle base de donnees avec le modele Space est prete." -ForegroundColor Green
Write-Host "Vous pouvez maintenant demarrer le serveur avec : npm run dev" -ForegroundColor Green
Write-Host ""
Read-Host "Appuyez sur Entree pour fermer"
