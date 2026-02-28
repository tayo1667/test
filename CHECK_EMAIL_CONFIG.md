# 🔍 Check Email Configuration

## Step 1: Check if RESEND_API_KEY is Actually Set

I've added a diagnostic endpoint. After deploying, visit:

```
https://sentriom-production.up.railway.app/api/email-config
```

You should see something like:

### ✅ GOOD (Email Configured):
```json
{
  "email_service_configured": true,
  "resend_api_key_set": true,
  "resend_api_key_length": 32,
  "resend_api_key_prefix": "re_Ab",
  "from_email": "Sentriom <noreply@sentriom.com>",
  "node_env": "production",
  "status": "READY"
}
```

### ❌ BAD (Email NOT Configured):
```json
{
  "email_service_configured": false,
  "resend_api_key_set": false,
  "resend_api_key_length": 0,
  "resend_api_key_prefix": "NOT_SET",
  "from_email": "NOT_SET",
  "node_env": "production",
  "status": "NOT_CONFIGURED"
}
```

## Step 2: If NOT_CONFIGURED

You need to add the API key to Railway:

1. Go to Railway dashboard
2. Click your Sentriom service
3. Go to "Variables" tab
4. Make sure you have:
   - `RESEND_API_KEY=re_your_key_here`
   - `NODE_ENV=production`
5. Click "Redeploy" if needed

## Step 3: Deploy This Fix

```bash
# If using Railway CLI:
railway up

# Or push to git:
git add .
git commit -m "Add email config diagnostic endpoint"
git push
```

## Step 4: Test Again

After deployment:
1. Visit: https://sentriom-production.up.railway.app/api/email-config
2. Verify `status: "READY"`
3. Try signup again
4. Check email inbox

---

**This will tell us exactly what's wrong!**
