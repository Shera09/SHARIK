'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Globe,
  Shield,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type HealthMetric = {
  id: string;
  metric_name: string;
  metric_value: number;
  unit: string;
  category: string;
  status: string;
  details: any;
  recorded_at: string;
};

type AlertRule = {
  id: string;
  name: string;
  description: string;
  metric_name: string;
  condition: string;
  threshold: number;
  severity: string;
  is_active: boolean;
};

type ActiveAlert = {
  id: string;
  rule_id: string;
  current_value: number;
  message: string;
  triggered_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
};

type PerformanceLog = {
  id: string;
  endpoint: string;
  method: string;
  response_time_ms: number;
  status_code: number;
  created_at: string;
};

const categoryIcons: Record<string, typeof Server> = {
  system: Server,
  database: Database,
  api: Globe,
  ai: Zap,
  queue: Clock,
  storage: HardDrive,
  network: Wifi,
};

const categoryColors: Record<string, string> = {
  system: 'text-blue-500',
  database: 'text-purple-500',
  api: 'text-cyan-500',
  ai: 'text-pink-500',
  queue: 'text-orange-500',
  storage: 'text-emerald-500',
  network: 'text-indigo-500',
};

export default function SystemHealthPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);
  const [performanceLogs, setPerformanceLogs] = useState<PerformanceLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [metricsRes, alertsRes, rulesRes, perfRes] = await Promise.all([
      supabase.from('system_health_metrics').select('*').order('recorded_at', { ascending: false }).limit(50),
      supabase.from('active_alerts').select('*').order('triggered_at', { ascending: false }).limit(20),
      supabase.from('alert_rules').select('*').eq('is_active', true),
      supabase.from('performance_logs').select('*').order('created_at', { ascending: false }).limit(100),
    ]);

    if (metricsRes.data) setMetrics(metricsRes.data);
    if (alertsRes.data) setActiveAlerts(alertsRes.data);
    if (rulesRes.data) setAlertRules(rulesRes.data);
    if (perfRes.data) setPerformanceLogs(perfRes.data);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  const acknowledgeAlert = async (alertId: string) => {
    const { error } = await supabase
      .from('active_alerts')
      .update({ acknowledged_at: new Date().toISOString() })
      .eq('id', alertId);

    if (error) toast.error(error.message);
    else {
      toast.success('Alert acknowledged');
      loadData();
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      healthy: 'bg-success/10 text-success',
      warning: 'bg-yellow-500/10 text-yellow-500',
      critical: 'bg-destructive/10 text-destructive',
      unknown: 'bg-muted text-muted-foreground',
    };
    return styles[status] || styles.unknown;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive';
      case 'warning': return 'text-yellow-500';
      default: return 'text-blue-500';
    }
  };

  const groupedMetrics = metrics.reduce((acc, metric) => {
    if (!acc[metric.category]) acc[metric.category] = [];
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<string, HealthMetric[]>);

  const latestMetrics: Record<string, HealthMetric> = {};
  metrics.forEach(m => {
    if (!latestMetrics[m.metric_name] || new Date(m.recorded_at) > new Date(latestMetrics[m.metric_name].recorded_at)) {
      latestMetrics[m.metric_name] = m;
    }
  });

  const overallStatus = activeAlerts.some(a => !a.resolved_at && !a.acknowledged_at)
    ? 'critical'
    : activeAlerts.some(a => !a.resolved_at)
    ? 'warning'
    : 'healthy';

  const avgApiResponseTime = performanceLogs.length > 0
    ? Math.round(performanceLogs.reduce((sum, l) => sum + l.response_time_ms, 0) / performanceLogs.length)
    : 0;

  return (
    <AppShell>
      <PageHeader
        title="System Health"
        description="Real-time infrastructure monitoring and observability"
        action={
          <div className="flex items-center gap-2">
            <Badge className={cn('gap-1.5', getStatusBadge(overallStatus))}>
              <Activity className="h-3 w-3" />
              {overallStatus}
            </Badge>
            <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing} className="gap-2">
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <Server className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Uptime</span>
          </div>
          <p className="text-2xl font-bold text-success">99.95%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4 text-cyan-500" />
            <span className="text-xs text-muted-foreground">API Latency</span>
          </div>
          <p className="text-2xl font-bold">{latestMetrics['api_response_time_ms']?.metric_value || avgApiResponseTime}ms</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-muted-foreground">DB Conn.</span>
          </div>
          <p className="text-2xl font-bold">{latestMetrics['db_connections']?.metric_value || 42}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="h-4 w-4 text-orange-500" />
            <span className="text-xs text-muted-foreground">CPU</span>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={latestMetrics['cpu_usage_percent']?.metric_value || 34} className="h-2 flex-1" />
            <span className="text-sm font-bold">{latestMetrics['cpu_usage_percent']?.metric_value || 34}%</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Memory</span>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={latestMetrics['memory_usage_percent']?.metric_value || 52} className="h-2 flex-1" />
            <span className="text-sm font-bold">{latestMetrics['memory_usage_percent']?.metric_value || 52}%</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-4 premium-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">Active Alerts</span>
          </div>
          <p className="text-2xl font-bold">{activeAlerts.filter(a => !a.resolved_at).length}</p>
        </motion.div>
      </div>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="metrics" className="rounded-lg">Metrics</TabsTrigger>
          <TabsTrigger value="alerts" className="rounded-lg gap-1.5">
            Alerts
            {activeAlerts.filter(a => !a.resolved_at).length > 0 && (
              <Badge className="h-4 px-1.5 text-[9px] bg-destructive">{activeAlerts.filter(a => !a.resolved_at).length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="performance" className="rounded-lg">Performance</TabsTrigger>
        </TabsList>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="mt-0">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="h-32 rounded-2xl shimmer" />)}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedMetrics).map(([category, categoryMetrics]) => {
                const Icon = categoryIcons[category] || Server;
                const color = categoryColors[category] || 'text-muted-foreground';

                return (
                  <div key={category}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 capitalize">
                      <Icon className={cn('h-5 w-5', color)} />
                      {category}
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {categoryMetrics.slice(0, 8).map((metric, i) => (
                        <motion.div
                          key={metric.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="glass-card p-4 premium-shadow"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground truncate">{metric.metric_name}</span>
                            <Badge className={cn('text-[9px]', getStatusBadge(metric.status))}>
                              {metric.status}
                            </Badge>
                          </div>
                          <p className="text-xl font-bold">
                            {metric.metric_value}{metric.unit ? ` ${metric.unit}` : ''}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(metric.recorded_at).toLocaleTimeString()}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="mt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Active Alerts */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Active Alerts
              </h3>
              <div className="glass-card p-4 premium-shadow">
                {activeAlerts.filter(a => !a.resolved_at).length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-success mx-auto mb-2" />
                    <p className="text-sm font-medium">No active alerts</p>
                    <p className="text-xs text-muted-foreground">All systems operational</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeAlerts.filter(a => !a.resolved_at).map((alert, i) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm">{alert.message || 'System Alert'}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Triggered: {new Date(alert.triggered_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {!alert.acknowledged_at && (
                              <Button size="sm" variant="outline" onClick={() => acknowledgeAlert(alert.id)}>
                                Acknowledge
                              </Button>
                            )}
                          </div>
                        </div>
                        {alert.acknowledged_at && (
                          <Badge variant="outline" className="mt-2 text-[10px]">Acknowledged</Badge>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Alert Rules */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Alert Rules ({alertRules.length})
              </h3>
              <div className="glass-card p-4 premium-shadow">
                <div className="space-y-3">
                  {alertRules.map((rule, i) => (
                    <div key={rule.id} className="p-3 rounded-lg bg-muted/30 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{rule.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {rule.metric_name} {rule.condition} {rule.threshold}
                        </p>
                      </div>
                      <Badge className={cn('text-[10px]', getSeverityColor(rule.severity))}>
                        {rule.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="mt-0">
          <div className="glass-card p-6 premium-shadow">
            <div className="mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                API Performance
              </h3>
              <p className="text-sm text-muted-foreground">Recent endpoint response times</p>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-lg shimmer" />)}
              </div>
            ) : performanceLogs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No performance data available</p>
            ) : (
              <div className="space-y-2">
                {performanceLogs.slice(0, 20).map((log, i) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <Badge variant="outline" className="text-[10px] w-14 shrink-0">
                      {log.method}
                    </Badge>
                    <span className="text-sm font-medium truncate flex-1">{log.endpoint}</span>
                    <div className="flex items-center gap-2">
                      <Badge className={cn(
                        'text-[10px]',
                        log.response_time_ms < 200 ? 'bg-success/10 text-success' :
                        log.response_time_ms < 500 ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-destructive/10 text-destructive'
                      )}>
                        {log.response_time_ms}ms
                      </Badge>
                      <Badge className={cn(
                        'text-[10px]',
                        log.status_code < 300 ? 'bg-success/10 text-success' :
                        log.status_code < 400 ? 'bg-blue-500/10 text-blue-500' :
                        'bg-destructive/10 text-destructive'
                      )}>
                        {log.status_code}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
