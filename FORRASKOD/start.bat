@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ================================
echo   Anyahajo Szerver Indító
echo ================================

echo.
echo [1/3] Node.js ellenőrzése...
node -v >nul 2>&1
if errorlevel 1 (
    echo.
    echo HIBA: a Node.js nincs telepítve!
    echo Telepítsd innen: https://nodejs.org
    pause
    exit /b
)
echo Node.js OK.

echo.
echo [2/3] Modulok ellenőrzése...
if not exist "node_modules" (
    echo node_modules nem található.
    echo npm install futtatása...
    npm install
    if errorlevel 1 (
        echo.
        echo ERROR: npm install nem sikerült!
        pause
        exit /b
    )
) else (
    echo node_modules rendben. Folyt. köv.
)

echo.
echo [3/3] Szerver indítása...
start cmd /k "npm start"

echo.
echo A szerver elindult.
pause