const express = require('express');
const router = express.Router();
const { pool } = require('../database/init');
const { authenticateAdmin } = require('../middleware/admin');

// Admin login (simple password-based for now)
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    
    console.log('Admin login attempt received');
    console.log('Password received:', password ? 'Yes' : 'No');
    
    // Simple admin password check (in production, use proper auth)
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    console.log('Expected password set:', adminPassword ? 'Yes' : 'No');
    console.log('Password match:', password === adminPassword);
    
    if (password !== adminPassword) {
      console.log('Password mismatch - login denied');
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    // Generate admin token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('Admin login successful');
    res.json({ success: true, token });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get dashboard stats
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    // Total users
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(usersResult.rows[0].count);
    
    // Total deposits
    const depositsResult = await pool.query('SELECT COUNT(*) as count, SUM(usd_value) as total FROM deposits');
    const totalDeposits = parseInt(depositsResult.rows[0].count);
    const totalValue = parseFloat(depositsResult.rows[0].total) || 0;
    
    // Pending deposits
    const pendingResult = await pool.query('SELECT COUNT(*) as count FROM deposits WHERE status = $1', ['pending']);
    const pendingDeposits = parseInt(pendingResult.rows[0].count);
    
    // Completed deposits
    const completedResult = await pool.query('SELECT COUNT(*) as count FROM deposits WHERE status = $1', ['completed']);
    const completedDeposits = parseInt(completedResult.rows[0].count);
    
    // Recent signups (last 7 days)
    const recentUsersResult = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE created_at > NOW() - INTERVAL \'7 days\''
    );
    const recentSignups = parseInt(recentUsersResult.rows[0].count);
    
    // Recent deposits (last 7 days)
    const recentDepositsResult = await pool.query(
      'SELECT COUNT(*) as count, SUM(usd_value) as total FROM deposits WHERE created_at > NOW() - INTERVAL \'7 days\''
    );
    const recentDepositsCount = parseInt(recentDepositsResult.rows[0].count);
    const recentDepositsValue = parseFloat(recentDepositsResult.rows[0].total) || 0;
    
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
    const countResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(countResult.rows[0].count);
    
    // Get users with deposit count
    const result = await pool.query(
      `SELECT 
        u.id, u.email, u.first_name, u.last_name, u.full_name, u.created_at,
        COUNT(d.id) as deposit_count,
        COALESCE(SUM(d.usd_value), 0) as total_deposited
       FROM users u
       LEFT JOIN deposits d ON u.id = d.user_id
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    const users = result.rows.map(user => ({
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
    
    const params = [limit, offset];
    
    if (status) {
      query += ' WHERE d.status = $3';
      params.push(status);
    }
    
    query += ' ORDER BY d.created_at DESC LIMIT $1 OFFSET $2';
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM deposits';
    const countParams = [];
    
    if (status) {
      countQuery += ' WHERE status = $1';
      countParams.push(status);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const totalDeposits = parseInt(countResult.rows[0].count);
    
    // Get deposits
    const result = await pool.query(query, params);
    
    const deposits = result.rows.map(deposit => ({
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
    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name, full_name, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Get user deposits
    const depositsResult = await pool.query(
      'SELECT * FROM deposits WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    const deposits = depositsResult.rows.map(deposit => ({
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
      'UPDATE deposits SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
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
    const usersResult = await pool.query(
      'SELECT id, email, full_name, created_at FROM users ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    
    // Get recent deposits
    const depositsResult = await pool.query(
      `SELECT d.*, u.email, u.full_name 
       FROM deposits d
       JOIN users u ON d.user_id = u.id
       ORDER BY d.created_at DESC 
       LIMIT $1`,
      [limit]
    );
    
    res.json({
      success: true,
      recentUsers: usersResult.rows,
      recentDeposits: depositsResult.rows
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to get activity' });
  }
});

module.exports = router;
