import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { AIService, agentPrompts, AIConfig } from '@/lib/ai-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; agent: string }> }
) {
  try {
    const { sessionId, agent } = await params;
    const { apiKey, provider } = await request.json();

    if (!apiKey || !provider) {
      return NextResponse.json({ error: 'API key and provider are required' }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      // Get existing analysis data
      const result = await client.query(
        'SELECT * FROM analyses WHERE session_id = $1',
        [sessionId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Analysis session not found' }, { status: 404 });
      }

      const analysis = result.rows[0];
      const aiService = new AIService({ provider, apiKey } as AIConfig);

      let report = '';
      let prompt = '';

      switch (agent) {
        case 'researcher':
          const searchResults = await aiService.searchWeb(`${analysis.asset_pair} technical analysis price chart`);
          prompt = `Analyze ${analysis.asset_pair} with the following market data: ${searchResults.join('. ')}`;
          report = await aiService.generateResponse(prompt, agentPrompts.researcher);
          await client.query(
            'UPDATE analyses SET researcher_report = $1, updated_at = CURRENT_TIMESTAMP WHERE session_id = $2',
            [report, sessionId]
          );
          break;

        case 'sentiment':
          const sentimentData = await aiService.searchWeb(`${analysis.asset_pair} sentiment analysis social media`);
          prompt = `Analyze sentiment for ${analysis.asset_pair} based on: ${sentimentData.join('. ')}`;
          report = await aiService.generateResponse(prompt, agentPrompts.sentiment);
          await client.query(
            'UPDATE analyses SET sentiment_report = $1, updated_at = CURRENT_TIMESTAMP WHERE session_id = $2',
            [report, sessionId]
          );
          break;

        case 'news':
          const newsData = await aiService.searchWeb(`${analysis.asset_pair} latest news today`);
          prompt = `Find and analyze recent news for ${analysis.asset_pair}: ${newsData.join('. ')}`;
          report = await aiService.generateResponse(prompt, agentPrompts.news);
          await client.query(
            'UPDATE analyses SET news_report = $1, updated_at = CURRENT_TIMESTAMP WHERE session_id = $2',
            [report, sessionId]
          );
          break;

        case 'macro':
          const macroData = await aiService.searchWeb(`${analysis.asset_pair} macroeconomic factors interest rates`);
          prompt = `Analyze macroeconomic factors for ${analysis.asset_pair}: ${macroData.join('. ')}`;
          report = await aiService.generateResponse(prompt, agentPrompts.macro);
          await client.query(
            'UPDATE analyses SET macro_report = $1, updated_at = CURRENT_TIMESTAMP WHERE session_id = $2',
            [report, sessionId]
          );
          break;

        case 'bull':
          prompt = `Based on the following analysis for ${analysis.asset_pair}, make a bullish case:
            Research: ${analysis.researcher_report || 'Not available'}
            Sentiment: ${analysis.sentiment_report || 'Not available'}
            News: ${analysis.news_report || 'Not available'}
            Macro: ${analysis.macro_report || 'Not available'}`;
          report = await aiService.generateResponse(prompt, agentPrompts.bull);
          await client.query(
            'UPDATE analyses SET bull_report = $1, updated_at = CURRENT_TIMESTAMP WHERE session_id = $2',
            [report, sessionId]
          );
          break;

        case 'bear':
          prompt = `Based on the following analysis for ${analysis.asset_pair}, make a bearish case:
            Research: ${analysis.researcher_report || 'Not available'}
            Sentiment: ${analysis.sentiment_report || 'Not available'}
            News: ${analysis.news_report || 'Not available'}
            Macro: ${analysis.macro_report || 'Not available'}`;
          report = await aiService.generateResponse(prompt, agentPrompts.bear);
          await client.query(
            'UPDATE analyses SET bear_report = $1, updated_at = CURRENT_TIMESTAMP WHERE session_id = $2',
            [report, sessionId]
          );
          break;

        case 'trader':
          prompt = `As a hedge fund trader, make a final decision on ${analysis.asset_pair} based on all analysis:
            Research: ${analysis.researcher_report || 'Not available'}
            Sentiment: ${analysis.sentiment_report || 'Not available'}
            News: ${analysis.news_report || 'Not available'}
            Macro: ${analysis.macro_report || 'Not available'}
            Bull Case: ${analysis.bull_report || 'Not available'}
            Bear Case: ${analysis.bear_report || 'Not available'}`;
          report = await aiService.generateResponse(prompt, agentPrompts.trader);
          
          // Extract decision from report
          const decision = report.toLowerCase().includes('buy') ? 'BUY' : 
                          report.toLowerCase().includes('sell') ? 'SELL' : 'HOLD';
          
          await client.query(
            'UPDATE analyses SET trader_report = $1, final_decision = $2, updated_at = CURRENT_TIMESTAMP WHERE session_id = $3',
            [report, decision, sessionId]
          );
          break;

        default:
          return NextResponse.json({ error: 'Invalid agent' }, { status: 400 });
      }

      return NextResponse.json({ report, agent, sessionId });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error running agent:', error);
    return NextResponse.json({ error: 'Failed to run agent analysis' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; agent: string }> }
) {
  try {
    const { sessionId } = await params;
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM analyses WHERE session_id = $1',
        [sessionId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Analysis session not found' }, { status: 404 });
      }

      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json({ error: 'Failed to fetch analysis' }, { status: 500 });
  }
}
