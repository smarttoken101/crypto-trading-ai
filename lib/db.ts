import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'crypto_trading_ai',
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

export default pool;

// Initialize database tables
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create analyses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS analyses (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        asset_pair VARCHAR(50) NOT NULL,
        researcher_report TEXT,
        sentiment_report TEXT,
        news_report TEXT,
        macro_report TEXT,
        bull_report TEXT,
        bear_report TEXT,
        trader_report TEXT,
        final_decision VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_settings table for API keys
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        openai_api_key TEXT,
        gemini_api_key TEXT,
        preferred_model VARCHAR(50) DEFAULT 'openai',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    client.release();
  }
}
