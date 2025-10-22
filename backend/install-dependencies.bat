@echo off
echo ========================================
echo Installation des dependances manquantes
echo ========================================
echo.

echo [1/2] Installation d'axios...
call npm install axios

echo.
echo [2/2] Verification des dependances...
call npm install

echo.
echo ========================================
echo ✅ Installation terminee !
echo ========================================
echo.
echo Vous pouvez maintenant lancer :
echo   npm run dev
echo.
pause
