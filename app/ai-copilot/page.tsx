'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Bot,
  BrainCircuit,
  TrendingUp,
  FileText,
  Zap,
  CheckCircle,
  RefreshCw,
  Sliders,
  DollarSign,
  Send,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AISalesCopilotPage() {
  const { user } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini' | 'anthropic' | 'azure' | 'local'>('openai');
  const [isLoading, setIsLoading] = useState(false);
  const [copilotOutput, setCopilotOutput] = useState<any>(null);
  const [proposalOutput, setProposalOutput] = useState('');

  const handleRunCopilotAnalysis = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: '00000000-0000-0000-0000-000000000000',
          lead_name: 'TechCorp Enterprise Deal',
          company: 'TechCorp Systems',
          value: 25000,
          provider: selectedProvider,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCopilotOutput(data);
        toast.success(`Generated analysis via ${selectedProvider.toUpperCase()}`);
      } else {
        toast.error(data.error || 'AI Copilot failed');
      }
    } catch {
      toast.error('Network error running AI Copilot');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-teal-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            Enterprise AI Sales Copilot Platform
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Multi-provider AI intelligence (OpenAI, Gemini, Anthropic, Azure, Local) for lead scoring & proposal generation.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 px-2">Provider:</span>
          {(['openai', 'gemini', 'anthropic', 'azure', 'local'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setSelectedProvider(p)}
              className={`px-3 py-1 rounded-lg transition-all font-semibold uppercase ${
                selectedProvider === p ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Copilot Controls */}
        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" /> Sales Opportunity Analyzer
            </CardTitle>
            <CardDescription>Analyze lead parameters using selected AI Provider.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 space-y-2 text-xs">
              <p className="text-slate-400">Target Deal: <strong className="text-white">TechCorp Enterprise</strong></p>
              <p className="text-slate-400">Annual Revenue Value: <strong className="text-teal-400">$25,000 / year</strong></p>
              <p className="text-slate-400">Current AI Engine: <strong className="text-purple-300 uppercase">{selectedProvider}</strong></p>
            </div>

            <Button onClick={handleRunCopilotAnalysis} disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2">
              <Zap className="w-4 h-4" /> Run AI Copilot Analysis
            </Button>
          </CardContent>
        </Card>

        {/* Right Column: AI Insights & Lead Scoring */}
        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-teal-400" /> Predictive Insights & Next Best Action
            </CardTitle>
            <CardDescription>Real-time AI recommendations and conversion probability.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {copilotOutput ? (
              <div className="space-y-4">
                {/* Score Card */}
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                  <div>
                    <p className="text-xs text-slate-400">Predictive Lead Score</p>
                    <p className="text-3xl font-bold text-teal-400">{copilotOutput.predictive_score?.score} / 100</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-500/20 text-green-400">{copilotOutput.predictive_score?.quality} QUALITY</Badge>
                    <p className="text-xs text-slate-400 mt-1">Conversion: {copilotOutput.predictive_score?.conversionProbability}</p>
                  </div>
                </div>

                {/* Insight Summary */}
                <div className="p-4 bg-purple-950/20 border border-purple-800/40 rounded-xl space-y-2 text-xs">
                  <p className="font-semibold text-purple-300">AI Summary:</p>
                  <p className="text-slate-300">{copilotOutput.analysis?.insight?.summary}</p>
                  <p className="font-semibold text-teal-300 mt-2">Next Best Action:</p>
                  <p className="text-slate-300">{copilotOutput.analysis?.insight?.next_best_action}</p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                Click &quot;Run AI Copilot Analysis&quot; to generate sales insights.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
