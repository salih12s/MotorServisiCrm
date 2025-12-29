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
echo # API URL Configuration
echo # REACT_APP_API_URL=http://localhost:5000/api
echo.
echo # Production API URL ^(demirkanmotorluaraclar.com backend^)
echo REACT_APP_API_URL=http://demirkanmotorluaraclar.com/api
) > frontend\.env

echo.
echo Production ortami ayarlandi!
echo Backend: Railway PostgreSQL
echo Frontend: http://demirkanmotorluaraclar.com
echo API: http://demirkanmotorluaraclar.com/api
echo.
pause
