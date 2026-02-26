const mysql = require('mysql2/promise');

// Build MySQL config from DATABASE_URL or env vars
function getConfig() {
  const url = process.env.DATABASE_URL;
  if (url && url.startsWith('mysql')) {
    try {
      const parsed = new URL(url);
      return {
        host: parsed.hostname,
        port: parsed.port || 3306,
        user: parsed.username,
        password: parsed.password,
        database: (parsed.pathname || '/').slice(1) || 'sentriom',
        waitForConnections: true,
        connectionLimit: 20,
        queueLimit: 0,
        connectTimeout: 10000,
        ssl: process.env.NODE_ENV === 'production' && parsed.searchParams.get('ssl') !== 'false'
          ? { rejectUnauthorized: false }
          : undefined
      };
    } catch (e) {
      console.warn('Failed to parse DATABASE_URL, using MYSQL_* env vars');
    }
  }
  return {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'sentriom',
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    connectTimeout: 10000
  };
}

const pool = mysql.createPool(getConfig());

// Initialize database tables
async function initDatabase() {
  let retries = 5;
  let lastError;

  while (retries > 0) {
    let connection;
    try {
      connection = await pool.getConnection();
    } catch (err) {
      console.log(`Database connection attempt failed, ${retries} retries left...`);
      lastError = err;
      retries--;
      await new Promise(resolve => setTimeout(resolve, 2000));
      continue;
    }

    try {
      console.log('✅ Connected to database, initializing tables...');

      // Ensure we use the right database
      const db = getConfig().database;
      if (db) {
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${db}\``);
        await connection.query(`USE \`${db}\``);
      }

      // Create users table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          full_name VARCHAR(200) NOT NULL,
          otp_code VARCHAR(6),
          otp_expires_at DATETIME,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Create deposits table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS deposits (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          crypto VARCHAR(10) NOT NULL,
          crypto_name VARCHAR(50) NOT NULL,
          amount DECIMAL(20, 8) NOT NULL,
          usd_value DECIMAL(20, 2) NOT NULL,
          plan INT NOT NULL,
          apy DECIMAL(5, 2) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          korapay_reference VARCHAR(100),
          maturity_date DATETIME,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Create sessions table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          token VARCHAR(500) NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Create indexes (ignore if exists)
      const indexes = [
        'CREATE INDEX idx_users_email ON users(email)',
        'CREATE INDEX idx_deposits_user_id ON deposits(user_id)',
        'CREATE INDEX idx_deposits_status ON deposits(status)',
        'CREATE INDEX idx_sessions_token ON sessions(token)',
        'CREATE INDEX idx_sessions_user_id ON sessions(user_id)'
      ];
      for (const sql of indexes) {
        try {
          await connection.query(sql);
        } catch (e) {
          if (e.code !== 'ER_DUP_KEYNAME' && e.code !== 'ER_DUP_INDEX') throw e;
        }
      }

      console.log('✅ Database tables initialized successfully');
      connection.release();
      return;
    } catch (error) {
      console.error('❌ Error initializing database:', error);
      connection.release();
      throw error;
    }
  }

  throw lastError || new Error('Failed to connect to database after multiple retries');
}

module.exports = { pool, initDatabase };
