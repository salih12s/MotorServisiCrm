@echo off
setlocal
cd /d "%~dp0"

echo Production Ortami Ayarlaniyor...

set "PRODUCTION_ENV=.env.production.backup"

REM Bu dosya Railway ile ayni production degiskenlerini tutar.
if not exist "%PRODUCTION_ENV%" (
  echo HATA: %PRODUCTION_ENV% dosyasi bulunamadi.
  exit /b 1
)

findstr /B /C:"NODE_ENV=production" "%PRODUCTION_ENV%" >nul
if errorlevel 1 (
  echo HATA: %PRODUCTION_ENV% dosyasinda NODE_ENV=production bulunamadi.
  exit /b 1
)

findstr /B /C:"DATABASE_URL=" "%PRODUCTION_ENV%" >nul
if errorlevel 1 (
  findstr /B /C:"DB_HOST=" "%PRODUCTION_ENV%" >nul
  if errorlevel 1 (
    echo HATA: %PRODUCTION_ENV% dosyasinda DATABASE_URL veya DB_HOST bulunamadi.
    exit /b 1
  )
)

REM Kok ve backend ortamlarini Railway production degerlerine cevir.
copy /Y "%PRODUCTION_ENV%" ".env" >nul
if errorlevel 1 (
  echo HATA: Kok .env dosyasi olusturulamadi.
  exit /b 1
)

copy /Y "%PRODUCTION_ENV%" "backend\.env" >nul
if errorlevel 1 (
  echo HATA: backend\.env dosyasi olusturulamadi.
  exit /b 1
)

REM Frontend production API adresini ayarla.
(
echo # API URL Configuration - Production
echo REACT_APP_API_URL=https://motorservisicrm-production.up.railway.app/api
) > "frontend\.env"

if errorlevel 1 (
  echo HATA: frontend\.env dosyasi olusturulamadi.
  exit /b 1
)

echo.
echo ================================================
echo PRODUCTION ORTAMI AYARLANDI!
echo ================================================
echo.
echo Backend API: https://motorservisicrm-production.up.railway.app
echo Database: Railway PostgreSQL
echo Frontend API ayari: frontend\.env
echo Backend DB ayari: backend\.env
echo.
echo Sonraki adimlar:
echo 1. Backend servisini yeniden baslatin.
echo 2. Frontend klasorunde npm run build calistirin.
echo 3. Build klasorunu deploy edin.
echo.
echo ================================================

endlocal
exit /b 0
