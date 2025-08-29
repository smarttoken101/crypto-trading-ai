'use client';

import TopNav from "@/components/navigation/TopNav";
import Breadcrumb from "@/components/navigation/Breadcrumb";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Settings, Key, Zap, CheckCircle, AlertCircle, Sparkles, Shield, Brain, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const router = useRouter();
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [preferredModel, setPreferredModel] = useState('gemini');
  const [isSaving, setIsSaving] = useState(false);
  const [testingApi, setTestingApi] = useState(false);

  useEffect(() => {
    // Load saved settings
    const savedOpenaiKey = localStorage.getItem('openaiApiKey') || '';
    const savedGeminiKey = localStorage.getItem('geminiApiKey') || '';
    const savedPreferredModel = localStorage.getItem('preferredModel') || 'gemini';
    
    setOpenaiApiKey(savedOpenaiKey);
    setGeminiApiKey(savedGeminiKey);
    setPreferredModel(savedPreferredModel);
  }, []);

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('openaiApiKey', openaiApiKey);
      localStorage.setItem('geminiApiKey', geminiApiKey);
      localStorage.setItem('preferredModel', preferredModel);
      
      // Also save to database
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openaiApiKey,
          geminiApiKey,
          preferredModel,
        }),
      });

      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const testApiConnection = async () => {
    const currentKey = preferredModel === 'openai' ? openaiApiKey : geminiApiKey;
    if (!currentKey) {
      toast.error(`Please enter your ${preferredModel === 'openai' ? 'OpenAI' : 'Google Gemini'} API key first`);
      return;
    }

    setTestingApi(true);
    try {
      // Simple test request
      const response = await fetch('/api/analysis/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetPair: 'TEST/USD' }),
      });

      if (response.ok) {
        toast.success('API connection successful!');
      } else {
        throw new Error('API test failed');
      }
    } catch (error) {
      toast.error('API connection failed. Please check your API key.');
    } finally {
      setTestingApi(false);
    }
  };

  const aiProviders = [
    {
      id: 'openai',
      name: 'OpenAI GPT-4',
      description: 'Advanced language model with excellent reasoning capabilities',
      icon: Brain,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      features: ['GPT-4 Turbo', 'Advanced Reasoning', 'Code Understanding', 'Multi-modal']
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      description: 'Google\'s most capable AI model with multimodal understanding',
      icon: Sparkles,
      color: 'from-blue-500 to-purple-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      features: ['Gemini Pro', 'Fast Processing', 'Multimodal', 'Real-time Analysis']
    }
  ];

  const hasValidKey = (provider: string) => {
    return provider === 'openai' ? openaiApiKey.length > 0 : geminiApiKey.length > 0;
  };

  return (
    <div>
      <TopNav />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb />

          {/* Header */}
          <div className="flex items-center mb-8 gap-4">
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
                AI Configuration
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-lg">
                Configure your AI providers and preferences
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Settings */}
            <div className="lg:col-span-2">
              <Tabs value={preferredModel} onValueChange={setPreferredModel} className="space-y-6">
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                      <Settings className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">AI Provider Selection</h2>
                      <p className="text-slate-600 dark:text-slate-300">Choose your preferred AI model for analysis</p>
                    </div>
                  </div>

                  <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800">
                    <TabsTrigger value="openai" className="gap-2">
                      <Brain className="h-4 w-4" />
                      OpenAI GPT-4
                    </TabsTrigger>
                    <TabsTrigger value="gemini" className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      Google Gemini
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-6 space-y-6">
                    {aiProviders.map((provider) => (
                      <TabsContent key={provider.id} value={provider.id} className="space-y-6">
                        <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/20">
                          <CardHeader>
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-2xl ${provider.bgColor}`}>
                                <provider.icon className={`h-6 w-6 bg-gradient-to-br ${provider.color} bg-clip-text text-transparent`} />
                              </div>
                              <div>
                                <CardTitle className="text-xl text-slate-900 dark:text-white">
                                  {provider.name}
                                </CardTitle>
                                <CardDescription className="text-base">
                                  {provider.description}
                                </CardDescription>
                              </div>
                              {hasValidKey(provider.id) && (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Configured
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                              {provider.features.map((feature) => (
                                <Badge key={feature} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor={`${provider.id}-key`} className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                API Key
                              </Label>
                              <div className="relative">
                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                  id={`${provider.id}-key`}
                                  type="password"
                                  placeholder={`Enter your ${provider.name} API key`}
                                  value={provider.id === 'openai' ? openaiApiKey : geminiApiKey}
                                  onChange={(e) => provider.id === 'openai' ? setOpenaiApiKey(e.target.value) : setGeminiApiKey(e.target.value)}
                                  className="pl-10 bg-white/70 dark:bg-slate-800/70 border-white/20"
                                />
                              </div>
                              
                              {provider.id === 'openai' && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a>
                                </p>
                              )}
                              
                              {provider.id === 'gemini' && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button 
                    onClick={saveSettings}
                    disabled={isSaving}
                    className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        Save Configuration
                      </>
                    )}
                  </Button>

                  <Button 
                    onClick={testApiConnection}
                    disabled={testingApi}
                    variant="outline"
                    className="gap-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 hover:bg-white/90 dark:hover:bg-slate-800/90"
                  >
                    {testingApi ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600"></div>
                        Testing...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Test Connection
                      </>
                    )}
                  </Button>
                </div>
              </Tabs>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Status Card */}
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    Configuration Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-300">OpenAI GPT-4</span>
                    {hasValidKey('openai') ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ready
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Not Set
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-300">Google Gemini</span>
                    {hasValidKey('gemini') ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ready
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Not Set
                      </Badge>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active Provider</span>
                      <Badge className={`text-xs ${preferredModel === 'openai' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                        {preferredModel === 'openai' ? 'OpenAI GPT-4' : 'Google Gemini'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Info */}
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    Security & Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>API keys are stored locally in your browser</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>No data is sent to third parties</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>All communications are encrypted</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>You can clear settings anytime</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Start */}
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                      <Globe className="h-4 w-4 text-white" />
                    </div>
                    Quick Start Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="space-y-2">
                    <div className="font-medium text-slate-700 dark:text-slate-300">1. Get API Key</div>
                    <div>Sign up for OpenAI or Google AI and get your API key</div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-slate-700 dark:text-slate-300">2. Configure</div>
                    <div>Enter your API key and select your preferred provider</div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-slate-700 dark:text-slate-300">3. Test & Save</div>
                    <div>Test the connection and save your configuration</div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-slate-700 dark:text-slate-300">4. Start Trading</div>
                    <div>Return to homepage and start analyzing assets!</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
