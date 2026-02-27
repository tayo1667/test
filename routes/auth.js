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
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const [userRows] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (userRows.length === 0) {
      console.log('❌ [LOGIN] Error: User not found -', email);
      return res.status(404).json({ error: 'User not found. Please sign up first.' });
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
      return res.status(500).json({ error: 'Failed to send OTP email' });
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
    res.json({ 
      success: true, 
      message: 'OTP sent to your email address'
    });
  } catch (error) {
    console.error('❌ [LOGIN] Error:', error.message);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP (Login)
router.post('/login/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log('🔐 [LOGIN VERIFY] OTP verification request for:', email);

    if (!email || !otp) {
      console.log('❌ [LOGIN VERIFY] Error: Email and OTP are required');
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Get user and verify OTP
    const [rows] = await pool.query(
      'SELECT id, email, first_name, last_name, full_name, otp_code, otp_expires_at FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      console.log('❌ [LOGIN VERIFY] Error: User not found -', email);
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];

    // Check OTP
    if (user.otp_code !== otp) {
      console.log('❌ [LOGIN VERIFY] Error: Invalid OTP for', email);
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    // Check expiration
    if (new Date() > new Date(user.otp_expires_at)) {
      console.log('❌ [LOGIN VERIFY] Error: OTP expired for', email);
      return res.status(401).json({ error: 'OTP expired' });
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
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name
      }
    });
  } catch (error) {
    console.error('❌ [LOGIN VERIFY] Error:', error.message);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Send OTP (Signup)
router.post('/signup/send-otp', async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;
    console.log('📝 [SIGNUP] OTP request received for:', email);

    if (!email || !firstName || !lastName) {
      console.log('❌ [SIGNUP] Error: All fields are required');
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const [existingRows] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingRows.length > 0) {
      console.log('❌ [SIGNUP] Error: User already exists -', email);
      return res.status(409).json({ error: 'User already exists' });
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
      return res.status(500).json({ error: 'Failed to send OTP email' });
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
    res.json({ 
      success: true, 
      message: 'OTP sent to your email address'
    });
  } catch (error) {
    console.error('❌ [SIGNUP] Error:', error.message);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP (Signup)
router.post('/signup/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log('🔐 [SIGNUP VERIFY] OTP verification request for:', email);

    if (!email || !otp) {
      console.log('❌ [SIGNUP VERIFY] Error: Email and OTP are required');
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Get user and verify OTP
    const [rows2] = await pool.query(
      'SELECT id, email, first_name, last_name, full_name, otp_code, otp_expires_at FROM users WHERE email = ?',
      [email]
    );

    if (rows2.length === 0) {
      console.log('❌ [SIGNUP VERIFY] Error: User not found -', email);
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows2[0];

    // Check OTP
    if (user.otp_code !== otp) {
      console.log('❌ [SIGNUP VERIFY] Error: Invalid OTP for', email);
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    // Check expiration
    if (new Date() > new Date(user.otp_expires_at)) {
      console.log('❌ [SIGNUP VERIFY] Error: OTP expired for', email);
      return res.status(401).json({ error: 'OTP expired' });
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
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name
      }
    });
  } catch (error) {
    console.error('❌ [SIGNUP VERIFY] Error:', error.message);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      await pool.query('DELETE FROM sessions WHERE token = ?', [token]);
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

module.exports = router;
