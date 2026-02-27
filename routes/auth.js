const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { pool } = require('../database/init');
const { sendOTP } = require('../services/email');

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP (Login)
router.post('/login/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('📧 [LOGIN] OTP request received for:', email);

    if (!email) {
      console.log('❌ [LOGIN] Error: Email is required');
      return res.status(400).json({
        success: false,
        error: 'Email is required',
        reason: 'Provide a valid email address to receive the login code.',
        statusCode: 400
      });
    }

    // Check if user exists
    const [userRows] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (userRows.length === 0) {
      console.log('❌ [LOGIN] Error: User not found -', email);
      return res.status(404).json({
        success: false,
        error: 'User not found',
        reason: 'No account exists with this email. Please sign up first.',
        statusCode: 404
      });
    }

    console.log('✅ [LOGIN] User found, generating OTP...');

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await pool.query(
      'UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE email = ?',
      [otp, expiresAt, email]
    );

    console.log('✅ [LOGIN] OTP saved to database');

    console.log('📧 [LOGIN] Calling sendOTP function...');
    const emailResult = await sendOTP(email, otp, { context: 'login' });
    console.log('📧 [LOGIN] sendOTP result:', JSON.stringify(emailResult));
    
    if (!emailResult.success && process.env.NODE_ENV === 'production') {
      console.log('❌ [LOGIN] Email send failed in production');
      return res.status(500).json({
        success: false,
        error: 'Email could not be sent',
        reason: emailResult.error || 'Failed to send OTP. Please try again later.',
        statusCode: 500
      });
    }
    if (process.env.NODE_ENV === 'development' && !emailResult.success) {
      console.log(`🔐 [LOGIN] DEV OTP for ${email}: ${otp}`);
    }
    
    if (emailResult.success) {
      console.log('✅ [LOGIN] Email sent successfully!');
      if (emailResult.id) {
        console.log('✅ [LOGIN] Resend email ID:', emailResult.id);
      }
    }

    console.log('✅ [LOGIN] OTP sent successfully to:', email);
    res.status(200).json({
      success: true,
      message: 'Login code sent',
      detail: 'Check your email for the 6-digit code. It expires in 10 minutes.',
      statusCode: 200
    });
  } catch (error) {
    console.error('❌ [LOGIN] Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to send login code',
      reason: error.message,
      statusCode: 500
    });
  }
});

// Verify OTP (Login)
router.post('/login/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log('🔐 [LOGIN VERIFY] OTP verification request for:', email);

    if (!email || !otp) {
      console.log('❌ [LOGIN VERIFY] Error: Email and OTP are required');
      return res.status(400).json({
        success: false,
        error: 'Email and OTP are required',
        reason: 'Provide both the email address and the 6-digit code from your email.',
        statusCode: 400
      });
    }

    // Get user and verify OTP
    const [rows] = await pool.query(
      'SELECT id, email, first_name, last_name, full_name, otp_code, otp_expires_at FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      console.log('❌ [LOGIN VERIFY] Error: User not found -', email);
      return res.status(404).json({
        success: false,
        error: 'User not found',
        reason: 'No account found for this email. Request a new login code.',
        statusCode: 404
      });
    }

    const user = rows[0];

    // Check OTP
    if (user.otp_code !== otp) {
      console.log('❌ [LOGIN VERIFY] Error: Invalid OTP for', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid code',
        reason: 'The code you entered is wrong. Check your email and try again.',
        statusCode: 401
      });
    }

    // Check expiration
    if (new Date() > new Date(user.otp_expires_at)) {
      console.log('❌ [LOGIN VERIFY] Error: OTP expired for', email);
      return res.status(401).json({
        success: false,
        error: 'Code expired',
        reason: 'This code has expired. Request a new login code from the login page.',
        statusCode: 401
      });
    }

    console.log('✅ [LOGIN VERIFY] OTP verified, generating token...');

    // Clear OTP
    await pool.query(
      'UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Save session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await pool.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, token, expiresAt]
    );

    console.log('✅ [LOGIN VERIFY] Login successful for:', email);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name
      },
      statusCode: 200
    });
  } catch (error) {
    console.error('❌ [LOGIN VERIFY] Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Verification failed',
      reason: error.message,
      statusCode: 500
    });
  }
});

