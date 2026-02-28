# 🚨 URGENT: Fix OTP Email Issue

## The Problem
OTP is showing in logs/console instead of being sent via email because:
- `RESEND_API_KEY` is NOT set in Railway
- Backend is logging OTP to console as fallback

## ✅ SOLUTION (Do This NOW - 3 Minutes)

### Step 1: Get Resend API Key (2 min)
1. Open: https://resend.com/signup
2. Sign up with your email
3. Verify your email
4. Go to: https://resend.com/api-keys
5. Click "Create API Key"
6. Name it: "Sentriom Production"
7. Copy the key (starts with `re_`)

### Step 2: Add to Railway (1 min)
1. Open: https://railway.app/dashboard
2. Find your "Sentriom" project
3. Click on your service
4. Click "Variables" tab
5. Click "+ New Variable"
6. Add BOTH of these:

```
Variable 1:
Name: RESEND_API_KEY
Value: re_your_actual_key_here

Variable 2:
Name: NODE_ENV
Value: production
```

7. Click "Deploy" or wait for auto-deploy (30 seconds)

### Step 3: Test (30 seconds)
1. Go to: https://sentriom-production.up.railway.app/signup
2. Enter a REAL email address
3. Click "Send OTP"
4. Check your email inbox (and spam folder)
5. You should receive the OTP email!

## 🎯 What Will Happen After Fix

### Before (Current - Broken):
```
User clicks "Send OTP"
    ↓
Backend has no RESEND_API_KEY
    ↓
OTP logged to Railway console
    ↓
User never receives email ❌
```

### After (Fixed):
```
User clicks "Send OTP"
    ↓
Backend uses RESEND_API_KEY
    ↓
Email sent via Resend
    ↓
User receives OTP in inbox ✅
```

## 📧 Where You're Seeing the OTP Now

You're probably seeing OTP in one of these places:
1. **Railway Logs** - Console output showing: `🔐 [SIGNUP] DEV OTP for email@example.com: 123456`
2. **Browser Console** - If you have dev tools open (F12)
3. **NOT on screen** - The frontend doesn't display OTP

This is EXPECTED when `RESEND_API_KEY` is missing!

## ⚡ Quick Verification

After adding the API key, check Railway logs:
```bash
railway logs
```

You should see:
```
✅ [EMAIL SERVICE] Resend initialized successfully
✅ [SEND EMAIL] Email sent successfully! ID: abc123...
```

Instead of:
```
⚠️ [EMAIL SERVICE] No RESEND_API_KEY found
🔐 [SIGNUP] DEV OTP for email: 123456
```

## 🔒 Security Note

Once you add `RESEND_API_KEY` and set `NODE_ENV=production`:
- OTP will NOT be logged to console
- OTP will ONLY be sent via email
- Much more secure!

---

**Time Required:** 3 minutes
**Difficulty:** Super easy
**Status:** Waiting for you to add API key to Railway
