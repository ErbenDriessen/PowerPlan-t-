@echo off
echo Powerplant backend starten...

:: Stop eventuele oude backend op poort 3000
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3000 " ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)

:: Stel het juiste IP in voor de app
node "%~dp0set-ip.js"

:: Start de backend in een nieuw venster
start "Powerplant Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"

echo.
echo Backend gestart! Je kunt dit venster sluiten.
timeout /t 3 >nul
