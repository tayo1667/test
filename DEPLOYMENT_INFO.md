# Sentriom Platform - Deployment Information

## 🚀 Live URLs

### Main Application
**URL**: https://sentriom-production.up.railway.app

### Admin Dashboard
**URL**: https://sentriom-production.up.railway.app/admin
**Password**: `addvvvsgeuushau7euhehuayvauuiaeiujfyhehhf7773772`

## 📱 Application Pages

- **Homepage**: https://sentriom-production.up.railway.app/
- **Login**: https://sentriom-production.up.railway.app/login
- **Signup**: https://sentriom-production.up.railway.app/signup
- **Dashboard**: https://sentriom-production.up.railway.app/dashboard
- **Deposit**: https://sentriom-production.up.railway.app/deposit
- **Admin**: https://sentriom-production.up.railway.app/admin

## 🔐 Admin Dashboard Features

### Real-Time Auto-Refresh
- Dashboard automatically refreshes every 10 seconds
- Shows "Last updated" timestamp
- See new users and deposits in real-time
- Auto-refresh indicator shows status

### Overview Tab
- Total Users count
- Total Deposits count
- Total Value (USD)
- Pending Deposits
- Recent signups (last 7 days)
- Recent deposits (last 7 days)
- Recent activity feed

### Users Tab
- View all registered users
- See deposit count per user
- Total deposited amount per user
- Pagination (20 users per page)
- Join date for each user

### Deposits Tab
- View all deposits
- Filter by status (Pending/Completed/Failed)
- See user details for each deposit
- Update deposit status directly
- Pagination (20 deposits per page)
- Korapay reference tracking

## 🗄️ Database

**Type**: PostgreSQL (Railway)
**Status**: Connected and initialized

### Tables Created:
1. **users** - User accounts with OTP verification
2. **deposits** - All crypto deposits with status tracking
3. **sessions** - JWT session management

## 🔑 Environment Variables Set

```
DATABASE_URL - PostgreSQL connection (auto-set by Railway)
JWT_SECRET - JWT token signing key
NODE_ENV - production
ADMIN_PASSWORD - addvvvsgeuushau7euhehuayvauuiaeiujfyhehhf7773772
```

## 📊 How to Use Admin Dashboard

1. Go to: https://sentriom-production.up.railway.app/admin
2. Enter password: `addvvvsgeuushau7euhehuayvauuiaeiujfyhehhf7773772`
3. Click "Login"
4. You'll see the dashboard with real-time data

### Real-Time Monitoring
- Dashboard refreshes automatically every 10 seconds
- When someone creates an account, you'll see it within 10 seconds
- When someone makes a deposit, it appears immediately on next refresh
- "Last updated" shows the exact time of last refresh

### Managing Deposits
1. Go to "Deposits" tab
2. Filter by status if needed
3. Use dropdown in "Actions" column to change status
4. Status options: Pending, Completed, Failed
5. Changes are saved immediately

## 🧪 Testing the Platform

### Test User Signup
1. Go to https://sentriom-production.up.railway.app/signup
2. Enter name and email
3. OTP will be shown in alert (development mode)
4. Enter OTP to complete signup
5. Check admin dashboard - new user appears within 10 seconds

### Test Deposit
1. Login to user dashboard
2. Click "New Deposit"
3. Select cryptocurrency
4. Enter amount (e.g., 0.05 BTC)
5. Select savings plan
6. Confirm deposit
7. Check admin dashboard - deposit appears immediately

## 🔧 API Endpoints

### Authentication
- POST `/api/auth/login/send-otp` - Send login OTP
- POST `/api/auth/login/verify-otp` - Verify login OTP
- POST `/api/auth/signup/send-otp` - Send signup OTP
- POST `/api/auth/signup/verify-otp` - Verify signup OTP
- POST `/api/auth/logout` - Logout

### Deposits
- POST `/api/deposits` - Create deposit
- GET `/api/deposits` - Get user deposits
- GET `/api/deposits/:id` - Get single deposit
- GET `/api/deposits/stats/dashboard` - Get dashboard stats

### Admin
- POST `/api/admin/login` - Admin login
- GET `/api/admin/stats` - Get platform stats
- GET `/api/admin/users` - Get all users (paginated)
- GET `/api/admin/deposits` - Get all deposits (paginated)
- GET `/api/admin/users/:id` - Get user details
- PATCH `/api/admin/deposits/:id/status` - Update deposit status
- GET `/api/admin/activity` - Get recent activity

## 📈 Monitoring

### Check Logs
```bash
railway logs
```

### Check Status
```bash
railway status
```

### View Variables
```bash
railway variables
```

## 🔄 Redeployment

To redeploy after making changes:
```bash
railway up --detach
```

## 💡 Important Notes

1. **OTP in Development**: OTP codes are shown in alerts for testing. In production, integrate email service (SendGrid/AWS SES).

2. **Auto-Refresh**: Admin dashboard refreshes every 10 seconds automatically. You don't need to manually refresh the page.

3. **Real-Time Updates**: When someone creates an account or makes a deposit, it will appear in the admin dashboard within 10 seconds.

4. **Database Persistence**: All data is stored in PostgreSQL database, not localStorage. Data persists across sessions.

5. **Admin Password**: Keep the admin password secure. Change it via Railway environment variables if needed.

## 🚨 Troubleshooting

### Admin Login Not Working
- Make sure you're using the exact password: `addvvvsgeuushau7euhehuayvauuiaeiujfyhehhf7773772`
- Check browser console for errors (F12)
- Clear browser cache and try again

### Data Not Showing
- Wait 10 seconds for auto-refresh
- Check Railway logs: `railway logs`
- Verify DATABASE_URL is set: `railway variables`

### Can't See New Users
- Auto-refresh is enabled by default
- Look for "Last updated" timestamp in top right
- Should update every 10 seconds
- If not, refresh the page manually

## 📞 Support

For issues:
1. Check Railway logs: `railway logs`
2. Check database connection: `railway variables`
3. Verify service status: `railway status`

## 🎉 Success Indicators

✅ Application deployed at: https://sentriom-production.up.railway.app
✅ Admin dashboard accessible at: /admin
✅ Database connected and tables created
✅ Auto-refresh enabled (10 second intervals)
✅ Real-time user and deposit tracking
✅ Admin password set and working
✅ All API endpoints functional

---

**Deployment Date**: February 24, 2026
**Platform**: Railway
**Database**: PostgreSQL
**Status**: ✅ LIVE AND OPERATIONAL
