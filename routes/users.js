const express = require('express');
const router = express.Router();
const { pool } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [rows] = await pool.query(
      'SELECT id, email, first_name, last_name, full_name, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user profile
router.patch('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    const fullName = `${firstName} ${lastName}`;

    await pool.query(
      'UPDATE users SET first_name = ?, last_name = ?, full_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [firstName, lastName, fullName, userId]
    );

    const [rows] = await pool.query(
      'SELECT id, email, first_name, last_name, full_name FROM users WHERE id = ?',
      [userId]
    );
    const user = rows[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

module.exports = router;
