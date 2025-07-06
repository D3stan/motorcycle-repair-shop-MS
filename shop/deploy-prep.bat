@echo off
echo 🚀 Preparing Motorcycle Repair Shop for Production Deployment...

REM Install PHP dependencies optimized for production
echo 📦 Installing PHP dependencies...
composer install --optimize-autoloader --no-dev

REM Install Node.js dependencies
echo 📦 Installing Node.js dependencies...
npm ci

REM Build frontend assets
echo 🏗️ Building frontend assets...
npm run build

REM Generate application key if not exists
findstr "APP_KEY=base64:" .env >nul
if %errorlevel% equ 0 (
    echo ✅ Application key already exists
) else (
    echo 🔑 Generating application key...
    php artisan key:generate
)

REM Clear and cache config
echo 🧹 Clearing and caching configuration...
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

echo ✅ Application prepared for deployment!
echo.
echo 📋 Next steps:
echo 1. Push to your GitHub repository
echo 2. Deploy on Railway (recommended) or Heroku
echo 3. Set environment variables on your hosting platform
echo 4. Run migrations: php artisan migrate --force
echo.
echo 📖 See DEPLOYMENT.md for detailed instructions

pause 