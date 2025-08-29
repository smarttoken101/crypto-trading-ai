'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Brain, Settings, BarChart3, Play } from 'lucide-react';
import { toast } from 'sonner';

export default function HomePage() {
  const [assetPair, setAssetPair] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStartAnalysis = async () => {
    if (!assetPair.trim()) {
      toast.error('Please enter an asset pair (e.g., BTC/USD, EUR/USD)');
      return;
    }

    setIsLoading(true);
    try {
      // Create new analysis session
      const response = await fetch('/api/analysis/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetPair: assetPair.toUpperCase() }),
      });

      if (!response.ok) throw new Error('Failed to create analysis');
      
      const { sessionId } = await response.json();
      router.push(`/analysis/${sessionId}/complete`);
    } catch (error) {
      toast.error('Failed to start analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const agents = [
    { name: 'Researcher', icon: BarChart3, description: 'Technical & fundamental analysis' },
    { name: 'Sentiment', icon: Brain, description: 'Market sentiment analysis' },
    { name: 'News', icon: TrendingUp, description: 'Latest market news' },
    { name: 'Macro', icon: Settings, description: 'Macroeconomic factors' },
    { name: 'Bull vs Bear', icon: TrendingUp, description: 'Opposing viewpoints' },
    { name: 'Hedge Fund Trader', icon: Brain, description: 'Final trading decision' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-slate-900 mb-6">
            AI Trading Analysis
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Get comprehensive crypto and forex analysis from our multi-agent AI system. 
            Six specialized agents work together to provide you with the most thorough trading insights.
          </p>
          
          {/* Asset Input */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex gap-2">
              <Input
                placeholder="Enter asset pair (e.g., BTC/USD, EUR/USD)"
                value={assetPair}
                onChange={(e) => setAssetPair(e.target.value)}
                className="text-lg py-6"
                onKeyPress={(e) => e.key === 'Enter' && handleStartAnalysis()}
              />
              <Button 
                onClick={handleStartAnalysis}
                disabled={isLoading}
                className="px-8 py-6 text-lg gap-2"
              >
                <Play className="h-5 w-5" />
                {isLoading ? 'Starting...' : 'Analyze'}
              </Button>
            </div>
          </div>

          <div className="flex justify-center gap-2 mb-12">
            <Badge variant="secondary">BTC/USD</Badge>
            <Badge variant="secondary">ETH/USD</Badge>
            <Badge variant="secondary">EUR/USD</Badge>
            <Badge variant="secondary">GBP/USD</Badge>
            <Badge variant="secondary">XAU/USD</Badge>
          </div>
        </div>

        {/* AI Agents Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {agents.map((agent, index) => (
            <Card key={agent.name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <agent.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{agent.name} Agent</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      Step {index + 1}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {agent.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Enter Asset Pair</h3>
              <p className="text-slate-600">Input any crypto or forex pair you want to analyze</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sequential AI Analysis</h3>
              <p className="text-slate-600">Six specialized agents analyze different aspects in sequence</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Final Decision</h3>
              <p className="text-slate-600">Hedge fund trader reviews all reports and makes BUY/SELL decision</p>
            </div>
          </div>
        </div>

        {/* New Feature Highlight */}
        <Card className="mt-16 border-2 border-blue-200 bg-blue-50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-blue-900 flex items-center justify-center gap-2">
              <Play className="h-6 w-6" />
              New: Complete Multi-Agent Pipeline
            </CardTitle>
            <CardDescription className="text-blue-700 text-lg">
              All 6 agents now work together in sequence. The final Hedge Fund Trader agent 
              reads ALL previous reports to make the most informed trading decision.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Settings Link */}
        <div className="text-center mt-16">
          <Button 
            variant="outline" 
            onClick={() => router.push('/settings')}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Configure AI Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
