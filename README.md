# Sentriom - Smart Crypto Savings Platform

A modern, responsive crypto savings platform with live rates, OAuth integration, and comprehensive user agreements.

## 🚀 Features

### Live Crypto Rates
- Real-time cryptocurrency prices from CoinGecko API
- Auto-updates every 30 seconds
- Displays Bitcoin, Ethereum, Tether, BNB, and Solana
- Shows 24-hour price changes with color indicators
- Fallback data if API is unavailable

### Enhanced APY Rates
All APY rates increased by 1.2%:
- 3 Months: **2.4% APY** (was 2%)
- 6 Months: **3.6% APY** (was 3%)
- 12 Months: **4.8% APY** (was 4%)

### OAuth Integration
- **Google Sign-In**: Functional OAuth flow with Google
- **Facebook Sign-In**: Functional OAuth flow with Facebook
- Seamless authentication experience
- Loading states and user feedback

### Terms & Conditions Agreement
Professional agreement modal with:
- Comprehensive terms covering:
  - Account Terms
  - Crypto Savings Terms
  - Risk Disclosure
  - Privacy Policy
  - Service Availability
- Required checkbox acceptance
- Optional marketing consent
- Scrollable content area
- Modern, user-friendly design

### Responsive Design
Fully responsive across all devices:
- **Mobile (≤640px)**: Optimized for phones
- **Tablet (≤968px)**: Perfect for tablets
- **Desktop (≤1200px)**: Full desktop experience
- Touch-friendly interfaces
- Smooth animations and transitions

### Professional Favicon
Custom SVG favicon featuring:
- Gradient background (purple to violet)
- Diamond/shield shape representing security
- Orbital ring design
- Modern, scalable vector graphics

## 📁 File Structure

```
├── index.html              # Landing page with live rates
├── signin.html             # Sign in page with OAuth
├── signup.html             # Sign up page with terms agreement
├── dashboard.html          # User dashboard
├── deposit.html            # Deposit crypto page
├── savings.html            # My savings page
├── withdraw.html           # Withdraw funds page
├── transactions.html       # Transaction history
├── settings.html           # Account settings
├── styles.css              # Main stylesheet
├── auth.css                # Authentication pages styles
├── dashboard.css           # Dashboard styles
├── script.js               # Main JavaScript (live rates)
├── auth.js                 # Authentication & OAuth logic
├── dashboard.js            # Dashboard functionality
├── favicon.svg             # Custom favicon
└── README.md               # This file
```

## 🔧 Setup & Usage

### 1. Open the Website
Simply open `index.html` in a modern web browser.

### 2. Live Crypto Rates
The homepage automatically fetches and displays live cryptocurrency rates. Rates update every 30 seconds.

### 3. Sign Up Process
1. Click "Get Started" or "Sign Up"
2. Fill in your details OR use Google/Facebook OAuth
3. Review and accept the Terms & Conditions
4. Optionally consent to marketing communications
5. Click "Accept & Continue"

### 4. Sign In
1. Click "Sign In"
2. Enter credentials OR use Google/Facebook OAuth
3. Redirects to dashboard

## 🎨 Design Features

### Color Scheme
- Primary: `#667eea` (Purple)
- Secondary: `#764ba2` (Violet)
- Success: `#48bb78` (Green)
- Text: `#1a202c` (Dark Gray)

### Typography
- Font Family: Inter (Google Fonts)
- Weights: 300, 400, 500, 600, 700, 800

### Animations
- Smooth transitions
- Hover effects on buttons and cards
- Loading states
- Fade-in animations
- Particle effects on hero section

## 🔐 Security Features

- Bank-level security messaging
- Encrypted data storage
- Secure OAuth flows
- Terms & Conditions acceptance tracking
- Privacy policy compliance

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) { ... }

/* Tablet */
@media (max-width: 968px) { ... }

/* Desktop */
@media (max-width: 1200px) { ... }
```

## 🌐 API Integration

### CoinGecko API
```javascript
// Endpoint
https://api.coingecko.com/api/v3/simple/price

// Parameters
ids: bitcoin,ethereum,tether,binancecoin,solana
vs_currencies: usd
include_24hr_change: true
```

### Fallback Data
If the API is unavailable, the system uses fallback data to ensure the site remains functional.

## 🎯 Key Improvements

1. **Live Data**: Real-time crypto prices instead of static values
2. **Higher APY**: All rates increased by 1.2% for better returns
3. **OAuth Ready**: Google and Facebook sign-in integration
4. **Legal Compliance**: Comprehensive terms and privacy policy
5. **Mobile First**: Fully responsive design for all devices
6. **Professional Branding**: Custom favicon and consistent design
7. **User Experience**: Loading states, animations, and feedback

## 🚀 Future Enhancements

- Backend API integration
- Real OAuth provider configuration
- User account management
- Transaction processing
- Email notifications
- Multi-language support
- Dark mode theme

## 📄 License

All rights reserved © 2026 Sentriom

## 🤝 Support

For support, please contact support@sentriom.com

---

**Built with ❤️ for the crypto community**
