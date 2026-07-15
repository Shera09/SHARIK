'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Server,
  Globe,
  Database,
  Zap,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Shield,
  Bell,
  Settings,
  Filter,
  Eye,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface IntegrationHealthMetric {
  connector_name: string;
  status: string;
  last_sync: string | null;
  error_count_24h: number;
  latency_ms: number | null;
  uptime_percent: number;
}

interface IntegrationAlert {
  id: string;
  alert_type: string;
  severity: string;
  message: string;
  triggered_at: string;
  resolved_at: string | null;
}

interface MetricSummary {
  total_requests: number;
  success_rate: number;
  avg_latency_ms: number;
  active_connectors: number;
  error_count: number;
}

// Mock data for demo
const mockHealthMetrics: IntegrationHealthMetric[] = [
  { connector_name: 'WhatsApp Business', status: 'healthy', last_sync: new Date().toISOString(), error_count_24h: 0, latency_ms: 234, uptime_percent: 99.95 },
  { connector_name: 'Razorpay Payments', status: 'healthy', last_sync: new Date().toISOString(), error_count_24h: 2, latency_ms: 189, uptime_percent: 99.87 },
  { connector_name: 'Google Workspace', status: 'healthy', last_sync: new Date().toISOString(), error_count_24h: 0, latency_ms: 312, uptime_percent: 99.99 },
  { connector_name: 'Slack Integration', status: 'degraded', last_sync: new Date(Date.now() - 1800000).toISOString(), error_count_24h: 12, latency_ms: 1245, uptime_percent: 98.45 },
  { connector_name: 'Gmail Connector', status: 'critical', last_sync: new Date(Date.now() - 3600000).toISOString(), error_count_24h: 45, latency_ms: null, uptime_percent: 94.32 },
  { connector_name: 'AI Provider (OpenAI)', status: 'healthy', last_sync: new Date().toISOString(), error_count_24h: 3, latency_ms: 890, uptime_percent: 99.73 },
];

const mockAlerts: IntegrationAlert[] = [
  { id: '1', alert_type: 'high_latency', severity: 'warning', message: 'Slack Integration latency exceeded 1000ms threshold', triggered_at: new Date(Date.now() - 3600000).toISOString(), resolved_at: null },
  { id: '2', alert_type: 'sync_failure', severity: 'critical', message: 'Gmail Connector sync failed 3 consecutive times', triggered_at: new Date(Date.now() - 7200000).toISOString(), resolved_at: null },
  { id: '3', alert_type: 'rate_limit', severity: 'warning', message: 'API rate limit at 85% capacity', triggered_at: new Date(Date.now() - 86400000).toISOString(), resolved_at: new Date(Date.now() - 82800000).toISOString() },
];

const statusColors: Record<string, string> = {
  healthy: 'bg-green-500/10 text-green-600',
  degraded: 'bg-yellow-500/10 text-yellow-600',
  critical: 'bg-red-500/10 text-red-600',
};

const severityColors: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-600 border-red-500/20',
  warning: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  info: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
};

