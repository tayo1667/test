/**
 * Email service using Resend.
 * Use for OTP, notifications, and other transactional emails.
 */

const apiKey = process.env.RESEND_API_KEY;

// Resend requires: "email@example.com" OR "Name <email@example.com>"
// .env can truncate at space, so "Sentriom <noreply@x.com>" may become "Sentriom" – normalize to a valid value.
const RESEND_DEFAULT_FROM = 'onboarding@resend.dev';

function getValidFromEmail() {
  const raw = (process.env.FROM_EMAIL || '').trim();
  if (!raw) return RESEND_DEFAULT_FROM;
  // Already "Name <email@domain.com>"
  if (/^.+\s*<[^>]+@[^>]+>$/.test(raw)) return raw;
  // Plain "email@domain.com"
  if (/^[^\s<>]+@[^\s<>]+\.[^\s<>]+$/.test(raw)) return raw;
  // Broken: no @ or invalid (e.g. just "Sentriom") – use Resend default
  return RESEND_DEFAULT_FROM;
}

const fromEmail = getValidFromEmail();

console.log('📧 [EMAIL SERVICE] Initializing...');
console.log('📧 [EMAIL SERVICE] RESEND_API_KEY set:', !!apiKey);
console.log('📧 [EMAIL SERVICE] RESEND_API_KEY length:', apiKey ? apiKey.length : 0);
console.log('📧 [EMAIL SERVICE] FROM_EMAIL:', fromEmail);

let resend = null;
if (apiKey) {
  try {
    const { Resend } = require('resend');
    resend = new Resend(apiKey);
    console.log('✅ [EMAIL SERVICE] Resend initialized successfully');
  } catch (err) {
    console.error('❌ [EMAIL SERVICE] Resend init failed:', err.message);
  }
} else {
  console.warn('⚠️ [EMAIL SERVICE] No RESEND_API_KEY found - emails will not be sent');
}

const isConfigured = () => !!resend;

/**
 * Send OTP email (login or signup).
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @param {{ context: 'login' | 'signup', firstName?: string }} options
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
async function sendOTP(to, otp, options = {}) {
  const { context = 'login', firstName } = options;
  const subject =
    context === 'signup'
      ? 'Your Sentriom verification code'
      : 'Your Sentriom login code';

  console.log(`📧 [SEND OTP] Attempting to send ${context} OTP to:`, to);
  console.log(`📧 [SEND OTP] OTP code:`, otp);
  console.log(`📧 [SEND OTP] Resend configured:`, !!resend);

  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;padding:24px;">
  <div style="max-width:420px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
    <h1 style="margin:0 0 8px;font-size:20px;color:#111;">Sentriom</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#666;">${greeting}</p>
    <p style="margin:0 0 16px;font-size:15px;color:#333;">
      Your verification code is:
    </p>
    <p style="margin:0 0 24px;font-size:28px;font-weight:700;letter-spacing:6px;color:#111;font-family:monospace;">
      ${otp}
    </p>
    <p style="margin:0;font-size:13px;color:#888;">
      This code expires in 10 minutes. If you didn't request this, you can ignore this email.
    </p>
    <hr style="margin:24px 0 0;border:none;border-top:1px solid #eee;">
    <p style="margin:12px 0 0;font-size:12px;color:#999;">
      Sentriom – Smart Crypto Savings
    </p>
  </div>
</body>
</html>
  `.trim();

  const result = await sendEmail({ to, subject, html });
  console.log(`📧 [SEND OTP] Result:`, result);
  return result;
}

/**
 * Send a generic email.
 * @param {{ to: string | string[], subject: string, html: string, text?: string }} options
 * @returns {Promise<{ success: boolean, error?: string, id?: string }>}
 */
async function sendEmail({ to, subject, html, text }) {
  const toList = Array.isArray(to) ? to : [to];

  console.log('📧 [SEND EMAIL] Starting email send...');
  console.log('📧 [SEND EMAIL] To:', toList.join(', '));
  console.log('📧 [SEND EMAIL] From:', fromEmail);
  console.log('📧 [SEND EMAIL] Subject:', subject);
  console.log('📧 [SEND EMAIL] Resend configured:', !!resend);

  if (!resend) {
    console.log('❌ [SEND EMAIL] Resend not configured (RESEND_API_KEY missing). Would send:');
    console.log('❌ [SEND EMAIL]   to:', toList.join(', '));
    console.log('❌ [SEND EMAIL]   subject:', subject);
    if (text) console.log('❌ [SEND EMAIL]   text:', text);
    return { success: true };
  }

  try {
    const payload = {
      from: fromEmail,
      to: toList,
      subject,
      html
    };
    if (text) payload.text = text;

    console.log('📧 [SEND EMAIL] Calling Resend API...');
    const { data, error } = await resend.emails.send(payload);

    if (error) {
      console.error('❌ [SEND EMAIL] Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [SEND EMAIL] Email sent successfully! ID:', data?.id);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('❌ [SEND EMAIL] Send failed:', err.message);
    console.error('❌ [SEND EMAIL] Full error:', err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  isConfigured,
  sendOTP,
  sendEmail
};
