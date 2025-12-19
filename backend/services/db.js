const mysql = require('mysql2/promise');
const { Pool } = require('pg');

let pool = null;
const DB_TYPE = process.env.DB_TYPE || 'mysql'; // 'mysql' or 'postgres'

const mysqlConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'travels_user',
    password: process.env.DB_PASSWORD || 'travels_password',
    database: process.env.DB_NAME || 'travels_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const postgresConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'mytraveler',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

/**
 * Initialize database connection pool
 */
async function initDatabase() {
    try {
        if (DB_TYPE === 'postgres') {
            pool = new Pool(postgresConfig);
            const client = await pool.connect();
            console.log('✅ PostgreSQL Database connected successfully');
            client.release();
        } else {
            pool = mysql.createPool(mysqlConfig);
            const connection = await pool.getConnection();
            console.log('✅ MySQL Database connected successfully');
            connection.release();
        }

        // Create tables if they don't exist
        await createTables();

        return pool;
    } catch (error) {
        console.error(`❌ ${DB_TYPE} Database connection failed:`, error.message);
        throw error;
    }
}

/**
 * Create necessary tables
 */
async function createTables() {
    try {
        if (DB_TYPE === 'postgres') {
            // PostgreSQL syntax
            await queryRaw(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          google_id VARCHAR(255) UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          picture VARCHAR(500),
          provider VARCHAR(50) DEFAULT 'local',
          is_verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

            await queryRaw(`
        CREATE TABLE IF NOT EXISTS bookings (
          id SERIAL PRIMARY KEY,
          user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          booking_reference VARCHAR(20) NOT NULL UNIQUE,
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
          flight_data JSONB NOT NULL,
          passenger_data JSONB NOT NULL,
          pricing_data JSONB NOT NULL,
          payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
          payment_method VARCHAR(50),
          payment_transaction_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
        } else {
            // MySQL syntax
            await queryRaw(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          google_id VARCHAR(255) UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          picture VARCHAR(500),
          provider VARCHAR(50) DEFAULT 'local',
          is_verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

            await queryRaw(`
        CREATE TABLE IF NOT EXISTS bookings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          booking_reference VARCHAR(20) NOT NULL UNIQUE,
          status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
          flight_data JSON NOT NULL,
          passenger_data JSON NOT NULL,
          pricing_data JSON NOT NULL,
          payment_status ENUM('pending', 'paid', 'refunded', 'failed') DEFAULT 'pending',
          payment_method VARCHAR(50),
          payment_transaction_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
        }

        console.log('✅ Users table ready');
        console.log('✅ Bookings table ready');
        console.log('✅ All database tables created/verified');
    } catch (error) {
        console.error('❌ Error creating tables:', error.message);
        throw error;
    }
}

/**
 * Get the database pool
 */
function getPool() {
    if (!pool) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return pool;
}

/**
 * Execute raw query (for table creation)
 */
async function queryRaw(sql) {
    const db = getPool();
    if (DB_TYPE === 'postgres') {
        const result = await db.query(sql);
        return result.rows;
    } else {
        const [results] = await db.execute(sql);
        return results;
    }
}

/**
 * Execute a query - handles both MySQL and PostgreSQL
 */
async function query(sql, params = []) {
    const db = getPool();

    if (DB_TYPE === 'postgres') {
        // PostgreSQL uses $1, $2, etc. for placeholders
        // Convert ? to $1, $2, etc. for PostgreSQL
        let pgSql = sql;
        let paramIndex = 1;
        pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);

        const result = await db.query(pgSql, params);
        return result.rows;
    } else {
        // MySQL
        const [results] = await db.execute(sql, params);
        return results;
    }
}

/**
 * Close database connection
 */
async function closeDatabase() {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('Database connection closed');
    }
}

module.exports = {
    initDatabase,
    getPool,
    query,
    closeDatabase,
    DB_TYPE
};
