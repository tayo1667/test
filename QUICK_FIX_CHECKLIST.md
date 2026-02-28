# ⚡ Quick Fix Checklist - OTP Email Issue

## ✅ What I Just Fixed

1. Updated `services/email.js` to properly detect missing API key in production
2. Now returns error instead of fake success when API key is missing
3. Code is ready to deploy

## 🚀 What You Need to Do RIGHT NOW (5 minutes)

### Step 1: Get Resend API Key (2 min)
```
1. Go to: https://resend.com
2. Sign up (free)
3. Go to "API Keys"
4. Click "Create API Key"
5. Copy the key (starts with "re_")
```

### Step 2: Add to Railway (2 min)
```
1. Go to: https://railway.app
2. Open your Sentriom project
3. Click "Variables" tab
4. Add these two variables:

   RESEND_API_KEY=re_your_key_here
   FROM_EMAIL=Sentriom <noreply@sentriom.com>

5. Save (auto-deploys)
```

### Step 3: Deploy Updated Code (1 min)
```bash
# If you have Railway CLI:
railway up

# Or push to git (if connected):
git add .
git commit -m "Fix OTP email for production"
git push
```

### Step 4: Test (1 min)
```
1. Go to: https://sentriom-production.up.railway.app/signup
2. Enter a real email
3. Click "Send OTP"
4. Check email inbox (and spam folder)
5. Should receive OTP within seconds!
```

## 🎯 Expected Result

**Before:** OTP only worked on localhost
**After:** OTP works for everyone, anywhere

## 📞 Need Help?

Check Railway logs:
```bash
railway logs
```

Look for:
```
✅ [EMAIL SERVICE] Resend initialized successfully
✅ [SEND EMAIL] Email sent successfully!
```

---

**Total Time:** 5 minutes
**Difficulty:** Easy
**Status:** Code ready ✅ | Need API key ⏳
