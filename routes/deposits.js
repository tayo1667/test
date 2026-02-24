const express = require('express');
const router = express.Router();
const { pool } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

// Create deposit
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { crypto, cryptoName, amount, usdValue, plan, apy } = req.body;
    const userId = req.user.userId;

    if (!crypto || !cryptoName || !amount || !usdValue || !plan || !apy) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Calculate maturity date
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + parseInt(plan));

    // Generate Korapay reference
    const korapayReference = `DEP-${Date.now()}-${userId}`;

    // Insert deposit
    const result = await pool.query(
      `INSERT INTO deposits 
       (user_id, crypto, crypto_name, amount, usd_value, plan, apy, korapay_reference, maturity_date, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [userId, crypto, cryptoName, amount, usdValue, plan, apy, korapayReference, maturityDate, 'pending']
    );

    const deposit = result.rows[0];

    res.json({
      success: true,
      deposit: {
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
      }
    });
  } catch (error) {
    console.error('Create deposit error:', error);
    res.status(500).json({ error: 'Failed to create deposit' });
  }
});

// Get user deposits
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT * FROM deposits 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    const deposits = result.rows.map(deposit => ({
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
      createdAt: deposit.created_at,
      updatedAt: deposit.updated_at
    }));

    res.json({ success: true, deposits });
  } catch (error) {
    console.error('Get deposits error:', error);
    res.status(500).json({ error: 'Failed to get deposits' });
  }
});

// Get single deposit
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const depositId = req.params.id;

    const result = await pool.query(
      'SELECT * FROM deposits WHERE id = $1 AND user_id = $2',
      [depositId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deposit not found' });
    }

    const deposit = result.rows[0];

    res.json({
      success: true,
      deposit: {
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
        createdAt: deposit.created_at,
        updatedAt: deposit.updated_at
      }
    });
  } catch (error) {
    console.error('Get deposit error:', error);
    res.status(500).json({ error: 'Failed to get deposit' });
  }
});

// Update deposit status (for webhook)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, korapayReference } = req.body;
    const depositId = req.params.id;

    // TODO: Verify Korapay webhook signature

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const result = await pool.query(
      'UPDATE deposits SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 OR korapay_reference = $3 RETURNING *',
      [status, depositId, korapayReference]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deposit not found' });
    }

    res.json({ success: true, message: 'Deposit status updated' });
  } catch (error) {
    console.error('Update deposit status error:', error);
    res.status(500).json({ error: 'Failed to update deposit status' });
  }
});

// Get dashboard stats
router.get('/stats/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all deposits
    const depositsResult = await pool.query(
      'SELECT * FROM deposits WHERE user_id = $1',
      [userId]
    );

    const deposits = depositsResult.rows;

    // Calculate stats
    let totalBalance = 0;
    let totalEarned = 0;
    let totalAPY = 0;

    deposits.forEach(deposit => {
      totalBalance += parseFloat(deposit.usd_value);

      // Calculate earned interest
      const depositDate = new Date(deposit.created_at);
      const now = new Date();
      const daysElapsed = (now - depositDate) / (1000 * 60 * 60 * 24);
      const yearlyRate = parseFloat(deposit.apy) / 100;
      const earned = (parseFloat(deposit.usd_value) * yearlyRate * daysElapsed) / 365;

      totalEarned += earned;
      totalAPY += parseFloat(deposit.apy);
    });

    const averageAPY = deposits.length > 0 ? totalAPY / deposits.length : 0;
    const activePlans = deposits.length;
    const pendingDeposits = deposits.filter(d => d.status === 'pending').length;

    res.json({
      success: true,
      stats: {
        totalBalance: totalBalance.toFixed(2),
        totalEarned: totalEarned.toFixed(2),
        activePlans,
        pendingDeposits,
        averageAPY: averageAPY.toFixed(1)
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
});

module.exports = router;
