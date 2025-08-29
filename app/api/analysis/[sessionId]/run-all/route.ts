import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { AIService, agentPrompts, AIConfig } from '@/lib/ai-service';

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

      // Step 1: Run Researcher Agent
      console.log('Running Researcher Agent...');
      const searchResults = await aiService.searchWeb(`${analysis.asset_pair} technical analysis price chart`);
      const researchPrompt = `Analyze ${analysis.asset_pair} with the following market data: ${searchResults.join('. ')}`;
      const researchReport = await aiService.generateResponse(researchPrompt, agentPrompts.researcher);
      
      await client.query(
        'UPDATE analyses SET researcher_report = $1, updated_at = CURRENT_TIMESTAMP WHERE session_id = $2',
        [researchReport, sessionId]
      );

      // Step 2: Run Sentiment Agent
      console.log('Running Sentiment Agent...');
      const sentimentData = await aiService.searchWeb(`${analysis.asset_pair} sentiment analysis social media`);
      const sentimentPrompt = `Analyze sentiment for ${analysis.asset_pair} based on: ${sentimentData.join('. ')}`;
      const sentimentReport = await aiService.generateResponse(sentimentPrompt, agentPrompts.sentiment);
      
      await client.query(
        'UPDATE analyses SET sentiment_report = $1, updated_at = CURRENT_TIMESTAMP WHERE session_id = $2',
        [sentimentReport, sessionId]
      );

      // Step 3: Run News Agent
      console.log('Running News Agent...');
      const newsData = await aiService.searchWeb(`${analysis.asset_pair} latest news today`);
      const newsPrompt = `Find and analyze recent news for ${analysis.asset_pair}: ${newsData.join('. ')}`;
      const newsReport = await aiService.generateResponse(newsPrompt, agentPrompts.news);
      
      await client.query(
        'UPDATE analyses SET news_report = $1, updated_at = CURRENT_TIMESTAMP WHERE session_id = $2',
        [newsReport, sessionId]
      );

      // Step 4: Run Macro Agent
      console.log('Running Macro Agent...');
      const macroData = await aiService.searchWeb(`${analysis.asset_pair} macroeconomic factors interest rates`);
      const macroPrompt = `Analyze macroeconomic factors for ${analysis.asset_pair}: ${macroData.join('. ')}`;
      const macroReport = await aiService.generateResponse(macroPrompt, agentPrompts.macro);
      
      await client.query(
        'UPDATE analyses SET macro_report = $1, updated_at = CURRENT_TIMESTAMP WHERE session_id = $2',
        [macroReport, sessionId]
      );

      // Step 5: Run Bull Agent
      console.log('Running Bull Agent...');
      const bullPrompt = `Based on the following analysis for ${analysis.asset_pair}, make a bullish case:
        Research: ${researchReport}
        Sentiment: ${sentimentReport}
        News: ${newsReport}
        Macro: ${macroReport}`;
      const bullReport = await aiService.generateResponse(bullPrompt, agentPrompts.bull);
      
      await client.query(
        'UPDATE analyses SET bull_report = $1, updated_at = CURRENT_TIMESTAMP WHERE session_id = $2',
        [bullReport, sessionId]
      );

      // Step 6: Run Bear Agent
      console.log('Running Bear Agent...');
      const bearPrompt = `Based on the following analysis for ${analysis.asset_pair}, make a bearish case:
        Research: ${researchReport}
        Sentiment: ${sentimentReport}
        News: ${newsReport}
        Macro: ${macroReport}`;
      const bearReport = await aiService.generateResponse(bearPrompt, agentPrompts.bear);
      
      await client.query(
        'UPDATE analyses SET bear_report = $1, updated_at = CURRENT_TIMESTAMP WHERE session_id = $2',
        [bearReport, sessionId]
      );

      // Step 7: Run Final Hedge Fund Trader Agent
      console.log('Running Final Hedge Fund Trader Agent...');
      const traderPrompt = `As a hedge fund trader, make a final decision on ${analysis.asset_pair} based on ALL analysis from your team:

RESEARCHER ANALYSIS:
${researchReport}

SENTIMENT ANALYSIS:
${sentimentReport}

NEWS ANALYSIS:
${newsReport}

MACROECONOMIC ANALYSIS:
${macroReport}

BULL CASE:
${bullReport}

BEAR CASE:
${bearReport}

Based on all this comprehensive analysis, make your final BUY, SELL, or HOLD decision with detailed reasoning.`;
      
      const traderReport = await aiService.generateResponse(traderPrompt, agentPrompts.trader);
      
      // Extract decision from report
      const decision = traderReport.toLowerCase().includes('buy') ? 'BUY' : 
                      traderReport.toLowerCase().includes('sell') ? 'SELL' : 'HOLD';
      
      await client.query(
        'UPDATE analyses SET trader_report = $1, final_decision = $2, updated_at = CURRENT_TIMESTAMP WHERE session_id = $3',
        [traderReport, decision, sessionId]
      );

      console.log('All agents completed successfully!');

      return NextResponse.json({ 
        success: true,
        message: 'All agents completed successfully',
        finalDecision: decision,
        sessionId 
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error running all agents:', error);
    return NextResponse.json({ error: 'Failed to run all agents' }, { status: 500 });
  }
}
