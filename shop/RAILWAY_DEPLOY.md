# Railway Deployment Guide - Motorcycle Repair Shop

This guide covers deploying your Laravel + React motorcycle repair shop application to Railway using the included `railway.toml` configuration.

## 📋 Prerequisites

- GitHub account with your project repository
- Railway account (free signup)
- Your code pushed to GitHub

## 🚀 Quick Deploy

### Step 1: Push Your Code
```bash
git add .
git commit -m "Add Railway configuration"
git push origin main
```

### Step 2: Create Railway Project

1. Visit [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your motorcycle repair shop repository
5. Railway will automatically detect Laravel and use the `railway.toml` config

### Step 3: Add Database

1. In your Railway project dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Railway will automatically set database environment variables

### Step 4: Configure Environment Variables

In Railway dashboard, add these required variables:

```env
APP_KEY=base64:YOUR_GENERATED_KEY_HERE
APP_NAME="Motorcycle Repair Shop"
APP_URL=https://your-app-name.railway.app
MAIL_FROM_ADDRESS="noreply@your-domain.com"
MAIL_FROM_NAME="Motorcycle Repair Shop"
```

Generate your APP_KEY locally:
```bash
php artisan key:generate --show
```

### Step 5: Deploy

Railway will automatically build and deploy using the configuration in `railway.toml`.

## 📄 Configuration Explained

### Build Process (`railway.toml`)

```toml
[build]
buildCommand = "composer install --optimize-autoloader --no-dev && npm ci && npm run build && php artisan config:cache && php artisan route:cache && php artisan view:cache"
```

This command:
- Installs PHP dependencies (production-optimized)
- Installs Node.js dependencies 
- Builds React frontend assets
- Caches Laravel configuration for better performance

### Deployment Process

```toml
[deploy]
startCommand = "php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT"
```

This command:
- Runs database migrations automatically
- Starts the Laravel development server (suitable for Railway)

### Environment Configuration

The config includes optimized settings for:
- **Production**: Error logging, caching, database sessions
- **Staging**: Debug mode enabled for testing

## 🔧 Customization Options

### Custom Domain

1. In Railway dashboard, go to "Settings" → "Domains"
2. Add your custom domain
3. Update DNS records as instructed
4. Update `APP_URL` environment variable

### Email Configuration

For production emails, add these variables:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
```

### Queue Workers (Optional)

For background jobs, you can add a worker service:

1. Create new service in Railway
2. Set start command: `php artisan queue:work --sleep=3 --tries=3`
3. Use same environment variables

### File Storage

For file uploads, consider:
- Railway's ephemeral filesystem (files disappear on redeploy)
- External storage like AWS S3 or Cloudinary
- Railway Volume for persistent storage

## 🐛 Troubleshooting

### Build Failures

**Issue**: Nixpacks npm/npx version conflicts
```
error: Unable to build profile. There is a conflict for the following files:
/nix/store/.../npx-cli.js
```

**Solutions** (try in order):

1. **Use the included `nixpacks.toml`** (already added to your project)
2. **Switch to Dockerfile deployment**:
   - In Railway dashboard: Settings → Build → Dockerfile
   - Uses the included `Dockerfile`
3. **Manual Nixpacks override**:
   ```bash
   # Add to railway.toml
   [build]
   builder = "dockerfile"
   ```

**Issue**: Composer or npm install fails
```bash
# Check in Railway logs for specific errors
# Common fixes:
composer clear-cache
npm cache clean --force
```

**Issue**: Frontend assets not building
```bash
# Verify package.json build script exists
npm run build  # Test locally first
```

### Runtime Issues

**Issue**: 500 Server Error
- Check APP_KEY is set correctly
- Verify database connection variables
- Check Railway logs for specific errors

**Issue**: Database Connection Failed
- Ensure PostgreSQL service is running
- Check database environment variables are set
- Verify `DB_CONNECTION=pgsql` in environment

**Issue**: CSS/JS Assets Not Loading
- Verify `APP_URL` matches your Railway domain
- Check if `npm run build` completed successfully
- Ensure Vite build output is in `public/build/`

## 📊 Monitoring

### Viewing Logs
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and select project
railway login
railway link

# View live logs
railway logs
```

### Performance Monitoring

Railway provides:
- CPU and memory usage metrics
- Request response times
- Error rate tracking
- Custom health checks (configured in `railway.toml`)

## 💰 Cost Management

### Free Tier Limits
- $5 free credits per month
- Sufficient for small to medium applications
- Monitor usage in Railway dashboard

### Optimization Tips
1. Use caching (already configured)
2. Optimize database queries
3. Use CDN for static assets
4. Monitor resource usage regularly

## 🔄 Updates and Maintenance

### Deploying Updates
```bash
git add .
git commit -m "Your update message"
git push origin main
# Railway automatically redeploys
```

### Database Migrations
```bash
# Migrations run automatically on each deploy
# For manual migration:
railway run php artisan migrate
```

### Rolling Back
1. In Railway dashboard, go to "Deployments"
2. Find previous successful deployment
3. Click "Redeploy" to rollback

## 🛡️ Security Considerations

1. **Environment Variables**: Never commit sensitive data to Git
2. **APP_DEBUG**: Always `false` in production
3. **Database**: Use Railway's managed PostgreSQL
4. **HTTPS**: Enabled by default on Railway
5. **Regular Updates**: Keep dependencies updated

## 📞 Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Laravel Docs**: [laravel.com/docs](https://laravel.com/docs)
- **Community**: Railway Discord or Laravel Forums

---

Your motorcycle repair shop application is now ready for production deployment on Railway! 🏍️✨ 