// Send OTP (Signup)
router.post('/signup/send-otp', async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;
    console.log('📝 [SIGNUP] OTP request received for:', email);

    if (!email || !firstName || !lastName) {
      console.log('❌ [SIGNUP] Error: All fields are required');
      return res.status(400).json({
        success: false,
        error: 'All fields are required',
        reason: 'Provide email, first name, and last name to sign up.',
        statusCode: 400
      });
    }

    // Check if user already exists
    const [existingRows] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingRows.length > 0) {
      console.log('❌ [SIGNUP] Error: User already exists -', email);
      return res.status(409).json({
        success: false,
        error: 'Email already registered',
        reason: 'An account already exists with this email. Try logging in instead.',
        statusCode: 409
      });
    }

    console.log('✅ [SIGNUP] Email available, creating user...');

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const fullName = `${firstName} ${lastName}`;

    // Create user with OTP
    await pool.query(
      'INSERT INTO users (email, first_name, last_name, full_name, otp_code, otp_expires_at) VALUES (?, ?, ?, ?, ?, ?)',
      [email, firstName, lastName, fullName, otp, expiresAt]
    );

    console.log('✅ [SIGNUP] User created, sending OTP email...');

    console.log('📧 [SIGNUP] Calling sendOTP function...');
    const emailResult = await sendOTP(email, otp, {
      context: 'signup',
      firstName
    });
    console.log('📧 [SIGNUP] sendOTP result:', JSON.stringify(emailResult));
    
    if (!emailResult.success && process.env.NODE_ENV === 'production') {
      console.log('❌ [SIGNUP] Email send failed in production');
      return res.status(500).json({
        success: false,
        error: 'Verification email could not be sent',
        reason: emailResult.error || 'Failed to send code. Please try again later.',
        statusCode: 500
      });
    }
    if (process.env.NODE_ENV === 'development' && !emailResult.success) {
      console.log(`🔐 [SIGNUP] DEV OTP for ${email}: ${otp}`);
    }
    
    if (emailResult.success) {
      console.log('✅ [SIGNUP] Email sent successfully!');
      if (emailResult.id) {
        console.log('✅ [SIGNUP] Resend email ID:', emailResult.id);
      }
    }

    console.log('✅ [SIGNUP] OTP sent successfully to:', email);
    res.status(200).json({
      success: true,
      message: 'Verification email sent',
      detail: 'Check your email for the 6-digit code to complete signup. It expires in 10 minutes.',
      statusCode: 200
    });
  } catch (error) {
    console.error('❌ [SIGNUP] Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to send verification code',
      reason: error.message,
      statusCode: 500
    });
  }
});

// Verify OTP (Signup)
router.post('/signup/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log('🔐 [SIGNUP VERIFY] OTP verification request for:', email);

    if (!email || !otp) {
      console.log('❌ [SIGNUP VERIFY] Error: Email and OTP are required');
      return res.status(400).json({
        success: false,
        error: 'Email and OTP are required',
        reason: 'Provide both the email you signed up with and the 6-digit code from your email.',
        statusCode: 400
      });
    }

    // Get user and verify OTP
    const [rows2] = await pool.query(
      'SELECT id, email, first_name, last_name, full_name, otp_code, otp_expires_at FROM users WHERE email = ?',
      [email]
    );

    if (rows2.length === 0) {
      console.log('❌ [SIGNUP VERIFY] Error: User not found -', email);
      return res.status(404).json({
        success: false,
        error: 'User not found',
        reason: 'No signup found for this email. Start signup again.',
        statusCode: 404
      });
    }

    const user = rows2[0];

    // Check OTP
    if (user.otp_code !== otp) {
      console.log('❌ [SIGNUP VERIFY] Error: Invalid OTP for', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid code',
        reason: 'The code you entered is wrong. Check your email and try again.',
        statusCode: 401
      });
    }

    // Check expiration
    if (new Date() > new Date(user.otp_expires_at)) {
      console.log('❌ [SIGNUP VERIFY] Error: OTP expired for', email);
      return res.status(401).json({
        success: false,
        error: 'Code expired',
        reason: 'This code has expired. Start signup again to get a new code.',
        statusCode: 401
      });
    }

    console.log('✅ [SIGNUP VERIFY] OTP verified, completing signup...');

    // Clear OTP
    await pool.query(
      'UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Save session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await pool.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, token, expiresAt]
    );

    console.log('✅ [SIGNUP VERIFY] Signup successful for:', email);
    res.status(200).json({
      success: true,
      message: 'Signup complete',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name
      },
      statusCode: 200
    });
  } catch (error) {
    console.error('❌ [SIGNUP VERIFY] Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Verification failed',
      reason: error.message,
      statusCode: 500
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      await pool.query('DELETE FROM sessions WHERE token = ?', [token]);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      statusCode: 200
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      reason: error.message,
      statusCode: 500
    });
  }
});

module.exports = router;
