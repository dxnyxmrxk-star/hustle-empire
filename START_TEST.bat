@echo off
cd /d "%~dp0"
echo.
echo ==========================================
echo   HUSTLE EMPIRE - V9 TEST BUILD
echo ==========================================
echo.

where py >nul 2>&1
if %errorlevel%==0 (
    start "" "http://localhost:8080"
    py -m http.server 8080
    goto :eof
)

where python >nul 2>&1
if %errorlevel%==0 (
    start "" "http://localhost:8080"
    python -m http.server 8080
    goto :eof
)

echo Python non trovato.
echo Apro index.html direttamente nel browser...
start "" "index.html"
pause
