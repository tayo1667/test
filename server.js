const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const depositRoutes = require('./routes/deposits');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const { initDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Railway deployment
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for now
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS – explicit so Android Chrome and all browsers accept (preflight can be strict on Android).
const allowedOrigins = [
  'https://sentriom.com',
  'https://www.sentriom.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];
app.use(cors({
  origin: function (origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(null, true);
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  maxAge: 86400
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging: log method, URL, and status code when response finishes (so Railway shows 200, 400, 404, 500)
app.use((req, res, next) => {
  res.on('finish', () => {
    const status = res.statusCode;
    const log = `${req.method} ${req.originalUrl} ${status}`;
    if (status >= 500) console.error(log);
    else if (status >= 400) console.warn(log);
    else console.log(log);
  });
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Database info endpoint (for debugging)
app.get('/api/db-info', async (req, res) => {
  try {
    const { pool } = require('./database/init');
    const [rows] = await pool.query('SELECT COUNT(*) as user_count FROM users');
    const [users] = await pool.query('SELECT id, email, first_name, last_name, created_at FROM users ORDER BY created_at DESC LIMIT 10');
    const dbUrl = process.env.DATABASE_URL || 'Not set';
    const dbType = dbUrl.startsWith('mysql') ? 'MySQL' : dbUrl.startsWith('postgres') ? 'PostgreSQL' : 'Unknown';
    
    res.json({
      database_type: dbType,
      database_url_set: !!process.env.DATABASE_URL,
      database_url_prefix: dbUrl.substring(0, 10),
      users_in_db: rows[0].user_count,
      recent_users: users,
      connection: 'OK'
    });
  } catch (error) {
    res.status(500).json({
      database_type: 'Unknown',
      database_url_set: !!process.env.DATABASE_URL,
      error: error.message,
      connection: 'FAILED',
      statusCode: 500
    });
  }
});

// Delete user by email (for testing only - remove in production!)
app.delete('/api/test/delete-user/:email', async (req, res) => {
  try {
    const { pool } = require('./database/init');
    const { email } = req.params;
    
    const [result] = await pool.query('DELETE FROM users WHERE email = ?', [email]);
    
    res.json({
      success: true,
      message: `User ${email} deleted`,
      rows_affected: result.affectedRows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/deposit', (req, res) => {
  res.sendFile(path.join(__dirname, 'deposit.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// 404 for unknown API routes – always return JSON with statusCode so clients see 404
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.originalUrl,
    statusCode: 404
  });
});

// Global error handler – catch unhandled errors and return 500 + JSON (so Railway shows status)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'Something went wrong',
    statusCode: 500
  });
});

// Initialize database and start server
let dbInitialized = false;

async function tryInitDatabase() {
  try {
    await initDatabase();
    dbInitialized = true;
    console.log('✅ Database initialized successfully');
  } catch (err) {
    console.error('❌ Failed to initialize database:', err.message);
    console.log('⚠️  Server will start anyway and retry database connection...');
    
    // Retry every 10 seconds
    setTimeout(tryInitDatabase, 10000);
  }
}

// Start trying to initialize database
tryInitDatabase();

// Start server immediately (don't wait for database)
app.listen(PORT, () => {
  console.log(`🚀 Sentriom server running on port ${PORT}`);
  if (dbInitialized) {
    console.log(`📊 Database connected successfully`);
  } else {
    console.log(`⚠️  Database connection pending, will retry...`);
  }
});

module.exports = app;
