@echo off
echo ========================================
echo    MISE A JOUR DE LA BASE DE DONNEES
echo ========================================
echo.

cd backend

echo [1/3] Generation du client Prisma...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERREUR lors de la generation du client Prisma
    pause
    exit /b 1
)

echo.
echo [2/3] Application des migrations...
call npx prisma migrate dev --name add_notifications
if %errorlevel% neq 0 (
    echo ERREUR lors de l'application des migrations
    pause
    exit /b 1
)

echo.
echo [3/3] Verification de la base de donnees...
call npx prisma db push
if %errorlevel% neq 0 (
    echo ERREUR lors de la verification
    pause
    exit /b 1
)

echo.
echo ========================================
echo    MISE A JOUR TERMINEE AVEC SUCCES !
echo ========================================
echo.
echo La base de donnees a ete mise a jour.
echo Vous pouvez maintenant redemarrer le serveur.
echo.
pause
