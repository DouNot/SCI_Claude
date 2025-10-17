@echo off
echo ========================================
echo Migration vers le modele Space
echo ========================================
echo.

echo Etape 1 : Sauvegarde de la base de donnees...
if exist prisma\dev.db (
    copy prisma\dev.db prisma\dev.db.backup
    echo [OK] Sauvegarde creee : dev.db.backup
) else (
    echo [ERREUR] Fichier dev.db non trouve !
    pause
    exit /b 1
)
echo.

echo Etape 2 : Remplacement du schema Prisma...
if exist prisma\schema-new.prisma (
    copy /Y prisma\schema-new.prisma prisma\schema.prisma
    echo [OK] Schema remplace
) else (
    echo [ERREUR] Fichier schema-new.prisma non trouve !
    pause
    exit /b 1
)
echo.

echo Etape 3 : Generation du client Prisma...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Generation du client echouee
    pause
    exit /b 1
)
echo [OK] Client genere
echo.

echo Etape 4 : Application des changements a la base...
call npx prisma db push
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Application des changements echouee
    pause
    exit /b 1
)
echo [OK] Base de donnees mise a jour
echo.

echo Etape 5 : Migration des donnees...
call node scripts\migrate-to-spaces.js
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Migration des donnees echouee
    echo.
    echo RESTAURATION DE LA SAUVEGARDE...
    copy /Y prisma\dev.db.backup prisma\dev.db
    echo [OK] Base restauree
    pause
    exit /b 1
)
echo [OK] Donnees migrees
echo.

echo ========================================
echo Migration terminee avec succes !
echo ========================================
echo.
echo Prochaines etapes :
echo 1. Ouvrir Prisma Studio pour verifier : npx prisma studio
echo 2. Lancer l'application : npm run dev
echo 3. Tester la connexion et le switcher d'espaces
echo.
pause
