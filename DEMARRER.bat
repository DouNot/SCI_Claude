@echo off
echo.
echo ====================================================
echo   SCI CLOUD - DEMARRAGE AUTOMATIQUE v2.0.1
echo ====================================================
echo.
echo [1/3] Demarrage du serveur BACKEND...
echo.

cd backend
start cmd /k "npm start"

timeout /t 3 >nul

echo [2/3] Demarrage du serveur FRONTEND...
echo.

cd ..
cd frontend
start cmd /k "npm run dev"

echo.
echo [3/3] TERMINE !
echo.
echo ====================================================
echo   SERVEURS DEMARRES
echo ====================================================
echo.
echo   Backend:  http://localhost:3000
echo   Frontend: http://localhost:5173
echo.
echo ====================================================
echo   PROCHAINES ETAPES
echo ====================================================
echo.
echo   1. Ouvrir http://localhost:5173 dans le navigateur
echo   2. Se connecter a l'application
echo   3. Suivre le guide: docs\GUIDE_TEST_RAPIDE.md
echo.
echo ====================================================
echo.
echo   Presse une touche pour ouvrir le navigateur...
echo.
pause >nul

start http://localhost:5173

echo.
echo   Application ouverte dans le navigateur !
echo.
echo   Pour arreter les serveurs:
echo   - Fermer les fenetres CMD ouvertes
echo   - Ou appuyer sur Ctrl+C dans chaque fenetre
echo.
pause
