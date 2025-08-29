import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.PGHOST,
  port: 5432,
  database: 'postgres', // Connect to the default Supabase database
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;

// Initialize database tables
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create analyses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.analyses (
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
        predicted_price_range VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_settings table for API keys
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.user_settings (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        openai_api_key TEXT,
        gemini_api_key TEXT,
        preferred_model VARCHAR(50) DEFAULT 'openai',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    // Re-throw the error to be caught by the calling function
    throw error;
  } finally {
    client.release();
  }
}

// Get the latest analysis for a given asset pair
export async function getLatestAnalysisByAsset(assetPair: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM public.analyses
       WHERE asset_pair = $1 AND trader_report IS NOT NULL
       ORDER BY created_at DESC
       LIMIT 1`,
      [assetPair]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting latest analysis by asset:', error);
    return null;
  } finally {
    client.release();
  }
}
