# Motorcycle Repair Shop - Free Deployment Guide

## 🚀 Quick Start with Railway (Recommended)

Railway offers the best free hosting for Laravel + React applications.

### Prerequisites
- GitHub account
- Your code pushed to GitHub repository

### Step 1: Prepare for Production

Create a production environment configuration:

```bash
# Copy environment file
cp .env.example .env.production
```

Add these production settings to `.env.production`:

```env
APP_NAME="Motorcycle Repair Shop"
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=false
APP_URL=https://your-app.railway.app

# Database (Railway will provide these)
DB_CONNECTION=pgsql
DB_HOST=${DATABASE_HOST}
DB_PORT=${DATABASE_PORT}
DB_DATABASE=${DATABASE_NAME}
DB_USERNAME=${DATABASE_USERNAME}
DB_PASSWORD=${DATABASE_PASSWORD}

# Production optimizations
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
LOG_LEVEL=error

# Mail (use Railway's environment or external service)
MAIL_MAILER=smtp
MAIL_FROM_ADDRESS="noreply@your-domain.com"
MAIL_FROM_NAME="${APP_NAME}"
```

### Step 2: Generate Application Key

```bash
php artisan key:generate --show
```

Copy the generated key for later use.

### Step 3: Deploy to Railway

1. Visit [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your motorcycle repair shop repository
5. Railway will auto-detect Laravel and use the included `railway.toml` configuration

> 📖 **For detailed Railway deployment instructions, see [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md)**

### Step 4: Configure Environment Variables

In Railway dashboard, add these environment variables:

- `APP_KEY`: The key you generated in Step 2
- `APP_ENV`: `production`
- `APP_DEBUG`: `false`
- `APP_URL`: Your Railway app URL (provided after deployment)

### Step 5: Run Migrations

In Railway terminal or locally:

```bash
php artisan migrate --force
php artisan db:seed --force  # If you want sample data
```

## 🌐 Alternative Free Hosting Options

### Option 2: Heroku

**Pros:** Well-documented Laravel support
**Cons:** Limited free hours per month

1. Install Heroku CLI
2. Create `Procfile`:
   ```
   web: vendor/bin/heroku-php-apache2 public/
   ```
3. Deploy:
   ```bash
   heroku create your-app-name
   heroku addons:create heroku-postgresql:mini
   heroku config:set APP_KEY=$(php artisan key:generate --show)
   git push heroku main
   heroku run php artisan migrate --force
   ```

### Option 3: InfinityFree

**Pros:** Traditional web hosting, unlimited bandwidth
**Cons:** Some PHP function limitations

1. Sign up at [infinityfree.net](https://infinityfree.net)
2. Upload files via File Manager or FTP
3. Create MySQL database in control panel
4. Configure `.env` with provided database credentials

### Option 4: Vercel (Frontend) + Railway (API)

**For API-separate architecture:**

1. **Backend (Railway):** Deploy Laravel as API
2. **Frontend (Vercel):** Build React separately
3. **Configuration:** Set up CORS in Laravel

## 🛠️ Build Commands

Make sure your `package.json` includes:

```json
{
  "scripts": {
    "build": "vite build",
    "build:ssr": "vite build && vite build --ssr"
  }
}
```

## 📝 Production Checklist

Before deploying:

- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Generate new `APP_KEY`
- [ ] Configure database connection
- [ ] Set up proper mail configuration
- [ ] Test the application locally in production mode
- [ ] Ensure all environment variables are set
- [ ] Run `composer install --optimize-autoloader --no-dev`
- [ ] Run `npm run build`

## 🔧 Troubleshooting

### Common Issues:

1. **500 Error:** Check app key is set and storage folder permissions
2. **Database Connection:** Verify database credentials in environment
3. **Assets Not Loading:** Ensure `APP_URL` is correct and assets are built
4. **Queue Jobs:** Set `QUEUE_CONNECTION=database` for free hosting

### Debug Mode:

Temporarily enable debug mode if needed:
```env
APP_DEBUG=true
LOG_LEVEL=debug
```

**Remember to disable debug mode in production!**

## 📱 Domain Setup

### Custom Domain (Railway):
1. Purchase domain from provider (Namecheap, etc.)
2. In Railway dashboard, add custom domain
3. Update DNS records as instructed

### Free Subdomain:
Most platforms provide free subdomains:
- Railway: `your-app.railway.app`
- Heroku: `your-app.herokuapp.com`

## 💰 Cost Breakdown

**Railway:** $5/month free credits (enough for small apps)
**Heroku:** Limited free hours
**InfinityFree:** Completely free with ads
**Vercel:** Free for personal projects

## 🚀 Next Steps

1. Choose your hosting platform
2. Follow the specific deployment steps
3. Test your deployed application
4. Set up monitoring and backups
5. Consider upgrading to paid plans as you scale

---

**Need help?** The deployment process can vary based on your specific needs. Railway is recommended for beginners due to its simplicity and Laravel-friendly environment. 