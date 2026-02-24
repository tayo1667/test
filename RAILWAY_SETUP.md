# Quick Railway Setup Guide

## Step-by-Step Deployment

### 1. Install Railway CLI

```bash
npm install -g @railway/cli
```

### 2. Login to Railway

```bash
railway login
```

This will open your browser for authentication.

### 3. Initialize Project

```bash
railway init
```

Choose "Create new project" and give it a name (e.g., "sentriom-platform").

### 4. Add PostgreSQL Database

```bash
railway add
```

Select "PostgreSQL" from the list.

### 5. Set Environment Variables

```bash
# Generate a strong JWT secret
railway variables set JWT_SECRET=$(openssl rand -base64 32)

# Set Node environment
railway variables set NODE_ENV=production
```

### 6. Deploy

```bash
railway up
```

This will deploy your application to Railway.

### 7. Open Your App

```bash
railway open
```

This will open your deployed application in the browser.

### 8. View Logs

```bash
railway logs
```

Check that the database initialized successfully.

## Quick Commands

```bash
# View all environment variables
railway variables

# Connect to PostgreSQL
railway connect postgres

# View service status
railway status

# Redeploy
railway up

# View logs in real-time
railway logs --follow
```

## Testing Your Deployment

1. Visit your Railway URL
2. Go to `/signup`
3. Create an account (OTP will be in logs during development)
4. Login and test the deposit flow

## Important Notes

- Railway automatically sets `DATABASE_URL` and `PORT`
- OTP codes appear in logs in development mode
- For production, integrate an email service (SendGrid, AWS SES)
- Database tables are created automatically on first run

## Troubleshooting

**Can't connect to database?**
```bash
railway variables
# Check if DATABASE_URL is set
```

**App not starting?**
```bash
railway logs
# Check for errors
```

**Need to reset database?**
```bash
railway connect postgres
# Then run SQL commands to drop/recreate tables
```

## Next Steps After Deployment

1. Add custom domain in Railway dashboard
2. Set up email service for OTP delivery
3. Configure Korapay webhook
4. Enable monitoring and alerts
5. Set up automated backups

## Cost

- First $5/month is free with Hobby plan
- PostgreSQL included
- Pay only for usage above free tier

Your app should cost around $5-10/month for moderate traffic.
