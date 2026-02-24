# Sentriom Platform - Railway Deployment Guide

## Prerequisites

1. Railway account (sign up at https://railway.app)
2. Git installed on your machine
3. Railway CLI (optional but recommended)

## Deployment Steps

### 1. Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit - Sentriom Platform"
```

### 2. Deploy to Railway

#### Option A: Using Railway CLI (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Add PostgreSQL database
railway add --database postgresql

# Deploy
railway up
```

#### Option B: Using Railway Dashboard

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Connect your GitHub account
4. Push this code to a GitHub repository
5. Select the repository
6. Railway will automatically detect Node.js and deploy

### 3. Add PostgreSQL Database

1. In your Railway project dashboard
2. Click "New" → "Database" → "Add PostgreSQL"
3. Railway will automatically set the `DATABASE_URL` environment variable

### 4. Set Environment Variables

In Railway dashboard, go to your service → Variables tab and add:

```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-long-and-random
NODE_ENV=production
PORT=3000
```

Optional (for email OTP):
```
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@sentriom.com
```

Optional (for Korapay):
```
KORAPAY_SECRET_KEY=your-korapay-secret-key
KORAPAY_PUBLIC_KEY=your-korapay-public-key
```

### 5. Database Initialization

The database tables will be created automatically when the server starts for the first time. Check the logs to confirm:

```bash
railway logs
```

You should see:
```
✅ Database tables initialized successfully
🚀 Sentriom server running on port 3000
📊 Database connected successfully
```

## Environment Variables Reference

### Required

- `DATABASE_URL` - PostgreSQL connection string (automatically set by Railway)
- `JWT_SECRET` - Secret key for JWT tokens (generate a strong random string)
- `NODE_ENV` - Set to `production`
- `PORT` - Port number (Railway sets this automatically, default 3000)

### Optional

- `SENDGRID_API_KEY` - For sending OTP emails via SendGrid
- `FROM_EMAIL` - Email address for sending OTPs
- `KORAPAY_SECRET_KEY` - Korapay secret key for webhook verification
- `KORAPAY_PUBLIC_KEY` - Korapay public key

## Post-Deployment

### 1. Test the Application

Visit your Railway URL (e.g., `https://your-app.up.railway.app`)

### 2. Test Authentication

1. Go to `/signup`
2. Enter name and email
3. OTP will be shown in development mode (check server logs)
4. Verify OTP and login

### 3. Test Deposit Flow

1. Login to dashboard
2. Click "New Deposit"
3. Select cryptocurrency
4. Enter amount and select plan
5. Confirm and check database

### 4. Monitor Logs

```bash
railway logs --follow
```

## Database Schema

The following tables are created automatically:

### users
- id (SERIAL PRIMARY KEY)
- email (VARCHAR UNIQUE)
- first_name, last_name, full_name
- otp_code, otp_expires_at
- created_at, updated_at

### deposits
- id (SERIAL PRIMARY KEY)
- user_id (FOREIGN KEY)
- crypto, crypto_name
- amount, usd_value
- plan, apy
- status (pending/completed)
- korapay_reference
- maturity_date
- created_at, updated_at

### sessions
- id (SERIAL PRIMARY KEY)
- user_id (FOREIGN KEY)
- token
- expires_at
- created_at

## API Endpoints

### Authentication
- `POST /api/auth/login/send-otp` - Send login OTP
- `POST /api/auth/login/verify-otp` - Verify login OTP
- `POST /api/auth/signup/send-otp` - Send signup OTP
- `POST /api/auth/signup/verify-otp` - Verify signup OTP
- `POST /api/auth/logout` - Logout user

### Deposits
- `POST /api/deposits` - Create deposit (requires auth)
- `GET /api/deposits` - Get user deposits (requires auth)
- `GET /api/deposits/:id` - Get single deposit (requires auth)
- `PATCH /api/deposits/:id/status` - Update deposit status (webhook)
- `GET /api/deposits/stats/dashboard` - Get dashboard stats (requires auth)

### Users
- `GET /api/users/me` - Get current user (requires auth)
- `PATCH /api/users/me` - Update profile (requires auth)

## Troubleshooting

### Database Connection Issues

Check if `DATABASE_URL` is set:
```bash
railway variables
```

### OTP Not Showing

In development, OTP is returned in the API response. Check browser console or server logs.

### Authentication Errors

Make sure `JWT_SECRET` is set and is a strong random string.

### Port Issues

Railway automatically sets the PORT variable. Don't hardcode port 3000 in production.

## Security Checklist

- [x] JWT_SECRET is set to a strong random value
- [x] Database uses SSL in production
- [x] Rate limiting enabled on API routes
- [x] Helmet.js for security headers
- [x] CORS configured
- [ ] Email service configured (SendGrid/AWS SES)
- [ ] Korapay webhook signature verification
- [ ] HTTPS enforced (Railway does this automatically)

## Next Steps

1. **Email Service**: Integrate SendGrid or AWS SES for OTP delivery
2. **Korapay Webhook**: Implement webhook handler to update deposit status
3. **Monitoring**: Set up error tracking (Sentry, LogRocket)
4. **Backups**: Configure automated database backups
5. **Custom Domain**: Add your custom domain in Railway settings

## Support

For issues or questions:
- Check Railway logs: `railway logs`
- Review database: Use Railway's built-in PostgreSQL client
- Check environment variables: `railway variables`

## Cost Estimate

Railway Pricing (as of 2024):
- Hobby Plan: $5/month (includes $5 credit)
- PostgreSQL: Included in Hobby plan
- Additional usage: Pay as you go

Estimated monthly cost: $5-10 for small to medium traffic.
