#!/bin/bash

echo "🚀 Preparing Motorcycle Repair Shop for Production Deployment..."

# Install PHP dependencies optimized for production
echo "📦 Installing PHP dependencies..."
composer install --optimize-autoloader --no-dev

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm ci

# Build frontend assets
echo "🏗️ Building frontend assets..."
npm run build

# Generate application key if not exists
if grep -q "APP_KEY=" .env && grep -q "APP_KEY=base64:" .env; then
    echo "✅ Application key already exists"
else
    echo "🔑 Generating application key..."
    php artisan key:generate
fi

# Clear and cache config
echo "🧹 Clearing and caching configuration..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

echo "✅ Application prepared for deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Push to your GitHub repository"
echo "2. Deploy on Railway (recommended) or Heroku"
echo "3. Set environment variables on your hosting platform"
echo "4. Run migrations: php artisan migrate --force"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions" 