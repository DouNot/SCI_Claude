@echo off
echo ========================================
echo RESET DATABASE - NOUVEAU SCHEMA SPACE
echo ========================================
echo.
echo ATTENTION : Cette operation va SUPPRIMER toutes les donnees !
echo.
pause

echo.
echo 1. Suppression de l'ancienne base de donnees...
del /F prisma\dev.db 2>nul
del /F prisma\dev.db-journal 2>nul

echo.
echo 2. Suppression des migrations existantes...
rmdir /S /Q prisma\migrations 2>nul

echo.
echo 3. Creation de la nouvelle migration...
npx prisma migrate dev --name init_space_model

echo.
echo 4. Generation du client Prisma...
npx prisma generate

echo.
echo ========================================
echo BASE DE DONNEES REINITIALISEE !
echo ========================================
echo.
echo La nouvelle base de donnees avec le modele Space est prete.
echo Vous pouvez maintenant demarrer le serveur avec : npm run dev
echo.
pause
