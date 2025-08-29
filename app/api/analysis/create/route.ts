import { NextRequest, NextResponse } from 'next/server';
import pool, { initializeDatabase } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const { assetPair } = await request.json();
    
    if (!assetPair) {
      return NextResponse.json({ error: 'Asset pair is required' }, { status: 400 });
    }

    const sessionId = uuidv4();
    const client = await pool.connect();
    
    try {
      await client.query(
        'INSERT INTO analyses (session_id, asset_pair) VALUES ($1, $2)',
        [sessionId, assetPair]
      );
      
      return NextResponse.json({ sessionId, assetPair });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating analysis:', error);
    return NextResponse.json({ error: 'Failed to create analysis' }, { status: 500 });
  }
}
