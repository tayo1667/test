# 🔗 OrbytPay Integration - Sentriom Deposit Flow

## Overview

When users make a deposit on Sentriom, they are automatically redirected to OrbytPay.org to complete the payment with the exact crypto amount and live rate.

## How It Works

### 1. User Flow
1. User selects cryptocurrency on Sentriom deposit page
2. User enters amount (e.g., 0.05 BTC)
3. User selects savings plan (3, 6, or 12 months)
4. User clicks "Proceed to Payment"
5. **Automatically redirected to OrbytPay.org/pay**
6. User completes payment on OrbytPay
7. User returns to Sentriom dashboard

### 2. Data Passed to OrbytPay

The following parameters are sent via URL:

```
https://orbytpay.org/pay?crypto=BTC&cryptoName=Bitcoin&amount=0.05&usdValue=3166.85&rate=63337&plan=6&apy=3.6&returnUrl=https://sentriom.com/app/dashboard.html&userEmail=user@example.com&userName=John%20Doe&source=sentriom
```

#### Parameters:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `crypto` | string | Cryptocurrency symbol | `BTC` |
| `cryptoName` | string | Full cryptocurrency name | `Bitcoin` |
| `amount` | number | Crypto amount to deposit | `0.05` |
| `usdValue` | number | USD equivalent at current rate | `3166.85` |
| `rate` | number | Live crypto rate (USD per coin) | `63337` |
| `plan` | number | Savings plan duration (months) | `6` |
| `apy` | number | Annual Percentage Yield | `3.6` |
| `returnUrl` | string | URL to return after payment | `https://sentriom.com/app/dashboard.html` |
| `userEmail` | string | User's email address | `user@example.com` |
| `userName` | string | User's full name | `John Doe` |
| `source` | string | Always "sentriom" | `sentriom` |

### 3. Live Rates

- Crypto rates are fetched from **CoinGecko API** every 30 seconds
- Rates are displayed on each crypto card
- The exact rate at the time of deposit is passed to OrbytPay
- This ensures the user pays the correct amount

### 4. Pending Deposit Storage

Before redirecting, Sentriom stores the deposit info in localStorage:

```javascript
{
  cryptocurrency: "BTC",
  amount: 0.05,
  usd_value: "3166.85",
  savings_plan: 6,
  deposit_rate: 63337,
  timestamp: 1709567890123
}
```

This allows Sentriom to:
- Track pending deposits
- Verify payment completion when user returns
- Create the deposit record in the database

## OrbytPay Requirements

### Payment Page (orbytpay.org/pay)

OrbytPay needs to:

1. **Read URL parameters** on page load
2. **Display payment details**:
   - Crypto type and amount
   - USD value
   - Current rate
   - Savings plan details
3. **Process payment** for the exact amount
4. **Redirect back** to Sentriom after successful payment

### Example OrbytPay Page Structure:

```html
<!-- orbytpay.org/pay -->
<div class="payment-details">
  <h2>Complete Your Deposit</h2>
  
  <div class="payment-info">
    <p>Cryptocurrency: <strong>Bitcoin (BTC)</strong></p>
    <p>Amount: <strong>0.05 BTC</strong></p>
    <p>USD Value: <strong>$3,166.85</strong></p>
    <p>Rate: <strong>$63,337 per BTC</strong></p>
    <p>Savings Plan: <strong>6 months at 3.6% APY</strong></p>
  </div>
  
  <!-- Payment form/gateway here -->
  
  <button onclick="processPayment()">Pay Now</button>
</div>

<script>
// Read parameters from URL
const params = new URLSearchParams(window.location.search);
const crypto = params.get('crypto');
const amount = params.get('amount');
const usdValue = params.get('usdValue');
// ... etc

// After successful payment:
function onPaymentSuccess() {
  const returnUrl = params.get('returnUrl');
  window.location.href = returnUrl + '?payment=success';
}
</script>
```

## Return Flow

### After Payment Success

OrbytPay should redirect back to:
```
https://sentriom.com/app/dashboard.html?payment=success
```

### After Payment Failure

OrbytPay should redirect back to:
```
https://sentriom.com/app/dashboard.html?payment=failed
```

### Sentriom Handles Return

Sentriom dashboard will:
1. Check for `?payment=success` parameter
2. Retrieve pending deposit from localStorage
3. Create deposit record in database
4. Show success message
5. Clear pending deposit

## Testing

### Test the Integration:

1. Go to Sentriom deposit page
2. Select any cryptocurrency
3. Enter amount (e.g., 0.05)
4. Select savings plan
5. Click "Proceed to Payment"
6. **Check the URL** - should redirect to orbytpay.org with all parameters
7. Verify all parameters are correct

### Example Test URL:

```
https://orbytpay.org/pay?crypto=BTC&cryptoName=Bitcoin&amount=0.05&usdValue=3166.85&rate=63337&plan=6&apy=3.6&returnUrl=https%3A%2F%2Fsentriom.com%2Fapp%2Fdashboard.html&userEmail=test%40example.com&userName=Test%20User&source=sentriom
```

## Security Considerations

1. **Rate Verification**: OrbytPay should verify the rate is current (within 5 minutes)
2. **Amount Validation**: Ensure amount matches USD value at given rate
3. **Return URL**: Validate returnUrl is from sentriom.com domain
4. **Payment Confirmation**: Send webhook to Sentriom after successful payment

## Next Steps

### For OrbytPay:

1. Create `/pay` page on orbytpay.org
2. Parse URL parameters
3. Display payment details
4. Integrate payment gateway
5. Handle payment success/failure
6. Redirect back to Sentriom

### For Sentriom:

1. ✅ Redirect to OrbytPay with payment data
2. ✅ Store pending deposit in localStorage
3. ✅ Pass live crypto rates
4. ⏳ Handle return from OrbytPay
5. ⏳ Create deposit record after payment
6. ⏳ Show success/failure messages

## Support

For integration questions:
- Check URL parameters are being passed correctly
- Verify OrbytPay can read all parameters
- Test with different cryptocurrencies
- Ensure return URL works properly

---

**Status**: Integration ready on Sentriom side ✅
**Next**: Build payment page on OrbytPay.org
