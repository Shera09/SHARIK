'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Server,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Zap,
  RefreshCw,
  Settings,
  Eye,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type ModelHealth = {
  id: string;
  model_id: string;
  is_healthy: boolean;
  latency_p50: number;
  latency_p95: number;
  latency_p99: number;
  error_rate: number;
  availability_pct: number;
  last_success_at: string;
};

export default function AIObservabilityPage() {
  const [loading, setLoading] = useState(true);
  const [modelHealth, setModelHealth] = useState<ModelHealth[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('ai_model_health').select('*');
    if (data) setModelHealth(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const mockModels = [
    { name: 'GPT-4o', status: 'healthy', latency: 1250, availability: 99.9, requests: 15423 },
    { name: 'Claude 4 Sonnet', status: 'healthy', latency: 1850, availability: 99.7, requests: 8234 },
    { name: 'GPT-4o Mini', status: 'healthy', latency: 420, availability: 99.9, requests: 28412 },
    { name: 'Gemini 1.5 Pro', status: 'degraded', latency: 2100, availability: 98.5, requests: 4521 },
    { name: 'Claude 3.5 Haiku', status: 'healthy', latency: 380, availability: 99.8, requests: 1711 },
  ];

  const orchestrationLogs = [
    { time: '10:42:33', stage: 'prompt_builder', status: 'success', latency: 45 },
    { time: '10:42:34', stage: 'context_retrieval', status: 'success', latency: 120 },
    { time: '10:42:35', stage: 'model_router', status: 'success', latency: 12 },
    { time: '10:42:38', stage: 'response_validation', status: 'success', latency: 2100 },
    { time: '10:42:38', stage: 'memory_update', status: 'success', latency: 85 },
  ];

  return (
    <AppShell>
      <PageHeader
        title="AI Observability"
        description="Real-time monitoring, logging, and performance dashboards"
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Configure
            </Button>
          </div>
        }
      />

      {/* System Health Overview */}
      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'System Health', value: '99.6%', icon: Server, color: 'text-green-500' },
          { label: 'Avg Latency', value: '1.2s', icon: Clock, color: 'text-blue-500' },
          { label: 'Requests/min', value: '234', icon: Activity, color: 'text-purple-500' },
          { label: 'Error Rate', value: '0.4%', icon: AlertTriangle, color: 'text-yellow-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center">
                <stat.icon className={cn('h-5 w-5', stat.color)} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Model Health */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Model Health Status</h2>
        <div className="space-y-3">
          {mockModels.map((model, i) => (
            <motion.div
              key={model.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl bg-muted/20"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-3 h-3 rounded-full',
                    model.status === 'healthy' ? 'bg-green-500' : model.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                  )} />
                  <h3 className="font-medium">{model.name}</h3>
                </div>
                <Badge variant={model.status === 'healthy' ? 'default' : 'outline'} className={model.status === 'healthy' ? 'bg-success/20 text-success' : 'bg-yellow-500/20 text-yellow-600'}>
                  {model.status}
                </Badge>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Latency</p>
                  <p className="font-medium">{model.latency}ms</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Availability</p>
                  <p className="font-medium">{model.availability}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Requests</p>
                  <p className="font-medium">{model.requests.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Error Rate</p>
                  <p className="font-medium">{(100 - model.availability).toFixed(1)}%</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="logs">Orchestration Logs</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline Metrics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Orchestration Logs</h2>
            <div className="space-y-2">
              {orchestrationLogs.map((log, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-muted-foreground">{log.time}</span>
                    <Badge variant="outline">{log.stage}</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">{log.latency}ms</span>
                    <Badge className="bg-success/20 text-success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {log.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pipeline">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Pipeline Stage Metrics</h2>
            <div className="grid sm:grid-cols-4 gap-4">
              {[
                { stage: 'Auth', latency: 12, success: 100 },
                { stage: 'Context', latency: 120, success: 99.8 },
                { stage: 'Router', latency: 8, success: 100 },
                { stage: 'Model', latency: 1850, success: 99.5 },
              ].map((p, i) => (
                <div key={i} className="p-4 rounded-xl bg-muted/20 text-center">
                  <p className="font-medium mb-2">{p.stage}</p>
                  <p className="text-2xl font-bold">{p.latency}ms</p>
                  <p className="text-xs text-muted-foreground">{p.success}% success</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Active Alerts</h2>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-4">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">High Latency Warning</p>
                  <p className="text-sm text-muted-foreground">Gemini 1.5 Pro latency above 2000ms threshold</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
