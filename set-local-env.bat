@echo off
echo Gelistirme Ortami Ayarlaniyor...

REM Backend .env dosyasini local ayarlara cevir
(
echo # Environment
echo NODE_ENV=development
echo.
echo # Database Configuration - Local Development
echo DB_HOST=localhost
echo DB_PORT=5432
echo DB_NAME=Musatti
echo DB_USER=postgres
echo DB_PASSWORD=12345
echo.
echo # Database Configuration - Production ^(Railway^)
echo # DB_HOST=mainline.proxy.rlwy.net
echo # DB_PORT=19436
echo # DB_NAME=railway
echo # DB_USER=postgres
echo # DB_PASSWORD=AujMSGZWwRuSBMkdnbDzYUtYEXuDqfHK
echo.
echo # JWT Configuration
echo JWT_SECRET=demirkan_motorlu_arac_secret_key_2025
echo.
echo # Server Configuration
echo PORT=5000
) > backend\.env

REM Frontend .env dosyasini local ayarlara cevir
(
echo # API URL Configuration
echo REACT_APP_API_URL=http://localhost:5000/api
echo.
echo # Production API URL
echo # REACT_APP_API_URL=https://your-production-api.com/api
) > frontend\.env

echo.
echo Local gelistirme ortami ayarlandi!
echo Backend: localhost PostgreSQL
echo Frontend API: http://localhost:5000/api
echo.
pause
