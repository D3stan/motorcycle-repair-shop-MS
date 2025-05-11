#!/bin/sh
set -e

# Install composer dependencies
composer install --no-interaction --prefer-dist --optimize-autoloader

# Generate app key if not set
if ! grep -q "^APP_KEY=" .env || [ -z "$(grep '^APP_KEY=' .env | cut -d '=' -f2)" ]; then
    php artisan key:generate
fi

# Run migrations
php artisan migrate --force

# Start Laravel development server
php artisan serve --host=0.0.0.0 --port=8000 