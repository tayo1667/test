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

// CORS
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

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
