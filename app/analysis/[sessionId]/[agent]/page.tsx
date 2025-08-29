'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AgentPage() {
  const router = useRouter();
  const params = useParams();
  const { sessionId, agent } = params as { sessionId: string; agent: string };

  const [report, setReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // In production, fetch user settings for API keys. For now, we use local storage
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
    // fallback to openai if available
    return openaiKey ? { provider: 'openai', apiKey: openaiKey } : { provider: 'gemini', apiKey: geminiKey };
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/analysis/${sessionId}/${agent}`);
      if (response.ok) {
        const data = await response.json();
        const key = `${agent}_report`;
        if (data[key]) {
          setReport(data[key]);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const runAgent = async () => {
    const { provider, apiKey } = getApiConfig() as any;
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
        setReport(data.report);
      } else {
        throw new Error('Agent failed');
      }
    } catch (error) {
      toast.error('Failed to run agent');
    } finally {
      setIsLoading(false);
    }
  };

  const agentSteps = [
    'researcher',
    'sentiment', 
    'news',
    'macro',
    'bull',
    'bear',
    'trader',
  ];

  const currentIndex = agentSteps.indexOf(agent);

  const goToPrev = () => {
    if (currentIndex > 0) {
      router.push(`/analysis/${sessionId}/${agentSteps[currentIndex - 1]}`);
    }
  };
  const goToNext = () => {
    if (currentIndex < agentSteps.length - 1) {
      router.push(`/analysis/${sessionId}/${agentSteps[currentIndex + 1]}`);
    }
  };

  const getAgentTitle = (agentName: string) => {
    switch(agentName) {
      case 'bull': return 'Bull Agent';
      case 'bear': return 'Bear Agent';
      case 'trader': return 'Hedge Fund Trader';
      default: return `${agentName.charAt(0).toUpperCase() + agentName.slice(1)} Agent`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6 gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/')}> 
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {getAgentTitle(agent)} Analysis
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{getAgentTitle(agent)} Report</CardTitle>
            <CardDescription>
              {report ? 'Generated analysis report' : 'No report yet. Click "Run Agent" to generate.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating report...
              </div>
            ) : (
              <pre className="whitespace-pre-wrap text-slate-800 text-sm leading-relaxed">
                {report || 'No report available.'}
              </pre>
            )}

            <div className="flex gap-4 mt-6">
              <Button onClick={runAgent} disabled={isLoading}>
                {isLoading ? 'Running...' : 'Run Agent'}
              </Button>
              <Button variant="outline" onClick={goToPrev} disabled={currentIndex === 0}>
                Previous
              </Button>
              <Button variant="outline" onClick={goToNext} disabled={currentIndex === agentSteps.length - 1}>
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
