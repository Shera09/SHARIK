'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  LayoutDashboard,
  Key,
  Zap,
  GitBranch,
  Brain,
  Plug,
  Store,
  Code,
  Activity,
  Lock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Globe,
  Database,
  Webhook,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface IntegrationHealth {
  connector_name: string;
  status: string;
  last_sync: string | null;
  error_count_24h: number;
  latency_ms: number | null;
}

interface ActiveAlert {
  id: string;
  alert_type: string;
  severity: string;
  message: string;
  triggered_at: string;
}

interface ApiUsage {
  total_requests: number;
  success_rate: number;
  avg_latency_ms: number;
  rate_limit_hits: number;
}

const hubModules = [
  { label: 'API Gateway', href: '/integration/api-gateway', icon: Key, description: 'Manage APIs, keys, and rate limiting', color: 'from-blue-500/20 to-cyan-500/20' },
  { label: 'Webhooks', href: '/integration/webhooks', icon: Zap, description: 'Outgoing and incoming webhook management', color: 'from-amber-500/20 to-orange-500/20' },
  { label: 'Event Bus', href: '/integration/events', icon: GitBranch, description: 'Event-driven architecture and routing', color: 'from-purple-500/20 to-pink-500/20' },
  { label: 'AI Routing', href: '/integration/ai-routing', icon: Brain, description: 'Multi-provider AI orchestration', color: 'from-rose-500/20 to-red-500/20' },
  { label: 'Connectors', href: '/integration/connectors', icon: Plug, description: 'Installed integrations and sync status', color: 'from-emerald-500/20 to-teal-500/20' },
  { label: 'Marketplace', href: '/integration/marketplace', icon: Store, description: 'Browse and install new connectors', color: 'from-indigo-500/20 to-violet-500/20' },
  { label: 'Developer', href: '/integration/developer', icon: Code, description: 'API docs, SDKs, and sandbox', color: 'from-cyan-500/20 to-sky-500/20' },
  { label: 'Monitoring', href: '/integration/monitoring', icon: Activity, description: 'Health dashboards and alerts', color: 'from-green-500/20 to-lime-500/20' },
  { label: 'Secrets', href: '/integration/secrets', icon: Lock, description: 'Secure credentials vault', color: 'from-slate-500/20 to-zinc-500/20' },
];

export default function IntegrationHubPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [healthData, setHealthData] = useState<IntegrationHealth[]>([]);
  const [alerts, setAlerts] = useState<ActiveAlert[]>([]);
  const [apiUsage, setApiUsage] = useState<ApiUsage | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [healthRes, alertsRes] = await Promise.all([
        supabase.from('integration_health').select('*').order('connector_name'),
        supabase.from('integration_alerts').select('*').eq('resolved_at', null).order('triggered_at', { ascending: false }).limit(10),
      ]);

      if (healthRes.data) setHealthData(healthRes.data);
      if (alertsRes.data) setAlerts(alertsRes.data);

      // Mock API usage for demo
      setApiUsage({
        total_requests: 156789,
        success_rate: 99.7,
        avg_latency_ms: 145,
        rate_limit_hits: 23,
      });
    } catch (error) {
      console.error('Error loading integration data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  const healthyCount = healthData.filter(h => h.status === 'healthy').length;
  const warningCount = healthData.filter(h => h.status === 'warning').length;
  const criticalCount = healthData.filter(h => h.status === 'critical').length;

  const overallHealth = criticalCount > 0 ? 'critical' : warningCount > 0 ? 'warning' : 'healthy';

  return (
    <AppShell>
      <PageHeader
        title="Integration Hub"
        description="Enterprise API gateway, connectors, and orchestration platform"
        action={
          <div className="flex items-center gap-3">
            <Badge className={cn(
              'gap-1.5',
              overallHealth === 'healthy' && 'bg-green-500/10 text-green-600 border-green-500/20',
              overallHealth === 'warning' && 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
              overallHealth === 'critical' && 'bg-red-500/10 text-red-600 border-red-500/20',
            )}>
              {overallHealth === 'healthy' && <CheckCircle className="h-3 w-3" />}
              {overallHealth === 'warning' && <AlertTriangle className="h-3 w-3" />}
              {overallHealth === 'critical' && <AlertTriangle className="h-3 w-3" />}
              {overallHealth.charAt(0).toUpperCase() + overallHealth.slice(1)}
            </Badge>
            <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing} className="gap-2">
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Requests', value: apiUsage?.total_requests?.toLocaleString() || '0', icon: Globe, color: 'text-blue-500' },
          { label: 'Success Rate', value: `${apiUsage?.success_rate || 0}%`, icon: TrendingUp, color: 'text-green-500' },
          { label: 'Avg Latency', value: `${apiUsage?.avg_latency_ms || 0}ms`, icon: Clock, color: 'text-purple-500' },
          { label: 'Active Connectors', value: healthData.length.toString(), icon: Plug, color: 'text-cyan-500' },
          { label: 'Healthy', value: healthyCount.toString(), icon: CheckCircle, color: 'text-emerald-500' },
          { label: 'Alerts', value: alerts.length.toString(), icon: AlertTriangle, color: 'text-orange-500' },
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

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        {/* Hub Modules */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Hub Modules</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hubModules.map((module, i) => (
              <motion.div
                key={module.href}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.03 }}
              >
                <Link href={module.href}>
                  <Card className="h-full hover:shadow-md transition-all cursor-pointer group overflow-hidden">
                    <div className={cn('h-1 bg-gradient-to-r', module.color)} />
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br', module.color)}>
                          <module.icon className="h-5 w-5" />
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-sm">{module.label}</CardTitle>
                      <CardDescription className="text-xs mt-1">{module.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Active Alerts & Health */}
        <div className="space-y-6">
          {/* Active Alerts */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Active Alerts
            </h2>
            <Card>
              <CardContent className="p-4">
                {alerts.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">No active alerts</p>
                    <p className="text-xs text-muted-foreground">All systems operational</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.slice(0, 5).map((alert, i) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn(
                          'p-3 rounded-lg text-sm',
                          alert.severity === 'critical' && 'bg-red-500/10 border border-red-500/20',
                          alert.severity === 'warning' && 'bg-yellow-500/10 border border-yellow-500/20',
                          alert.severity === 'info' && 'bg-blue-500/10 border border-blue-500/20',
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{alert.alert_type}</span>
                          <Badge variant="outline" className="text-[10px]">{alert.severity}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{alert.message}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Connector Health */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-500" />
              Connector Health
            </h2>
            <Card>
              <CardContent className="p-4">
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-lg shimmer" />)}
                  </div>
                ) : healthData.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-6">No connectors configured</p>
                ) : (
                  <div className="space-y-3">
                    {healthData.slice(0, 6).map((health, i) => (
                      <motion.div
                        key={health.connector_name}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-2 h-2 rounded-full',
                            health.status === 'healthy' && 'bg-green-500',
                            health.status === 'warning' && 'bg-yellow-500',
                            health.status === 'critical' && 'bg-red-500',
                          )} />
                          <span className="text-sm font-medium">{health.connector_name}</span>
                        </div>
                        <div className="text-right">
                          {health.latency_ms && (
                            <span className="text-xs text-muted-foreground">{health.latency_ms}ms</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
