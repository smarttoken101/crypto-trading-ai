export interface AgentState {
  assetPair: string;
  historicalAnalysis: Record<string, any> | null; // To store the memory
  researcherReport?: string;
  sentimentReport?: string;
  newsReport?: string;
  macroReport?: string;
  bullReport?: string;
  bearReport?: string;
  traderReport?: string;
  finalDecision?: 'BUY' | 'SELL' | 'HOLD';
  predictedPriceRange?: string;
}
