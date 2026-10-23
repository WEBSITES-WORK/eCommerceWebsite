@echo off
echo ===================================================
echo Starting NovaShop E-Commerce Platform
echo ===================================================

echo [1/3] Starting MongoDB...
start "NovaShop MongoDB" "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "%~dp0backend\data\db" --port 27017

timeout /t 3 /nobreak >nul

echo [2/3] Starting Backend API Server (Port 5000)...
start "NovaShop Backend" cmd /k "cd /d %~dp0backend && npm start"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend Dev Server (Port 5173)...
start "NovaShop Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo ===================================================
echo NovaShop is live!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5000/api/health
echo Admin Login: http://localhost:5173/admin/login
echo ===================================================
start http://localhost:5173
