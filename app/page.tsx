'use client';

import TopNav from "@/components/navigation/TopNav";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, TrendingDown, BarChart3, Brain, Globe, Target, Shield, Sparkles, Settings, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function HomePage() {
  const router = useRouter();
  const [assetPair, setAssetPair] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const popularPairs = [
    { pair: 'BTC/USD', change: '+2.4%', trending: 'up' },
    { pair: 'ETH/USD', change: '-1.2%', trending: 'down' },
    { pair: 'XAU/USD', change: '+0.8%', trending: 'up' },
    { pair: 'EUR/USD', change: '-0.3%', trending: 'down' },
    { pair: 'GBP/USD', change: '+1.1%', trending: 'up' },
    { pair: 'ADA/USD', change: '+3.2%', trending: 'up' }
  ];

  const agents = [
    {
      name: 'Market Researcher',
      description: 'Analyzes technical indicators, chart patterns, and fundamental data',
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20'
    },
    {
      name: 'Sentiment Analyzer',
      description: 'Evaluates market psychology and social media sentiment',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20'
    },
    {
      name: 'News Intelligence',
      description: 'Processes latest market news and economic events',
      icon: Globe,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20'
    },
    {
      name: 'Macro Economist',
      description: 'Analyzes global economic trends and policy impacts',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20'
    },
    {
      name: 'Bull Advocate',
      description: 'Identifies bullish opportunities and positive catalysts',
      icon: TrendingUp,
      color: 'from-green-500 to-lime-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20'
    },
    {
      name: 'Bear Advocate',
      description: 'Assesses risks and potential bearish scenarios',
      icon: TrendingDown,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50 dark:bg-red-950/20'
    },
    {
      name: 'Hedge Fund Trader',
      description: 'Makes final trading decisions based on all analysis',
      icon: Shield,
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20'
    }
  ];

  const startAnalysis = async () => {
    if (!assetPair.trim()) {
      toast.error('Please enter an asset pair');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analysis/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetPair: assetPair.toUpperCase() }),
      });

      if (response.ok) {
        const { sessionId } = await response.json();
        router.push(`/analysis/${sessionId}/complete`);
      } else {
        throw new Error('Failed to create analysis session');
      }
    } catch (error) {
      toast.error('Failed to start analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      startAnalysis();
    }
  };

  return (
    <div>
      <TopNav />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <Badge className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 mr-2" />
              Powered by Advanced AI
            </Badge>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent leading-tight">
              AI Trading Oracle
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Harness the power of 7 specialized AI agents to make informed trading decisions. 
              Get comprehensive analysis from technical indicators to market sentiment.
            </p>

            {/* Analysis Input */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex gap-4 p-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/20">
                <Input
                  placeholder="Enter asset pair (e.g., BTC/USD, ETH/USD, XAU/USD)"
                  value={assetPair}
                  onChange={(e) => setAssetPair(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 border-0 bg-transparent text-lg placeholder:text-slate-400 focus-visible:ring-0"
                />
                <Button 
                  onClick={startAnalysis}
                  disabled={isAnalyzing}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      Analyze Now
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Popular Trading Pairs */}
            <div className="mb-12">
              <p className="text-slate-600 dark:text-slate-300 mb-4">Popular trading pairs:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {popularPairs.map((item) => (
                  <Button
                    key={item.pair}
                    variant="outline"
                    size="sm"
                    onClick={() => setAssetPair(item.pair)}
                    className="gap-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/20 hover:bg-white/80 dark:hover:bg-slate-800/80"
                  >
                    <span className="font-medium">{item.pair}</span>
                    <span className={`text-xs ${item.trending === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {item.change}
                    </span>
                    {item.trending === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* New Feature Badge */}
            <Badge className="mb-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 text-base font-semibold">
              <Sparkles className="h-5 w-5 mr-2" />
              New: Complete Multi-Agent Pipeline
            </Badge>
          </div>

          {/* AI Agents Grid */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
              Meet Your AI Trading Team
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 text-center mb-12 max-w-3xl mx-auto">
              Seven specialized AI agents work together to provide comprehensive market analysis
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {agents.map((agent, index) => (
                <Card 
                  key={agent.name}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all hover:scale-105 cursor-pointer group"
                >
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${agent.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <agent.icon className={`h-8 w-8 bg-gradient-to-br ${agent.color} bg-clip-text text-transparent`} />
                    </div>
                    <CardTitle className="text-lg text-slate-900 dark:text-white">
                      {agent.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {agent.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
              <CardHeader className="text-center">
                <CardTitle className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                  How It Works
                </CardTitle>
                <CardDescription className="text-xl max-w-3xl mx-auto">
                  Our AI Oracle follows a systematic approach to deliver accurate trading insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">1</span>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      Data Collection
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      AI agents gather real-time market data, news, and sentiment from multiple sources
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">2</span>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      Multi-Agent Analysis
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      Each specialized agent analyzes different aspects: technical, fundamental, sentiment, and macro
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">3</span>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      Final Decision
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      The Hedge Fund Trader synthesizes all analysis to provide a clear BUY/SELL/HOLD recommendation
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              <CardContent className="py-12">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Make Smarter Trading Decisions?
                </h2>
                <p className="text-xl mb-8 text-blue-100">
                  Configure your AI settings and start analyzing markets with professional-grade insights
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => router.push('/settings')}
                    variant="secondary"
                    size="lg"
                    className="gap-2 bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-semibold"
                  >
                    <Settings className="h-5 w-5" />
                    Configure AI Settings
                  </Button>
                  <Button 
                    onClick={() => setAssetPair('BTC/USD')}
                    variant="outline"
                    size="lg"
                    className="gap-2 border-white text-white hover:bg-white/10 px-8 py-3 text-lg font-semibold"
                  >
                    <Target className="h-5 w-5" />
                    Try Demo Analysis
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
