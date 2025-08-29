import { NextRequest, NextResponse } from 'next/server';
import pool, { initializeDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const { userId, openaiApiKey, geminiApiKey, preferredModel } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      // Upsert user settings
      await client.query(`
        INSERT INTO user_settings (user_id, openai_api_key, gemini_api_key, preferred_model, updated_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          openai_api_key = EXCLUDED.openai_api_key,
          gemini_api_key = EXCLUDED.gemini_api_key,
          preferred_model = EXCLUDED.preferred_model,
          updated_at = CURRENT_TIMESTAMP
      `, [userId, openaiApiKey, geminiApiKey, preferredModel]);
      
      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM user_settings WHERE user_id = $1',
        [userId]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json({ 
          openaiApiKey: '', 
          geminiApiKey: '', 
          preferredModel: 'openai' 
        });
      }
      
      const settings = result.rows[0];
      return NextResponse.json({
        openaiApiKey: settings.openai_api_key || '',
        geminiApiKey: settings.gemini_api_key || '',
        preferredModel: settings.preferred_model || 'openai'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
