const express = require('express');
const router = express.Router();
const { pool } = require('../database/init');
const { authenticateAdmin } = require('../middleware/admin');

// Admin login (simple password-based for now)
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    
    console.log('🔐 [ADMIN] Login attempt received');
    console.log('🔐 [ADMIN] Password received:', password ? 'Yes' : 'No');
    console.log('🔐 [ADMIN] Password length:', password ? password.length : 0);
    
    // Simple admin password check (in production, use proper auth)
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin663352';
    
    console.log('🔐 [ADMIN] Expected password set:', adminPassword ? 'Yes' : 'No');
    console.log('🔐 [ADMIN] Expected password length:', adminPassword.length);
    console.log('🔐 [ADMIN] Expected password:', adminPassword);
    console.log('🔐 [ADMIN] Received password:', password);
    console.log('🔐 [ADMIN] Password match:', password === adminPassword);
    
    if (password !== adminPassword) {
      console.log('❌ [ADMIN] Password mismatch - login denied');
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    console.log('✅ [ADMIN] Password correct, generating token...');
    
    // Generate admin token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('✅ [ADMIN] Login successful');
    res.json({ success: true, token });
  } catch (error) {
    console.error('❌ [ADMIN] Login error:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get dashboard stats
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    // Total users
    const [usersRows] = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(usersRows[0].count);
    
    // Total deposits
    const [depositsRows] = await pool.query('SELECT COUNT(*) as count, SUM(usd_value) as total FROM deposits');
    const totalDeposits = parseInt(depositsRows[0].count);
    const totalValue = parseFloat(depositsRows[0].total) || 0;
    
    // Pending deposits
    const [pendingRows] = await pool.query('SELECT COUNT(*) as count FROM deposits WHERE status = ?', ['pending']);
    const pendingDeposits = parseInt(pendingRows[0].count);
    
    // Completed deposits
    const [completedRows] = await pool.query('SELECT COUNT(*) as count FROM deposits WHERE status = ?', ['completed']);
    const completedDeposits = parseInt(completedRows[0].count);
    
    // Recent signups (last 7 days)
    const [recentUsersRows] = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE created_at > NOW() - INTERVAL 7 DAY"
    );
    const recentSignups = parseInt(recentUsersRows[0].count);
    
    // Recent deposits (last 7 days)
    const [recentDepositsRows] = await pool.query(
      "SELECT COUNT(*) as count, SUM(usd_value) as total FROM deposits WHERE created_at > NOW() - INTERVAL 7 DAY"
    );
    const recentDepositsCount = parseInt(recentDepositsRows[0].count);
    const recentDepositsValue = parseFloat(recentDepositsRows[0].total) || 0;
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalDeposits,
        totalValue: totalValue.toFixed(2),
        pendingDeposits,
        completedDeposits,
        recentSignups,
        recentDepositsCount,
        recentDepositsValue: recentDepositsValue.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Get all users with pagination
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Get total count
    const [countRows] = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(countRows[0].count);
    
    // Get users with deposit count
    const [result] = await pool.query(
      `SELECT 
        u.id, u.email, u.first_name, u.last_name, u.full_name, u.created_at,
        COUNT(d.id) as deposit_count,
        COALESCE(SUM(d.usd_value), 0) as total_deposited
       FROM users u
       LEFT JOIN deposits d ON u.id = d.user_id
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    const users = result.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      fullName: user.full_name,
      createdAt: user.created_at,
      depositCount: parseInt(user.deposit_count),
      totalDeposited: parseFloat(user.total_deposited).toFixed(2)
    }));
    
    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get all deposits with pagination
router.get('/deposits', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status; // Filter by status
    
    // Build query
    let query = `
      SELECT 
        d.*, 
        u.email, u.full_name
      FROM deposits d
      JOIN users u ON d.user_id = u.id
    `;
    
    let params;
    if (status) {
      query += ' WHERE d.status = ? ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
      params = [status, limit, offset];
    } else {
      query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
      params = [limit, offset];
    }
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM deposits';
    const countParams = status ? [status] : [];
    
    if (status) {
      countQuery += ' WHERE status = ?';
    }
    
    const [countRows] = await pool.query(countQuery, countParams);
    const totalDeposits = parseInt(countRows[0].count);
    
    // Get deposits
    const [result] = await pool.query(query, params);
    
    const deposits = result.map(deposit => ({
      id: deposit.id,
      userId: deposit.user_id,
      userEmail: deposit.email,
      userName: deposit.full_name,
      crypto: deposit.crypto,
      cryptoName: deposit.crypto_name,
      amount: parseFloat(deposit.amount),
      usdValue: parseFloat(deposit.usd_value),
      plan: deposit.plan,
      apy: parseFloat(deposit.apy),
      status: deposit.status,
      korapayReference: deposit.korapay_reference,
      maturityDate: deposit.maturity_date,
      createdAt: deposit.created_at
    }));
    
    res.json({
      success: true,
      deposits,
      pagination: {
        page,
        limit,
        totalDeposits,
        totalPages: Math.ceil(totalDeposits / limit)
      }
    });
  } catch (error) {
    console.error('Get deposits error:', error);
    res.status(500).json({ error: 'Failed to get deposits' });
  }
});

// Get user details with deposits
router.get('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get user
    const [userRows] = await pool.query(
      'SELECT id, email, first_name, last_name, full_name, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userRows[0];
    
    // Get user deposits
    const [depositsRows] = await pool.query(
      'SELECT * FROM deposits WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    const deposits = depositsRows.map(deposit => ({
      id: deposit.id,
      crypto: deposit.crypto,
      cryptoName: deposit.crypto_name,
      amount: parseFloat(deposit.amount),
      usdValue: parseFloat(deposit.usd_value),
      plan: deposit.plan,
      apy: parseFloat(deposit.apy),
      status: deposit.status,
      korapayReference: deposit.korapay_reference,
      maturityDate: deposit.maturity_date,
      createdAt: deposit.created_at
    }));
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name,
        createdAt: user.created_at
      },
      deposits
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Failed to get user details' });
  }
});

// Update deposit status
router.patch('/deposits/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const depositId = req.params.id;
    const { status } = req.body;
    
    if (!['pending', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    await pool.query(
      'UPDATE deposits SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, depositId]
    );
    
    res.json({ success: true, message: 'Deposit status updated' });
  } catch (error) {
    console.error('Update deposit status error:', error);
    res.status(500).json({ error: 'Failed to update deposit status' });
  }
});

// Get recent activity
router.get('/activity', authenticateAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Get recent users
    const [recentUsers] = await pool.query(
      'SELECT id, email, full_name, created_at FROM users ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    
    // Get recent deposits
    const [recentDeposits] = await pool.query(
      `SELECT d.*, u.email, u.full_name 
       FROM deposits d
       JOIN users u ON d.user_id = u.id
       ORDER BY d.created_at DESC 
       LIMIT ?`,
      [limit]
    );
    
    res.json({
      success: true,
      recentUsers,
      recentDeposits
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to get activity' });
  }
});

module.exports = router;
