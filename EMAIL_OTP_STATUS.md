# Email OTP System - Status & Setup

## ✅ Current Status

Your Sentriom platform is **already configured** to use **Resend** for sending OTP emails!

### What's Integrated:
- ✅ Resend email service (`services/email.js`)
- ✅ Beautiful HTML email templates
- ✅ OTP sending for both signup and login
- ✅ Resend button functionality
- ✅ Frontend API integration (`app/app.js`)
- ✅ **OTP removed from API responses** (no longer shows on screen)

### What Changed Just Now:
- ❌ Removed `otp` field from API responses (was showing in development mode)
- ✅ Now only returns: `{ success: true, message: 'OTP sent to your email address' }`

## 🚀 To Make It Work on Production

### Step 1: Get Resend API Key
1. Go to https://resend.com
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `re_`)

### Step 2: Add to Railway
1. Go to your Railway dashboard
2. Select your Sentriom project
3. Click on your service
4. Go to **Variables** tab
5. Add these variables:
   ```
   RESEND_API_KEY=re_your_actual_api_key_here
   FROM_EMAIL=Sentriom <noreply@yourdomain.com>
   ```
6. Deploy will happen automatically

### Step 3: Verify Domain (Optional but Recommended)
1. In Resend dashboard, go to Domains
2. Add your domain (e.g., sentriom.com)
3. Add the DNS records they provide
4. Once verified, update `FROM_EMAIL` to use your domain:
   ```
   FROM_EMAIL=Sentriom <noreply@sentriom.com>
   ```

## 📧 Email Features

### Email Template Includes:
- Clean, professional design
- Large, monospace OTP code (easy to read)
- 10-minute expiration notice
- Security warning
- Sentriom branding

### Two Email Types:
1. **Signup**: "Your Sentriom verification code"
2. **Login**: "Your Sentriom login code"

## 🧪 Testing

### Without Resend API Key:
- OTP is logged to console
- API still returns success
- Good for local development

### With Resend API Key:
- Real emails are sent
- Check spam folder if not received
- Emails arrive within seconds

## 📱 User Flow

1. User enters email on signup/login page
2. Clicks "Send OTP"
3. Alert shows: "OTP sent to your email!"
4. User checks email inbox
5. Enters 6-digit OTP code
6. Clicks "Verify"
7. Redirected to dashboard

## 🔒 Security

- OTP expires in 10 minutes
- OTP is cleared from database after verification
- OTP is NOT returned in API response (even in dev mode)
- Only logged to console in development when email fails

## 📊 Current Setup

```
Frontend (app/app.js)
    ↓
Backend API (routes/auth.js)
    ↓
Email Service (services/email.js)
    ↓
Resend API
    ↓
User's Email Inbox
```

## 🎯 Next Steps

1. **Get Resend API key** from https://resend.com
2. **Add to Railway** environment variables
3. **Test signup** with a real email
4. **Verify emails** are being received
5. **(Optional)** Set up custom domain for better deliverability

## 💡 Tips

- Resend free tier: 100 emails/day, 3,000 emails/month
- Use a custom domain for better deliverability
- Check spam folder during testing
- Monitor Resend dashboard for email logs
- Keep API key secret (never commit to git)

## 🐛 Troubleshooting

### Email not received?
1. Check spam/junk folder
2. Verify RESEND_API_KEY is set in Railway
3. Check Railway logs for errors
4. Verify email address is correct

### Still showing OTP on screen?
- Make sure you deployed the latest code
- The OTP field has been removed from API responses
- Clear browser cache and try again

### Email going to spam?
- Verify your domain in Resend
- Add SPF and DKIM records
- Use a custom domain instead of resend.dev

## 📝 Summary

Your email OTP system is **fully integrated** and ready to use! Just add your Resend API key to Railway and you're good to go. No more OTP pop-ups on screen - everything will be sent via email.
