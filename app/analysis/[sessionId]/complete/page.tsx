'use client';

import TopNav from "@/components/navigation/TopNav";
import Breadcrumb from "@/components/navigation/Breadcrumb";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, CheckCircle, Clock, TrendingUp, TrendingDown, Minus, BarChart3, Brain, Globe, Target, Shield, Eye, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface AnalysisData {
  session_id: string;
  asset_pair: string;
  researcher_report?: string;
  sentiment_report?: string;
  news_report?: string;
  macro_report?: string;
  bull_report?: string;
  bear_report?: string;
  trader_report?: string;
  final_decision?: string;
  created_at: string;
  updated_at: string;
}

export default function CompleteAnalysisPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const agents = [
    {
      id: 'researcher',
      name: 'Market Researcher',
      description: 'Technical & fundamental analysis',
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      reportKey: 'researcher_report'
    },
    {
      id: 'sentiment',
      name: 'Sentiment Analyzer',
      description: 'Market sentiment analysis',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      reportKey: 'sentiment_report'
    },
    {
      id: 'news',
      name: 'News Intelligence',
      description: 'Latest market news',
      icon: Globe,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      reportKey: 'news_report'
    },
    {
      id: 'macro',
      name: 'Macro Economist',
      description: 'Macroeconomic factors',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      reportKey: 'macro_report'
    },
    {
      id: 'bull',
      name: 'Bull Advocate',
      description: 'Bullish case arguments',
      icon: TrendingUp,
      color: 'from-green-500 to-lime-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      reportKey: 'bull_report'
    },
    {
      id: 'bear',
      name: 'Bear Advocate',
      description: 'Bearish case arguments',
      icon: TrendingDown,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      reportKey: 'bear_report'
    },
    {
      id: 'trader',
      name: 'Hedge Fund Trader',
      description: 'Final trading decision',
      icon: Shield,
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
      reportKey: 'trader_report'
    }
  ];

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
  }, [sessionId]);

  const fetchAnalysisData = async () => {
    try {
      const response = await fetch(`/api/analysis/${sessionId}/researcher`);
      if (response.ok) {
        const data = await response.json();
        setAnalysisData(data);
        calculateProgress(data);
      }
    } catch (error) {
      toast.error('Failed to fetch analysis data');
    }
  };

  const calculateProgress = (data: AnalysisData) => {
    const completedAgents = agents.filter(agent => 
      data[agent.reportKey as keyof AnalysisData]
    ).length;
    setProgress((completedAgents / agents.length) * 100);
  };

  const runCompleteAnalysis = async () => {
    const { provider, apiKey } = getApiConfig() as { provider: string; apiKey: string };
    if (!apiKey) {
      toast.error('Please configure your API key in settings');
      router.push('/settings');
      return;
    }

    setIsRunning(true);
    setProgress(0);

    try {
      const response = await fetch(`/api/analysis/${sessionId}/run-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisData(data);
        setProgress(100);
        toast.success('Complete analysis finished!');
      } else {
        throw new Error('Failed to run complete analysis');
      }
    } catch (error) {
      toast.error('Failed to run complete analysis');
    } finally {
      setIsRunning(false);
    }
  };

  const getAgentStatus = (agent: any) => {
    if (!analysisData) return 'pending';
    return analysisData[agent.reportKey as keyof AnalysisData] ? 'complete' : 'pending';
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

  return (
    <div>
      <TopNav />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb sessionId={sessionId} assetPair={analysisData?.asset_pair} />

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => router.push('/')}
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 hover:bg-white/90 dark:hover:bg-slate-800/90"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                  Multi-Agent Analysis Pipeline
                </h1>
                <p className="text-slate-600 dark:text-slate-300 text-lg">
                  {analysisData?.asset_pair || 'Loading...'} • Complete AI Analysis
                </p>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <Card className="mb-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-slate-900 dark:text-white">
                    Analysis Control Panel
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    {isRunning ? 'Running complete analysis...' : `${Math.round(progress)}% Complete`}
                  </CardDescription>
                </div>
                <Button 
                  onClick={runCompleteAnalysis}
                  disabled={isRunning}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
                >
                  {isRunning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Running Analysis...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Run Complete Analysis
                    </>
                  )}
                </Button>
              </div>
              <Progress value={progress} className="mt-4" />
            </CardHeader>
          </Card>

          {/* Agent Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {agents.map((agent, index) => {
              const status = getAgentStatus(agent);
              return (
                <Card 
                  key={agent.id}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all cursor-pointer"
                  onClick={() => router.push(`/analysis/${sessionId}/${agent.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${agent.bgColor}`}>
                          <agent.icon className={`h-6 w-6 bg-gradient-to-br ${agent.color} bg-clip-text text-transparent`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-slate-900 dark:text-white">
                            {agent.name}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            Step {index + 1}
                          </CardDescription>
                        </div>
                      </div>
                      {status === 'complete' ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Complete
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Pending...
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                      {agent.description}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/analysis/${sessionId}/${agent.id}`);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      View Analysis
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Final Decision */}
          {analysisData?.final_decision && (
            <Card className={`mb-8 ${getDecisionColor(analysisData.final_decision)} border-2`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getDecisionIcon(analysisData.final_decision)}
                    <div>
                      <CardTitle className="text-2xl">
                        Final Decision: {analysisData.final_decision}
                      </CardTitle>
                      <CardDescription className="text-base mt-1">
                        Based on comprehensive analysis from all AI agents
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-4 gap-2 w-fit"
                  onClick={() => router.push(`/analysis/${sessionId}/trader`)}
                >
                  <Eye className="h-4 w-4" />
                  View Complete Trading Report
                </Button>
              </CardHeader>
            </Card>
          )}

          {/* How It Works */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 dark:text-white flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-blue-600" />
                How the AI Oracle Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Sequential Analysis Pipeline:
                  </h3>
                  <div className="space-y-3">
                    {agents.slice(0, 4).map((agent, index) => (
                      <div key={agent.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {agent.name}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-300">
                            {agent.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Final Decision Process:
                  </h3>
                  <div className="space-y-3">
                    {agents.slice(4).map((agent, index) => (
                      <div key={agent.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 5}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {agent.name}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-300">
                            {agent.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
