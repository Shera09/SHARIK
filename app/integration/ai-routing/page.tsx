'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Cpu,
  DollarSign,
  Zap,
  Activity,
  Settings,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface AIProvider {
  provider_id: string;
  provider_name: string;
  provider_type: string;
  models: string[];
  is_active: boolean;
  health_status: string;
  latency_avg_ms: number;
  cost_per_1k_tokens: number;
  last_health_check: string;
}

interface ModelRouting {
  rule_id: string;
  model_name: string;
  provider_id: string;
  fallback_provider_id: string | null;
  use_case: string;
  priority: number;
  is_active: boolean;
}

interface AICost {
  date: string;
  provider_name: string;
  total_tokens: number;
  total_cost: number;
  requests: number;
}

const providerColors: Record<string, string> = {
  openai: 'from-green-500/20 to-emerald-500/20',
  anthropic: 'from-orange-500/20 to-amber-500/20',
  google: 'from-blue-500/20 to-cyan-500/20',
  azure: 'from-indigo-500/20 to-blue-500/20',
  local: 'from-slate-500/20 to-zinc-500/20',
};

const providerStatusColors: Record<string, string> = {
  healthy: 'bg-green-500/10 text-green-600',
  degraded: 'bg-yellow-500/10 text-yellow-600',
  offline: 'bg-red-500/10 text-red-600',
};

