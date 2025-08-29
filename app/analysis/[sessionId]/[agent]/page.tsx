'use client';

import TopNav from "@/components/navigation/TopNav";
import Breadcrumb from "@/components/navigation/Breadcrumb";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Play, RefreshCw, TrendingUp, TrendingDown, Minus, BarChart3, Brain, Globe, Target, Shield, Sparkles, Eye, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface AnalysisData {
  asset_pair: string;
  researcher_report?: string;
  sentiment_report?: string;
  news_report?: string;
  macro_report?: string;
  bull_report?: string;
  bear_report?: string;
  trader_report?: string;
  final_decision?: string;
}

export default function AgentAnalysisPage() {
  const router = useRouter();
  const params = useParams();
  const { sessionId, agent } = params as { sessionId: string; agent: string };

  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const agentConfig = {
    researcher: {
      name: 'Market Researcher',
      description: 'Technical & Fundamental Analysis Expert',
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      reportKey: 'researcher_report'
    },
    sentiment: {
      name: 'Sentiment Analyzer',
      description: 'Market Psychology & Social Sentiment Expert',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      reportKey: 'sentiment_report'
    },
    news: {
      name: 'News Intelligence',
      description: 'Market News & Events Analysis Expert',
      icon: Globe,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      reportKey: 'news_report'
    },
    macro: {
      name: 'Macro Economist',
      description: 'Global Economic Trends & Policy Expert',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      reportKey: 'macro_report'
    },
    bull: {
      name: 'Bull Advocate',
      description: 'Bullish Case & Opportunity Identifier',
      icon: TrendingUp,
      color: 'from-green-500 to-lime-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      reportKey: 'bull_report'
    },
    bear: {
      name: 'Bear Advocate',
      description: 'Risk Assessment & Bearish Case Expert',
      icon: TrendingDown,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      reportKey: 'bear_report'
    },
    trader: {
      name: 'Hedge Fund Trader',
      description: 'Final Decision Maker & Risk Manager',
      icon: Shield,
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
      reportKey: 'trader_report'
    }
  };

  const currentAgent = agentConfig[agent as keyof typeof agentConfig];
  const agentKeys = Object.keys(agentConfig);
  const currentIndex = agentKeys.indexOf(agent);

  const getApiConfig = () => {
    const preferredModel = localStorage.getItem('preferredModel') || 'openai';
    const openaiKey = localStorage.getItem('openaiApiKey') || '';
    const geminiKey = localStorage.getItem('geminiApiKey') || '';

    if (preferredModel === 'openai' && openaiKey) {
      return { provider: 'openai', apiKey: openaiKey };
    }
    if (preferredModel === 'gemini' && geminiKey) {
      return { provider: 'gemini', apiKey: geminiKey };
    }
    return openaiKey ? { provider: 'openai', apiKey: openaiKey } : { provider: 'gemini', apiKey: geminiKey };
  };

  useEffect(() => {
    fetchAnalysisData();
  }, [sessionId, agent]);

  const fetchAnalysisData = async () => {
    try {
      const response = await fetch(`/api/analysis/${sessionId}/${agent}`);
      if (response.ok) {
        const data = await response.json();
        setAnalysisData(data);
      }
    } catch (error) {
      toast.error('Failed to fetch analysis data');
    }
  };

  const runAgent = async () => {
    const { provider, apiKey } = getApiConfig() as { provider: string; apiKey: string };
    if (!apiKey) {
      toast.error('Please configure your API key in settings');
      router.push('/settings');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/analysis/${sessionId}/${agent}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisData(data);
        toast.success(`${currentAgent.name} analysis completed!`);
      } else {
        throw new Error('Failed to run agent');
      }
    } catch (error) {
      toast.error(`Failed to run ${currentAgent.name}`);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToAgent = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < agentKeys.length) {
      router.push(`/analysis/${sessionId}/${agentKeys[newIndex]}`);
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision?.toUpperCase()) {
      case 'BUY':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'SELL':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      case 'HOLD':
        return <Minus className="h-5 w-5 text-yellow-600" />;
      default:
        return <Target className="h-5 w-5 text-slate-600" />;
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision?.toUpperCase()) {
      case 'BUY':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'SELL':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'HOLD':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200';
    }
  };

  const currentReport = analysisData?.[currentAgent.reportKey as keyof AnalysisData];

  return (
    <div>
      <TopNav />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb sessionId={sessionId} agent={agent} assetPair={analysisData?.asset_pair} />

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => router.push(`/analysis/${sessionId}/complete`)}
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 hover:bg-white/90 dark:hover:bg-slate-800/90"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                  {currentAgent.name}
                </h1>
                <p className="text-slate-600 dark:text-slate-300 text-lg">
                  {analysisData?.asset_pair || 'Loading...'} • {currentAgent.description}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateToAgent('prev')}
                disabled={currentIndex === 0}
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 hover:bg-white/90 dark:hover:bg-slate-800/90"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Badge variant="outline" className="px-3 py-1">
                {currentIndex + 1} of {agentKeys.length}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateToAgent('next')}
                disabled={currentIndex === agentKeys.length - 1}
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 hover:bg-white/90 dark:hover:bg-slate-800/90"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Agent Card */}
          <Card className="mb-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${currentAgent.bgColor}`}>
                    <currentAgent.icon className={`h-8 w-8 bg-gradient-to-br ${currentAgent.color} bg-clip-text text-transparent`} />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-slate-900 dark:text-white">
                      {currentAgent.name}
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      {currentAgent.description}
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {analysisData?.final_decision && agent === 'trader' && (
                    <Badge className={`gap-2 px-4 py-2 text-sm font-semibold ${getDecisionColor(analysisData.final_decision)}`}>
                      {getDecisionIcon(analysisData.final_decision)}
                      {analysisData.final_decision}
                    </Badge>
                  )}
                  
                  <Button 
                    onClick={runAgent}
                    disabled={isLoading}
                    className={`gap-2 bg-gradient-to-r ${currentAgent.color} hover:opacity-90 text-white px-6`}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Run Analysis
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Analysis Report */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-900 dark:text-white">
                      Analysis Report
                    </CardTitle>
                    <CardDescription>
                      {currentReport ? 'Generated analysis report' : 'No analysis available yet'}
                    </CardDescription>
                  </div>
                </div>
                
                {currentReport && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Analysis Complete</span>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              {currentReport ? (
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {currentReport}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    No Analysis Yet
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">
                    Click "Run Analysis" to generate a comprehensive report from the {currentAgent.name}.
                  </p>
                  <Button 
                    onClick={runAgent}
                    disabled={isLoading}
                    className={`gap-2 bg-gradient-to-r ${currentAgent.color} hover:opacity-90 text-white px-8`}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating Report...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate Analysis
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Footer */}
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={() => navigateToAgent('prev')}
              disabled={currentIndex === 0}
              className="gap-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 hover:bg-white/90 dark:hover:bg-slate-800/90"
            >
              <ArrowLeft className="h-4 w-4" />
              {currentIndex > 0 ? agentConfig[agentKeys[currentIndex - 1] as keyof typeof agentConfig].name : 'Previous'}
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push(`/analysis/${sessionId}/complete`)}
              className="gap-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 hover:bg-white/90 dark:hover:bg-slate-800/90"
            >
              <Eye className="h-4 w-4" />
              View All Agents
            </Button>

            <Button
              variant="outline"
              onClick={() => navigateToAgent('next')}
              disabled={currentIndex === agentKeys.length - 1}
              className="gap-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 hover:bg-white/90 dark:hover:bg-slate-800/90"
            >
              {currentIndex < agentKeys.length - 1 ? agentConfig[agentKeys[currentIndex + 1] as keyof typeof agentConfig].name : 'Next'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
