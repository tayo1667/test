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

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const [userRows] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found. Please sign up first.' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await pool.query(
      'UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE email = ?',
      [otp, expiresAt, email]
    );

    const emailResult = await sendOTP(email, otp, { context: 'login' });
    if (!emailResult.success && process.env.NODE_ENV === 'production') {
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }
    if (process.env.NODE_ENV === 'development' && !emailResult.success) {
      console.log(`OTP for ${email}: ${otp}`);
    }

    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined // Only in dev
    });
  } catch (error) {
    console.error('Login OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP (Login)
router.post('/login/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Get user and verify OTP
    const [rows] = await pool.query(
      'SELECT id, email, first_name, last_name, full_name, otp_code, otp_expires_at FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];

    // Check OTP
    if (user.otp_code !== otp) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    // Check expiration
    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(401).json({ error: 'OTP expired' });
    }

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
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Send OTP (Signup)
router.post('/signup/send-otp', async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;

    if (!email || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const [existingRows] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingRows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const fullName = `${firstName} ${lastName}`;

    // Create user with OTP
    await pool.query(
      'INSERT INTO users (email, first_name, last_name, full_name, otp_code, otp_expires_at) VALUES (?, ?, ?, ?, ?, ?)',
      [email, firstName, lastName, fullName, otp, expiresAt]
    );

    const emailResult = await sendOTP(email, otp, {
      context: 'signup',
      firstName
    });
    if (!emailResult.success && process.env.NODE_ENV === 'production') {
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }
    if (process.env.NODE_ENV === 'development' && !emailResult.success) {
      console.log(`OTP for ${email}: ${otp}`);
    }

    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined // Only in dev
    });
  } catch (error) {
    console.error('Signup OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP (Signup)
router.post('/signup/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Get user and verify OTP
    const [rows2] = await pool.query(
      'SELECT id, email, first_name, last_name, full_name, otp_code, otp_expires_at FROM users WHERE email = ?',
      [email]
    );

    if (rows2.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows2[0];

    // Check OTP
    if (user.otp_code !== otp) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    // Check expiration
    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(401).json({ error: 'OTP expired' });
    }

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
    console.error('Verify OTP error:', error);
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
