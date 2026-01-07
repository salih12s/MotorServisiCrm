@echo off
echo Production Ortami Ayarlaniyor...

REM Backend .env dosyasini production ayarlara cevir
(
echo # Environment
echo NODE_ENV=production
echo.
echo # Database Configuration - Local Development
echo # DB_HOST=localhost
echo # DB_PORT=5432
echo # DB_NAME=Musatti
echo # DB_USER=postgres
echo # DB_PASSWORD=12345
echo.
echo # Database Configuration - Production ^(Railway^)
echo DB_HOST=mainline.proxy.rlwy.net
echo DB_PORT=19436
echo DB_NAME=railway
echo DB_USER=postgres
echo DB_PASSWORD=AujMSGZWwRuSBMkdnbDzYUtYEXuDqfHK
echo.
echo # JWT Configuration
echo JWT_SECRET=demirkan_motorlu_arac_secret_key_2025
echo.
echo # Server Configuration
echo PORT=5000
) > backend\.env

REM Frontend .env dosyasini production ayarlara cevir
(
echo # API URL Configuration - Local Development
echo # REACT_APP_API_URL=http://localhost:5000/api
echo.
echo # Production API URL - Railway Backend
echo REACT_APP_API_URL=https://motorservisicrm-production.up.railway.app/api
) > frontend\.env

echo.
echo ================================================
echo PRODUCTION ORTAMI AYARLANDI!
echo ================================================
echo.
echo Backend API: https://motorservisicrm-production.up.railway.app
echo Database: Railway PostgreSQL
echo Frontend: Buradan build alinip deploy edilecek
echo.
echo Deployment Adimlari:
echo 1. Railway: Backend otomatik deploy olur
echo 2. Frontend: npm run build ile build al
echo 3. Build klasorunu hosting'e yukle
echo.
echo ================================================
pause
