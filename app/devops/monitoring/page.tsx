'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Gauge,
  Cpu,
  HardDrive,
  Wifi,
  Database,
  Globe,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  BarChart3,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const systemMetrics = [
  { name: 'API Gateway', cpu: 45, memory: 62, requests: '12.5K/min', latency: '45ms', status: 'healthy' },
  { name: 'App Servers', cpu: 67, memory: 78, requests: '45K/min', latency: '89ms', status: 'healthy' },
  { name: 'Database Primary', cpu: 34, memory: 56, requests: '8.2K/min', latency: '12ms', status: 'healthy' },
  { name: 'Database Replica', cpu: 28, memory: 45, requests: '15K/min', latency: '8ms', status: 'healthy' },
  { name: 'Redis Cache', cpu: 12, memory: 82, requests: '125K/min', latency: '2ms', status: 'healthy' },
  { name: 'AI Cluster', cpu: 89, memory: 91, requests: '2.1K/min', latency: '890ms', status: 'degraded' },
];

const apmMetrics = [
  { endpoint: '/api/v1/customers', avgLatency: 45, p95Latency: 120, errorRate: 0.1, throughput: 2500 },
  { endpoint: '/api/v1/invoices', avgLatency: 89, p95Latency: 210, errorRate: 0.2, throughput: 1800 },
  { endpoint: '/api/v1/leads', avgLatency: 32, p95Latency: 95, errorRate: 0.05, throughput: 3200 },
  { endpoint: '/api/v2/ai/infer', avgLatency: 890, p95Latency: 2300, errorRate: 1.2, throughput: 450 },
  { endpoint: '/api/v1/webhooks', avgLatency: 156, p95Latency: 340, errorRate: 0.5, throughput: 890 },
];

export default function MonitoringPage() {
  const [refreshing, setRefreshing] = useState(false);

  function refresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }

  return (
    <AppShell>
      <PageHeader
        title="Monitoring"
        description="Real-time system health and performance dashboards"
        action={
          <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing} className="gap-2">
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            Refresh
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: 'System Health', value: '97%', icon: Gauge, color: 'text-green-500' },
          { label: 'CPU Usage', value: '52%', icon: Cpu, color: 'text-blue-500' },
          { label: 'Memory', value: '68%', icon: HardDrive, color: 'text-purple-500' },
          { label: 'Network', value: '125Mbps', icon: Wifi, color: 'text-cyan-500' },
          { label: 'DB Conns', value: '245', icon: Database, color: 'text-orange-500' },
          { label: 'Req/s', value: '4.2K', icon: Zap, color: 'text-amber-500' },
          { label: 'Latency P95', value: '145ms', icon: Clock, color: 'text-pink-500' },
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

      <Tabs defaultValue="systems" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="systems" className="rounded-lg gap-1.5">
            <Activity className="h-4 w-4" />
            Systems
          </TabsTrigger>
          <TabsTrigger value="apm" className="rounded-lg gap-1.5">
            <Globe className="h-4 w-4" />
            APM
          </TabsTrigger>
          <TabsTrigger value="resources" className="rounded-lg gap-1.5">
            <Cpu className="h-4 w-4" />
            Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="systems" className="mt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemMetrics.map((system, i) => (
              <motion.div
                key={system.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="overflow-hidden">
                  <div className={cn('h-1',
                    system.status === 'healthy' && 'bg-green-500',
                    system.status === 'degraded' && 'bg-yellow-500',
                    system.status === 'failed' && 'bg-red-500'
                  )} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{system.name}</CardTitle>
                      <Badge className={cn(
                        'text-[10px]',
                        system.status === 'healthy' && 'bg-green-500/10 text-green-600',
                        system.status === 'degraded' && 'bg-yellow-500/10 text-yellow-600',
                        system.status === 'failed' && 'bg-red-500/10 text-red-600'
                      )}>
                        {system.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">CPU</span>
                          <span className={cn(system.cpu > 80 && 'text-red-500')}>{system.cpu}%</span>
                        </div>
                        <Progress value={system.cpu} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Memory</span>
                          <span className={cn(system.memory > 85 && 'text-red-500')}>{system.memory}%</span>
                        </div>
                        <Progress value={system.memory} className="h-1.5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Requests</p>
                        <p className="text-sm font-medium">{system.requests}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Latency</p>
                        <p className="text-sm font-medium">{system.latency}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="apm" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Application Performance Monitoring</CardTitle>
              <CardDescription>API endpoint performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left text-xs font-medium text-muted-foreground">Endpoint</th>
                      <th className="p-4 text-right text-xs font-medium text-muted-foreground">Avg Latency</th>
                      <th className="p-4 text-right text-xs font-medium text-muted-foreground">P95</th>
                      <th className="p-4 text-right text-xs font-medium text-muted-foreground">Error Rate</th>
                      <th className="p-4 text-right text-xs font-medium text-muted-foreground">Throughput</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apmMetrics.map((metric) => (
                      <tr key={metric.endpoint} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-4">
                          <code className="text-sm">{metric.endpoint}</code>
                        </td>
                        <td className={cn(
                          'p-4 text-right',
                          metric.avgLatency > 500 && 'text-yellow-600'
                        )}>
                          {metric.avgLatency}ms
                        </td>
                        <td className={cn(
                          'p-4 text-right',
                          metric.p95Latency > 1000 && 'text-red-600'
                        )}>
                          {metric.p95Latency}ms
                        </td>
                        <td className={cn(
                          'p-4 text-right',
                          metric.errorRate > 1 ? 'text-red-600' : metric.errorRate > 0.5 ? 'text-yellow-600' : 'text-green-600'
                        )}>
                          {metric.errorRate}%
                        </td>
                        <td className="p-4 text-right">
                          {metric.throughput.toLocaleString()}/min
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="mt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">CPU Utilization</CardTitle>
                <CardDescription>Aggregated across all servers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="relative inline-flex">
                    <svg className="w-40 h-40 transform -rotate-90">
                      <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted" />
                      <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={440} strokeDashoffset={440 * (1 - 0.52)} className="text-blue-500" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-4xl font-bold">52%</span>
                      <span className="text-sm text-muted-foreground">Average</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-lg font-bold">8</p>
                    <p className="text-xs text-muted-foreground">Cores Total</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-lg font-bold">4.2</p>
                    <p className="text-xs text-muted-foreground">Cores Used</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-lg font-bold">1.2</p>
                    <p className="text-xs text-muted-foreground">Load Avg</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Memory Utilization</CardTitle>
                <CardDescription>RAM usage across servers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="relative inline-flex">
                    <svg className="w-40 h-40 transform -rotate-90">
                      <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted" />
                      <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={440} strokeDashoffset={440 * (1 - 0.68)} className="text-purple-500" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-4xl font-bold">68%</span>
                      <span className="text-sm text-muted-foreground">Average</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-lg font-bold">64GB</p>
                    <p className="text-xs text-muted-foreground">Total RAM</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-lg font-bold">43.5GB</p>
                    <p className="text-xs text-muted-foreground">Used</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-lg font-bold">20.5GB</p>
                    <p className="text-xs text-muted-foreground">Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
