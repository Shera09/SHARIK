'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  RefreshCw,
  Settings,
  Zap,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowDownUp,
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  Info,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type AIProvider = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
};

type AIModel = {
  id: string;
  provider_id: string;
  name: string;
  model_id: string;
  model_type: string;
  context_window: number;
  max_output_tokens: number;
  input_cost_per_1k: number;
  output_cost_per_1k: number;
  supports_vision: boolean;
  supports_functions: boolean;
  capabilities: string[];
  is_active: boolean;
};

type RoutingRule = {
  id: string;
  name: string;
  priority: number;
  task_type: string;
  preferred_model_id: string;
  fallback_model_id: string | null;
  conditions: Record<string, any>;
  is_active: boolean;
};

export default function ModelRouterPage() {
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [modelDetailOpen, setModelDetailOpen] = useState(false);
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<any>(null);

  const loadData = useCallback(async () => {
    setLoading(true);

    const [providersRes, modelsRes, rulesRes] = await Promise.all([
      supabase.from('ai_providers').select('*').order('name'),
      supabase.from('ai_models').select('*').order('name'),
      supabase.from('model_routing_rules').select('*').order('priority', { ascending: false }),
    ]);

    if (providersRes.data) setProviders(providersRes.data);
    if (modelsRes.data) setModels(modelsRes.data);
    if (rulesRes.data) setRules(rulesRes.data);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getProviderName = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    return provider?.name || 'Unknown';
  };

  const getModelById = (modelId: string | null) => {
    if (!modelId) return null;
    return models.find(m => m.id === modelId);
  };

  const testRouting = () => {
    if (!testQuery.trim()) return;

    // Simulate routing logic
    const taskType = testQuery.toLowerCase().includes('code') ? 'code' :
                     testQuery.toLowerCase().includes('image') ? 'vision' :
                     testQuery.toLowerCase().includes('document') ? 'document' : 'chat';

    const matchingRule = rules.find(r => r.task_type === taskType && r.is_active);
    const preferredModel = matchingRule ? getModelById(matchingRule.preferred_model_id) : models.find(m => m.is_active && m.model_type === 'chat');
    const fallbackModel = matchingRule ? getModelById(matchingRule.fallback_model_id) : models.find(m => m.is_active && m.model_id.includes('mini'));

    setTestResult({
      taskType,
      rule: matchingRule?.name || 'Default Routing',
      preferred: preferredModel?.name || 'Not Found',
      fallback: fallbackModel?.name || 'Not Found',
      estimatedCost: preferredModel ? ((preferredModel.input_cost_per_1k * 0.5) + (preferredModel.output_cost_per_1k * 0.2)).toFixed(4) : '0.00',
    });
  };

  const modelTypes = ['chat', 'embedding', 'completion'];

  const groupedModels = models.reduce((acc, model) => {
    const providerId = model.provider_id;
    if (!acc[providerId]) acc[providerId] = [];
    acc[providerId].push(model);
    return acc;
  }, {} as Record<string, AIModel[]>);

  return (
    <AppShell>
      <PageHeader
        title="Model Router"
        description="Intelligent model selection based on task, cost, and performance"
        action={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Routing Rule
          </Button>
        }
      />

      {/* Routing Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Providers', value: providers.filter(p => p.is_active).length, icon: Cpu, color: 'text-blue-500' },
          { label: 'Active Models', value: models.filter(m => m.is_active).length, icon: Zap, color: 'text-green-500' },
          { label: 'Routing Rules', value: rules.filter(r => r.is_active).length, icon: Settings, color: 'text-purple-500' },
          { label: 'Avg Latency', value: '1.24s', icon: Clock, color: 'text-orange-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                <stat.icon className={cn('h-5 w-5', stat.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Test Router */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Test Model Router</h2>
        <div className="flex gap-4">
          <Input
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="Enter a sample request (e.g., 'Generate code for a login form', 'Analyze this image')"
            className="flex-1"
          />
          <Button onClick={testRouting} className="gap-2">
            <Play className="h-4 w-4" />
            Route
          </Button>
        </div>
        {testResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 rounded-xl bg-muted/30"
          >
            <div className="grid sm:grid-cols-5 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Detected Task</p>
                <Badge>{testResult.taskType}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Matched Rule</p>
                <p className="text-sm font-medium">{testResult.rule}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Preferred Model</p>
                <p className="text-sm font-medium">{testResult.preferred}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Fallback Model</p>
                <p className="text-sm font-medium">{testResult.fallback}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Est. Cost</p>
                <p className="text-sm font-medium">${testResult.estimatedCost}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Routing Rules */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Routing Rules</h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl shimmer" />)}
          </div>
        ) : rules.length === 0 ? (
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No routing rules configured</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule, i) => {
              const preferredModel = getModelById(rule.preferred_model_id);
              const fallbackModel = getModelById(rule.fallback_model_id);
              return (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ArrowDownUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{rule.name}</h3>
                        <Badge variant="outline">{rule.task_type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {preferredModel?.name || 'No model'} {fallbackModel && `→ ${fallbackModel.name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground">Priority</p>
                      <p className="text-sm font-medium">{rule.priority}</p>
                    </div>
                    <Switch checked={rule.is_active} />
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Models by Provider */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Available Models</h2>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-40 rounded-xl shimmer" />)}
          </div>
        ) : (
          Object.entries(groupedModels).map(([providerId, providerModels]) => (
            <div key={providerId} className="mb-6 last:mb-0">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {getProviderName(providerId)}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {providerModels.map((model, i) => (
                  <motion.div
                    key={model.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => { setSelectedModel(model); setModelDetailOpen(true); }}
                    className="p-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{model.name}</h4>
                        <p className="text-xs text-muted-foreground font-mono">{model.model_id}</p>
                      </div>
                      <Badge variant={model.is_active ? 'default' : 'outline'} className={model.is_active ? 'bg-success/20 text-success' : ''}>
                        {model.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {model.capabilities?.slice(0, 3).map((cap: string) => (
                        <Badge key={cap} variant="secondary" className="text-[9px] capitalize">
                          {cap}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Context</p>
                        <p className="font-medium">{(model.context_window / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cost/1K</p>
                        <p className="font-medium">
                          ${model.input_cost_per_1k.toFixed(4)} / ${model.output_cost_per_1k.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Model Detail Dialog */}
      <Dialog open={modelDetailOpen} onOpenChange={setModelDetailOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedModel?.name}
              <Badge variant="outline">{selectedModel?.model_type}</Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedModel && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-mono">{selectedModel.model_id}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-muted/30 text-center">
                  <p className="text-xs text-muted-foreground">Context Window</p>
                  <p className="font-bold">{selectedModel.context_window.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 text-center">
                  <p className="text-xs text-muted-foreground">Max Output</p>
                  <p className="font-bold">{selectedModel.max_output_tokens.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 text-center">
                  <p className="text-xs text-muted-foreground">Vision</p>
                  <p className="font-bold">{selectedModel.supports_vision ? 'Yes' : 'No'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 text-center">
                  <p className="text-xs text-muted-foreground">Functions</p>
                  <p className="font-bold">{selectedModel.supports_functions ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Capabilities</p>
                <div className="flex flex-wrap gap-2">
                  {selectedModel.capabilities?.map((cap: string) => (
                    <Badge key={cap} variant="secondary" className="capitalize">{cap}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Pricing (per 1K tokens)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Input</p>
                    <p className="text-xl font-bold">${selectedModel.input_cost_per_1k.toFixed(6)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Output</p>
                    <p className="text-xl font-bold">${selectedModel.output_cost_per_1k.toFixed(6)}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1">
                  <Zap className="h-4 w-4 mr-2" />
                  Use for Routing
                </Button>
                <Button variant="outline">
                  <Info className="h-4 w-4 mr-2" />
                  API Docs
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
