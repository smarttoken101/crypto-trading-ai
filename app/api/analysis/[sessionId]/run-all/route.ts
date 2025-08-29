import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { AgentService } from '@/lib/agent-service';
import { AIConfig } from '@/lib/ai-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const { apiKey, provider } = await request.json();

    if (!apiKey || !provider) {
      return NextResponse.json({ error: 'API key and provider are required' }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      // Get the asset pair for this session
      const analysisResult = await client.query(
        'SELECT asset_pair FROM analyses WHERE session_id = $1',
        [sessionId]
      );

      if (analysisResult.rows.length === 0) {
        return NextResponse.json({ error: 'Analysis session not found' }, { status: 404 });
      }
      const { asset_pair: assetPair } = analysisResult.rows[0];

      // Instantiate and run the new agent service
      const agentService = new AgentService({ provider, apiKey } as AIConfig);
      console.log(`Starting agent workflow for session ${sessionId}, asset ${assetPair}`);
      const finalState = await agentService.run(assetPair);
      console.log(`Agent workflow for session ${sessionId} completed.`);

      // Save the complete results to the database
      const {
        researcherReport,
        sentimentReport,
        newsReport,
        macroReport,
        bullReport,
        bearReport,
        traderReport,
        finalDecision,
        predictedPriceRange
      } = finalState;

      await client.query(
        `UPDATE analyses
         SET
           researcher_report = $1,
           sentiment_report = $2,
           news_report = $3,
           macro_report = $4,
           bull_report = $5,
           bear_report = $6,
           trader_report = $7,
           final_decision = $8,
           predicted_price_range = $9,
           updated_at = CURRENT_TIMESTAMP
         WHERE session_id = $10`,
        [
          researcherReport,
          sentimentReport,
          newsReport,
          macroReport,
          bullReport,
          bearReport,
          traderReport,
          finalDecision,
          predictedPriceRange,
          sessionId
        ]
      );

      console.log(`Successfully saved final analysis for session ${sessionId} to the database.`);

      return NextResponse.json({ 
        success: true,
        message: 'All agents completed successfully',
        finalDecision: finalDecision,
        sessionId 
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error running all agents:', error);
    // Check if error is an object and has a message property
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to run all agents', details: errorMessage }, { status: 500 });
  }
}