export default function IntegrationMonitoringPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [healthMetrics, setHealthMetrics] = useState<IntegrationHealthMetric[]>(mockHealthMetrics);
  const [alerts, setAlerts] = useState<IntegrationAlert[]>(mockAlerts);
  const [summary, setSummary] = useState<MetricSummary>({
    total_requests: 156789,
    success_rate: 99.7,
    avg_latency_ms: 245,
    active_connectors: 5,
    error_count: 62,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [healthRes, alertsRes, summaryRes] = await Promise.all([
        supabase.from('integration_health').select('*'),
        supabase.from('integration_alerts').select('*').order('triggered_at', { ascending: false }).limit(20),
        supabase.from('api_usage_daily').select('total_requests, success_rate, avg_latency_ms').order('date', { ascending: false }).limit(1),
      ]);

      if (healthRes.data && healthRes.data.length > 0) {
        setHealthMetrics(healthRes.data.map(h => ({
          connector_name: h.connector_name,
          status: h.status,
          last_sync: h.last_sync,
          error_count_24h: h.error_count_24h || 0,
          latency_ms: h.latency_ms,
          uptime_percent: 99 + Math.random() * 0.99,
        })));
      }
      if (alertsRes.data && alertsRes.data.length > 0) setAlerts(alertsRes.data);
      if (summaryRes.data && summaryRes.data[0]) {
        setSummary(prev => ({
          ...prev,
          total_requests: summaryRes.data?.[0]?.total_requests || prev.total_requests,
        }));
      }
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Data refreshed');
  }

  const healthyCount = healthMetrics.filter(m => m.status === 'healthy').length;
  const degradedCount = healthMetrics.filter(m => m.status === 'degraded').length;
  const criticalCount = healthMetrics.filter(m => m.status === 'critical').length;
  const activeAlerts = alerts.filter(a => !a.resolved_at);

  const overallHealth = criticalCount > 0 ? 'critical' : degradedCount > 0 ? 'degraded' : 'healthy';

  return (
    <AppShell>
      <PageHeader
        title="Integration Monitoring"
        description="Real-time health dashboards and alert management"
        action={
          <div className="flex items-center gap-3">
            <Badge className={cn(
              'gap-1.5',
              overallHealth === 'healthy' && 'bg-green-500/10 text-green-600 border-green-500/20',
              overallHealth === 'degraded' && 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
              overallHealth === 'critical' && 'bg-red-500/10 text-red-600 border-red-500/20',
            )}>
              {overallHealth === 'healthy' && <CheckCircle className="h-3 w-3" />}
              {overallHealth === 'degraded' && <AlertTriangle className="h-3 w-3" />}
              {overallHealth === 'critical' && <XCircle className="h-3 w-3" />}
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Requests', value: summary.total_requests.toLocaleString(), icon: Globe, color: 'text-blue-500' },
          { label: 'Success Rate', value: `${summary.success_rate}%`, icon: TrendingUp, color: 'text-green-500' },
          { label: 'Avg Latency', value: `${summary.avg_latency_ms}ms`, icon: Clock, color: 'text-purple-500' },
          { label: 'Healthy', value: healthyCount.toString(), icon: CheckCircle, color: 'text-emerald-500' },
          { label: 'Errors (24h)', value: summary.error_count.toString(), icon: XCircle, color: 'text-red-500' },
          { label: 'Active Alerts', value: activeAlerts.length.toString(), icon: AlertTriangle, color: 'text-orange-500' },
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

      <Tabs defaultValue="health" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="health" className="rounded-lg gap-1.5">
            <Activity className="h-4 w-4" />
            Health Dashboard
          </TabsTrigger>
          <TabsTrigger value="alerts" className="rounded-lg gap-1.5">
            <Bell className="h-4 w-4" />
            Alerts
            {activeAlerts.length > 0 && (
              <Badge className="h-4 px-1.5 text-[9px] bg-red-500">{activeAlerts.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="metrics" className="rounded-lg gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Metrics
          </TabsTrigger>
        </TabsList>

        {/* Health Dashboard */}
        <TabsContent value="health" className="mt-0">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Connector Health Cards */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Connector Health</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {healthMetrics.map((metric, i) => (
                  <motion.div
                    key={metric.connector_name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="overflow-hidden">
                      <div className={cn('h-1',
                        metric.status === 'healthy' && 'bg-green-500',
                        metric.status === 'degraded' && 'bg-yellow-500',
                        metric.status === 'critical' && 'bg-red-500',
                      )} />
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <div className={cn(
                              'w-2 h-2 rounded-full',
                              metric.status === 'healthy' && 'bg-green-500',
                              metric.status === 'degraded' && 'bg-yellow-500',
                              metric.status === 'critical' && 'bg-red-500',
                            )} />
                            {metric.connector_name}
                          </CardTitle>
                          <Badge className={cn('text-[10px]', statusColors[metric.status])}>
                            {metric.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div>
                            <p className="text-lg font-bold">{metric.latency_ms ? `${metric.latency_ms}ms` : '-'}</p>
                            <p className="text-[10px] text-muted-foreground">Latency</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold">{metric.error_count_24h}</p>
                            <p className="text-[10px] text-muted-foreground">Errors (24h)</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold">{metric.uptime_percent.toFixed(2)}%</p>
                            <p className="text-[10px] text-muted-foreground">Uptime</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div>
              <h3 className="text-lg font-semibold mb-4">System Status</h3>
              <Card>
                <CardContent className="p-4 space-y-4">
                  {[
                    { name: 'API Gateway', status: 'operational', latency: '45ms' },
                    { name: 'Event Bus', status: 'operational', latency: '12ms' },
                    { name: 'Database', status: 'operational', latency: '8ms' },
                    { name: 'Cache Layer', status: 'operational', latency: '2ms' },
                    { name: 'Message Queue', status: 'degraded', latency: '234ms' },
                  ].map((system) => (
                    <div key={system.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'w-2 h-2 rounded-full',
                          system.status === 'operational' ? 'bg-green-500' : 'bg-yellow-500'
                        )} />
                        <span className="text-sm font-medium">{system.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{system.latency}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="mt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Active Alerts ({activeAlerts.length})
              </h3>
              <Card>
                <CardContent className="p-4">
                  {activeAlerts.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">No active alerts</p>
                      <p className="text-xs text-muted-foreground">All systems operational</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeAlerts.map((alert, i) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={cn(
                            'p-4 rounded-xl border',
                            alert.severity === 'critical' && 'bg-red-500/10 border-red-500/20',
                            alert.severity === 'warning' && 'bg-yellow-500/10 border-yellow-500/20',
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={cn('text-[10px]', severityColors[alert.severity])}>
                                  {alert.severity}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{alert.alert_type}</span>
                              </div>
                              <p className="text-sm">{alert.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(alert.triggered_at).toLocaleString()}
                              </p>
                            </div>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Resolved Alerts
              </h3>
              <Card>
                <CardContent className="p-4">
                  {alerts.filter(a => a.resolved_at).length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">No resolved alerts</p>
                  ) : (
                    <div className="space-y-3">
                      {alerts.filter(a => a.resolved_at).map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div>
                            <p className="text-sm font-medium">{alert.message}</p>
                            <p className="text-xs text-muted-foreground">
                              Resolved: {new Date(alert.resolved_at!).toLocaleString()}
                            </p>
                          </div>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="mt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Request Volume</CardTitle>
                <CardDescription>API requests over the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { hour: '00:00', requests: 4500 },
                    { hour: '04:00', requests: 2300 },
                    { hour: '08:00', requests: 8900 },
                    { hour: '12:00', requests: 12500 },
                    { hour: '16:00', requests: 11200 },
                    { hour: '20:00', requests: 7800 },
                  ].map((d) => (
                    <div key={d.hour}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{d.hour}</span>
                        <span className="font-medium">{d.requests.toLocaleString()}</span>
                      </div>
                      <Progress value={(d.requests / 12500) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Latency Distribution</CardTitle>
                <CardDescription>Response time percentiles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'P50', value: '156ms' },
                    { label: 'P90', value: '342ms' },
                    { label: 'P95', value: '567ms' },
                    { label: 'P99', value: '892ms' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-4 rounded-xl bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-xl font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {[
                    { range: '0-100ms', percent: 45, color: 'bg-green-500' },
                    { range: '100-300ms', percent: 32, color: 'bg-blue-500' },
                    { range: '300-500ms', percent: 15, color: 'bg-yellow-500' },
                    { range: '500ms+', percent: 8, color: 'bg-red-500' },
                  ].map((bucket) => (
                    <div key={bucket.range} className="flex items-center gap-4">
                      <span className="text-sm w-20">{bucket.range}</span>
                      <Progress value={bucket.percent} className="h-2 flex-1" />
                      <span className="text-sm text-muted-foreground">{bucket.percent}%</span>
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