// Mock data
const mockProviders: AIProvider[] = [
  { provider_id: '1', provider_name: 'OpenAI', provider_type: 'openai', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'], is_active: true, health_status: 'healthy', latency_avg_ms: 890, cost_per_1k_tokens: 0.03, last_health_check: new Date().toISOString() },
  { provider_id: '2', provider_name: 'Anthropic', provider_type: 'anthropic', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'], is_active: true, health_status: 'healthy', latency_avg_ms: 720, cost_per_1k_tokens: 0.025, last_health_check: new Date().toISOString() },
  { provider_id: '3', provider_name: 'Google AI', provider_type: 'google', models: ['gemini-pro', 'gemini-ultra'], is_active: true, health_status: 'healthy', latency_avg_ms: 650, cost_per_1k_tokens: 0.002, last_health_check: new Date().toISOString() },
  { provider_id: '4', provider_name: 'Azure OpenAI', provider_type: 'azure', models: ['gpt-4', 'gpt-35-turbo'], is_active: false, health_status: 'offline', latency_avg_ms: 0, cost_per_1k_tokens: 0.04, last_health_check: new Date().toISOString() },
];

const mockRoutingRules: ModelRouting[] = [
  { rule_id: '1', model_name: 'default', provider_id: '1', fallback_provider_id: '2', use_case: 'general', priority: 1, is_active: true },
  { rule_id: '2', model_name: 'reasoning', provider_id: '2', fallback_provider_id: '1', use_case: 'complex-analysis', priority: 2, is_active: true },
  { rule_id: '3', model_name: 'fast', provider_id: '3', fallback_provider_id: '1', use_case: 'quick-response', priority: 3, is_active: true },
  { rule_id: '4', model_name: 'code', provider_id: '1', fallback_provider_id: '2', use_case: 'code-generation', priority: 4, is_active: true },
];

const mockCosts: AICost[] = [
  { date: '2024-01-01', provider_name: 'OpenAI', total_tokens: 12500000, total_cost: 375.00, requests: 45230 },
  { date: '2024-01-01', provider_name: 'Anthropic', total_tokens: 8200000, total_cost: 205.00, requests: 28900 },
  { date: '2024-01-01', provider_name: 'Google AI', total_tokens: 25000000, total_cost: 50.00, requests: 89450 },
];

export default function AIRoutingPage() {
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<AIProvider[]>(mockProviders);
  const [routingRules, setRoutingRules] = useState<ModelRouting[]>(mockRoutingRules);
  const [costs, setCosts] = useState<AICost[]>(mockCosts);
  const [createRuleOpen, setCreateRuleOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [providersRes, rulesRes, costsRes] = await Promise.all([
        supabase.from('ai_provider_credentials').select('*'),
        supabase.from('ai_model_routing_rules').select('*'),
        supabase.from('ai_costs_daily').select('*').order('date', { ascending: false }).limit(30),
      ]);

      if (providersRes.data && providersRes.data.length > 0) {
        // Merge with mock data for visualization
        setProviders(mockProviders.map(p => {
          const dbProvider = providersRes.data?.find(d => d.provider_name === p.provider_name);
          return dbProvider ? { ...p, ...dbProvider } : p;
        }));
      }
      if (rulesRes.data && rulesRes.data.length > 0) setRoutingRules(rulesRes.data);
      if (costsRes.data && costsRes.data.length > 0) setCosts(costsRes.data);
    } catch (error) {
      console.error('Error loading AI routing data:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalRequests = costs.reduce((sum, c) => sum + c.requests, 0);
  const totalTokens = costs.reduce((sum, c) => sum + c.total_tokens, 0);
  const totalCost = costs.reduce((sum, c) => sum + c.total_cost, 0);
  const healthyProviders = providers.filter(p => p.health_status === 'healthy').length;

  return (
    <AppShell>
      <PageHeader
        title="AI Provider Routing"
        description="Multi-provider AI orchestration with fallbacks and cost optimization"
        action={
          <Button className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            Add Provider
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Providers', value: providers.length, icon: Cpu, color: 'text-blue-500' },
          { label: 'Healthy', value: healthyProviders, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Total Requests', value: totalRequests.toLocaleString(), icon: Zap, color: 'text-purple-500' },
          { label: 'Total Tokens', value: `${(totalTokens / 1000000).toFixed(1)}M`, icon: Layers, color: 'text-cyan-500' },
          { label: 'Monthly Cost', value: `$${totalCost.toFixed(2)}`, icon: DollarSign, color: 'text-amber-500' },
          { label: 'Avg Latency', value: `${Math.round(providers.reduce((s, p) => s + p.latency_avg_ms, 0) / providers.length)}ms`, icon: Clock, color: 'text-orange-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={cn('h-4 w-4', stat.color)} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="providers" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="providers" className="rounded-lg gap-1.5">
            <Cpu className="h-4 w-4" />
            Providers
          </TabsTrigger>
          <TabsTrigger value="routing" className="rounded-lg gap-1.5">
            <ArrowRight className="h-4 w-4" />
            Model Routing
          </TabsTrigger>
          <TabsTrigger value="costs" className="rounded-lg gap-1.5">
            <DollarSign className="h-4 w-4" />
            Cost Tracking
          </TabsTrigger>
        </TabsList>

        {/* Providers Tab */}
        <TabsContent value="providers" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {providers.map((provider, i) => (
              <motion.div
                key={provider.provider_id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="overflow-hidden">
                  <div className={cn('h-1 bg-gradient-to-r', providerColors[provider.provider_type] || 'from-slate-500/20 to-zinc-500/20')} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        {provider.provider_name}
                      </CardTitle>
                      <Badge className={cn('text-[10px]', providerStatusColors[provider.health_status])}>
                        {provider.health_status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Latency</span>
                      <span className="font-medium">{provider.latency_avg_ms}ms</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Cost/1K</span>
                      <span className="font-medium">${provider.cost_per_1k_tokens.toFixed(4)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {provider.models.slice(0, 3).map((model) => (
                        <Badge key={model} variant="outline" className="text-[10px]">{model}</Badge>
                      ))}
                      {provider.models.length > 3 && (
                        <Badge variant="outline" className="text-[10px]">+{provider.models.length - 3}</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground">Active</span>
                      <Switch checked={provider.is_active} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Routing Rules Tab */}
        <TabsContent value="routing" className="mt-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Model Routing Rules</CardTitle>
                  <CardDescription>Configure which providers to use for different use cases</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setCreateRuleOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Use Case</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Primary Provider</TableHead>
                    <TableHead>Fallback</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routingRules.map((rule, i) => {
                    const primaryProvider = providers.find(p => p.provider_id === rule.provider_id);
                    const fallbackProvider = providers.find(p => p.provider_id === rule.fallback_provider_id);

                    return (
                      <motion.tr
                        key={rule.rule_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <TableCell className="font-medium capitalize">{rule.use_case}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{rule.model_name}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="text-[10px]">{primaryProvider?.provider_name || rule.provider_id}</Badge>
                        </TableCell>
                        <TableCell>
                          {fallbackProvider && (
                            <Badge variant="outline" className="text-[10px]">{fallbackProvider.provider_name}</Badge>
                          )}
                        </TableCell>
                        <TableCell>{rule.priority}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            rule.is_active ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                          )}>
                            {rule.is_active ? 'Active' : 'Disabled'}
                          </Badge>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs" className="mt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cost by Provider</CardTitle>
                <CardDescription>Tokens and costs breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {costs.map((cost, i) => {
                    const percent = (cost.total_cost / totalCost) * 100;
                    return (
                      <div key={`${cost.provider_name}-${i}`}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium">{cost.provider_name}</span>
                          <span className="text-muted-foreground">
                            {(cost.total_tokens / 1000000).toFixed(1)}M tokens | ${cost.total_cost.toFixed(2)}
                          </span>
                        </div>
                        <Progress value={percent} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cost Trends</CardTitle>
                <CardDescription>Daily AI usage summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {costs.slice(0, 7).map((cost, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="text-sm font-medium">{cost.provider_name}</p>
                        <p className="text-xs text-muted-foreground">{cost.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">${cost.total_cost.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{cost.requests.toLocaleString()} req</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
