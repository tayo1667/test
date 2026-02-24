const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false 
  } : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20
});

// Initialize database tables
async function initDatabase() {
  let retries = 5;
  let lastError;
  
  while (retries > 0) {
    const client = await pool.connect().catch(err => {
      console.log(`Database connection attempt failed, ${retries} retries left...`);
      lastError = err;
      return null;
    });
    
    if (!client) {
      retries--;
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      continue;
    }
    
    try {
      console.log('✅ Connected to database, initializing tables...');
      
      // Create users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          full_name VARCHAR(200) NOT NULL,
          otp_code VARCHAR(6),
          otp_expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create deposits table
      await client.query(`
        CREATE TABLE IF NOT EXISTS deposits (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          crypto VARCHAR(10) NOT NULL,
          crypto_name VARCHAR(50) NOT NULL,
          amount DECIMAL(20, 8) NOT NULL,
          usd_value DECIMAL(20, 2) NOT NULL,
          plan INTEGER NOT NULL,
          apy DECIMAL(5, 2) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          korapay_reference VARCHAR(100),
          maturity_date TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create sessions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(500) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
        CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
        CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
        CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      `);

      console.log('✅ Database tables initialized successfully');
      client.release();
      return;
    } catch (error) {
      console.error('❌ Error initializing database:', error);
      client.release();
      throw error;
    }
  }
  
  throw lastError || new Error('Failed to connect to database after multiple retries');
}

module.exports = { pool, initDatabase };
