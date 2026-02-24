# Fix PostgreSQL Crash on Railway

## The Issue
The PostgreSQL service is crashing and needs to be restarted or recreated.

## Solution: Restart PostgreSQL in Railway Dashboard

### Step 1: Open Railway Dashboard
1. Go to https://railway.app/dashboard
2. Click on your "sentriom" project

### Step 2: Check Postgres Service
1. You'll see two services: "sentriom" and "Postgres"
2. Click on the "Postgres" service
3. Look at the status - it should show "Crashed" or "Failed"

### Step 3: Restart Postgres
1. Click on the "Settings" tab in the Postgres service
2. Scroll down and click "Restart Deployment"
3. Wait for it to restart (should take 30-60 seconds)

### Step 4: If Restart Doesn't Work - Delete and Recreate

If restarting doesn't fix it, you need to recreate the database:

1. **Delete the Postgres service**:
   - Click on Postgres service
   - Go to Settings tab
   - Scroll to bottom
   - Click "Delete Service"
   - Confirm deletion

2. **Add new Postgres database**:
   - In your sentriom project dashboard
   - Click "+ New" button
   - Select "Database"
   - Choose "PostgreSQL"
   - Railway will create a new Postgres instance

3. **Link to sentriom service**:
   - Click on your "sentriom" service
   - Go to "Variables" tab
   - Add new variable:
     - Name: `DATABASE_URL`
     - Value: `${{Postgres.DATABASE_PUBLIC_URL}}`
   - Click "Add"

4. **Redeploy sentriom**:
   - In sentriom service
   - Click "Deployments" tab
   - Click "Redeploy" on the latest deployment

### Step 5: Verify It's Working

1. Wait 1-2 minutes for deployment
2. Go to: https://sentriom-production.up.railway.app
3. You should see the homepage
4. Try accessing admin: https://sentriom-production.up.railway.app/admin

## Alternative: Use Railway CLI

If you prefer command line:

```bash
# Switch to Postgres service
railway link --service Postgres

# Check logs
railway logs

# If you see it's running, switch back to sentriom
railway link --service sentriom

# Redeploy
railway up --detach
```

## What Caused This?

PostgreSQL on Railway sometimes crashes due to:
- Volume mounting issues
- Memory limits
- Configuration conflicts
- First-time initialization problems

Restarting or recreating usually fixes it.

## After It's Fixed

Once Postgres is running:
1. The sentriom app will automatically connect
2. Database tables will be created automatically
3. You can access the admin dashboard
4. Users can sign up and make deposits

## Need Help?

If this doesn't work:
1. Check Railway status page: https://status.railway.app
2. Contact Railway support through their dashboard
3. Or try using a different database provider (Supabase, Neon, etc.)
