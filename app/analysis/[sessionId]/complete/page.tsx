'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, CheckCircle, Clock, AlertCircle } from 'lucide-react';
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

export default function CompleteAnalysisPage() {
  const router = useRouter();
  const params = useParams();
  const { sessionId } = params as { sessionId: string };

  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState('');

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
  }, []);

  const fetchAnalysisData = async () => {
    try {
      const response = await fetch(`/api/analysis/${sessionId}/researcher`);
      if (response.ok) {
        const data = await response.json();
        setAnalysisData(data);
      }
    } catch (error) {
      toast.error('Failed to fetch analysis data');
    }
  };

  const runAllAgents = async () => {
    const { provider, apiKey } = getApiConfig() as any;
    if (!apiKey) {
      toast.error('Please configure your API key in settings');
      router.push('/settings');
      return;
    }

    setIsRunning(true);
    setCurrentStep('Starting analysis...');

    try {
      const response = await fetch(`/api/analysis/${sessionId}/run-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Analysis complete! Final decision: ${result.finalDecision}`);
        await fetchAnalysisData(); // Refresh data
      } else {
        throw new Error('Failed to run analysis');
      }
    } catch (error) {
      toast.error('Failed to run complete analysis');
    } finally {
      setIsRunning(false);
      setCurrentStep('');
    }
  };

  const agents = [
    { name: 'Researcher', key: 'researcher_report', description: 'Technical & fundamental analysis' },
    { name: 'Sentiment', key: 'sentiment_report', description: 'Market sentiment analysis' },
    { name: 'News', key: 'news_report', description: 'Latest market news' },
    { name: 'Macro', key: 'macro_report', description: 'Macroeconomic factors' },
    { name: 'Bull', key: 'bull_report', description: 'Bullish case arguments' },
    { name: 'Bear', key: 'bear_report', description: 'Bearish case arguments' },
    { name: 'Hedge Fund Trader', key: 'trader_report', description: 'Final trading decision' },
  ];

  const getAgentStatus = (key: string) => {
    if (!analysisData) return 'pending';
    return analysisData[key as keyof AnalysisData] ? 'completed' : 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'running':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Running</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6 gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Complete AI Analysis</h1>
            <p className="text-slate-600">
              {analysisData?.asset_pair || 'Loading...'} - Multi-Agent Trading Analysis
            </p>
          </div>
        </div>

        {/* Run All Agents Button */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Multi-Agent Analysis Pipeline
            </CardTitle>
            <CardDescription>
              Run all 6 AI agents in sequence to get a comprehensive trading analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button 
                onClick={runAllAgents} 
                disabled={isRunning}
                size="lg"
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                {isRunning ? 'Running All Agents...' : 'Run Complete Analysis'}
              </Button>
              {isRunning && (
                <div className="text-sm text-slate-600">
                  {currentStep}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Agent Status Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {agents.map((agent, index) => {
            const status = getAgentStatus(agent.key);
            return (
              <Card key={agent.name} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                    </div>
                    {getStatusBadge(status)}
                  </div>
                  <CardDescription>{agent.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Step {index + 1}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/analysis/${sessionId}/${agent.key.replace('_report', '')}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Final Decision */}
        {analysisData?.final_decision && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-xl text-blue-900">
                Final Trading Decision: {analysisData.final_decision}
              </CardTitle>
              <CardDescription className="text-blue-700">
                Based on comprehensive analysis from all AI agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push(`/analysis/${sessionId}/trader`)}
                className="gap-2"
              >
                View Complete Trading Report
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Sequential Analysis:</h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>Researcher analyzes technical & fundamental data</li>
                  <li>Sentiment agent evaluates market psychology</li>
                  <li>News agent compiles relevant market news</li>
                  <li>Macro agent assesses economic factors</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Final Decision:</h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-600" start={5}>
                  <li>Bull agent argues for buying the asset</li>
                  <li>Bear agent argues for selling the asset</li>
                  <li>Hedge Fund Trader makes final BUY/SELL/HOLD decision</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
