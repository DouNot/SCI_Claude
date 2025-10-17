@echo off
echo ========================================
echo Correction du probleme npm
echo ========================================
echo.

echo Creation du dossier npm manquant...
if not exist "%APPDATA%\npm" (
    mkdir "%APPDATA%\npm"
    echo [OK] Dossier cree : %APPDATA%\npm
) else (
    echo [INFO] Le dossier existe deja
)
echo.

echo Reinstallation de npm...
call npm install -g npm@latest
if %ERRORLEVEL% EQU 0 (
    echo [OK] npm reinstalle avec succes
) else (
    echo [ERREUR] Reinstallation echouee
    pause
    exit /b 1
)
echo.

echo Verification...
call npm --version
echo.

echo ========================================
echo Probleme npm corrige !
echo ========================================
echo.
echo Vous pouvez maintenant utiliser npm normalement.
echo.
pause
