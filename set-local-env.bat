@echo off
setlocal
cd /d "%~dp0"

echo Gelistirme Ortami Ayarlaniyor...

set "LOCAL_ENV=.env.local.backup"

REM Local bilgiler Git disinda bu dosyada tutulur.
if not exist "%LOCAL_ENV%" (
  echo HATA: %LOCAL_ENV% dosyasi bulunamadi.
  exit /b 1
)

findstr /B /C:"NODE_ENV=development" "%LOCAL_ENV%" >nul
if errorlevel 1 (
  echo HATA: %LOCAL_ENV% dosyasinda NODE_ENV=development bulunamadi.
  exit /b 1
)

REM Kok ve backend ortamlarini local degerlere cevir.
copy /Y "%LOCAL_ENV%" ".env" >nul
if errorlevel 1 (
  echo HATA: Kok .env dosyasi olusturulamadi.
  exit /b 1
)

copy /Y "%LOCAL_ENV%" "backend\.env" >nul
if errorlevel 1 (
  echo HATA: backend\.env dosyasi olusturulamadi.
  exit /b 1
)

REM Frontend local backend API adresini kullanir.
(
echo # API URL Configuration - Local Development
echo REACT_APP_API_URL=http://localhost:5001/api
echo PORT=3001
) > "frontend\.env"

if errorlevel 1 (
  echo HATA: frontend\.env dosyasi olusturulamadi.
  exit /b 1
)

echo.
echo ================================================
echo GELISTIRME ORTAMI AYARLANDI!
echo ================================================
echo.
echo Backend API: http://localhost:5001
echo Frontend: http://localhost:3001
echo Database: localhost:5432/Musatti
echo.
echo Degisikliklerin uygulanmasi icin acik backend ve
echo frontend sureclerini yeniden baslatin.
echo.
echo ================================================

endlocal
exit /b 0
