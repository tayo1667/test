# 🔧 FIX: Email OTP Not Working for External Users

## ❌ Problem Identified

Your OTP emails are NOT being sent because:
1. `RESEND_API_KEY` is missing from Railway environment variables
2. The email service was returning `success: true` even when no email was sent
3. Users outside localhost can't receive OTP codes

## ✅ Solution Applied

### Code Fix (Already Done)
I've updated `services/email.js` to properly fail in production when the API key is missing. Now it will:
- Return `success: false` in production if `RESEND_API_KEY` is not set
- Show clear error message to users
- Still work in development mode (OTP logged to console)

## 🚀 Steps to Fix on Railway (DO THIS NOW)

### Step 1: Get Resend API Key (2 minutes)
1. Go to https://resend.com
2. Sign up with your email (it's free)
3. Verify your email
4. Go to **API Keys** section
5. Click **Create API Key**
6. Give it a name like "Sentriom Production"
7. Copy the key (starts with `re_`)

### Step 2: Add to Railway (1 minute)
1. Go to https://railway.app
2. Open your **Sentriom** project
3. Click on your service
4. Go to **Variables** tab
5. Click **+ New Variable**
6. Add these two variables:

```
RESEND_API_KEY=re_your_actual_key_here
FROM_EMAIL=Sentriom <noreply@sentriom.com>
```

7. Click **Deploy** (or it will auto-deploy)

### Step 3: Test (1 minute)
1. Wait 30 seconds for deployment
2. Go to your signup page: https://sentriom-production.up.railway.app/signup
3. Enter a real email address (yours or a friend's)
4. Click "Send OTP"
5. Check the email inbox (and spam folder)
6. You should receive the OTP email within seconds!

## 📧 Email Configuration Details

### Free Tier Limits (Resend)
- 100 emails per day
- 3,000 emails per month
- Perfect for testing and small-scale production

### Default Sender
If you don't verify a custom domain, emails will come from:
- `onboarding@resend.dev`

### Custom Domain (Optional - Better Deliverability)
To use your own domain (e.g., `noreply@sentriom.com`):
1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain: `sentriom.com`
4. Add the DNS records they provide to your domain registrar
5. Wait for verification (usually 5-10 minutes)
6. Update `FROM_EMAIL` in Railway to: `Sentriom <noreply@sentriom.com>`

## 🧪 Testing Checklist

After adding the API key, test these scenarios:

### Test 1: Signup OTP
- [ ] Go to signup page
- [ ] Enter real email
- [ ] Click "Send OTP"
- [ ] Check email inbox (and spam)
- [ ] Verify OTP code arrives
- [ ] Enter OTP and complete signup

### Test 2: Login OTP
- [ ] Go to login page
- [ ] Enter registered email
- [ ] Click "Send OTP"
- [ ] Check email inbox
- [ ] Verify OTP code arrives
- [ ] Enter OTP and login

### Test 3: External User
- [ ] Ask someone else to try signing up
- [ ] They should receive OTP email
- [ ] They should be able to complete signup

## 🔍 Verify It's Working

### Check Railway Logs
```bash
railway logs
```

Look for these success messages:
```
✅ [EMAIL SERVICE] Resend initialized successfully
📧 [SEND OTP] Attempting to send signup OTP to: user@example.com
✅ [SEND EMAIL] Email sent successfully! ID: abc123...
```

### Check Resend Dashboard
1. Go to https://resend.com/emails
2. You'll see all sent emails
3. Check delivery status
4. View email content

## ❌ Troubleshooting

### Email Not Received?
1. **Check spam folder** - First time emails often go to spam
2. **Verify API key** - Make sure it's correct in Railway variables
3. **Check logs** - Look for error messages in Railway logs
4. **Try different email** - Some providers block automated emails

### Still Getting Errors?
1. **Restart service** - In Railway, click "Restart"
2. **Check environment** - Make sure `NODE_ENV=production` is set
3. **Verify deployment** - Make sure latest code is deployed

### Emails Going to Spam?
1. **Verify domain** - Use custom domain with SPF/DKIM records
2. **Warm up** - Send a few test emails first
3. **Content** - Avoid spam trigger words

## 📊 Current vs Fixed Flow

### Before (Broken)
```
User requests OTP
    ↓
API returns "success" (but no email sent)
    ↓
User never receives OTP
    ↓
User can't login/signup ❌
```

### After (Fixed)
```
User requests OTP
    ↓
API checks RESEND_API_KEY
    ↓
Sends email via Resend
    ↓
User receives OTP in inbox
    ↓
User completes login/signup ✅
```

## 🎯 Summary

**What I Fixed:**
- Updated `services/email.js` to properly fail when API key is missing
- Now returns clear error in production mode
- Added proper error handling

**What You Need to Do:**
1. Get Resend API key from https://resend.com
2. Add `RESEND_API_KEY` to Railway environment variables
3. Add `FROM_EMAIL` to Railway environment variables
4. Test with real email addresses

**Time Required:** 5 minutes total

**Result:** OTP emails will work for everyone, not just localhost!

---

**Status**: Code fixed ✅ | Railway config needed ⏳
**Next Step**: Add RESEND_API_KEY to Railway variables
