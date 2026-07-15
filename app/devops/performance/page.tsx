'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Gauge,
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Database,
  Server,
  Globe,
  Cpu,
  HardDrive,
  Wifi,
  RefreshCw,
  Play,
  Settings,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const systemBenchmarks = [
  { name: 'API Gateway', current: 45, baseline: 52, target: 40, unit: 'ms', trend: 'up' },
  { name: 'Database Queries', current: 12, baseline: 18, target: 10, unit: 'ms', trend: 'up' },
  { name: 'Cache Hit Rate', current: 94, baseline: 89, target: 95, unit: '%', trend: 'up' },
  { name: 'Memory Efficiency', current: 78, baseline: 72, target: 80, unit: '%', trend: 'up' },
  { name: 'CPU Utilization', current: 52, baseline: 68, target: 50, unit: '%', trend: 'up' },
  { name: 'Network Latency', current: 8, baseline: 12, target: 5, unit: 'ms', trend: 'up' },
];

const loadTests = [
  { id: '1', name: 'API Stress Test - Peak Load', status: 'completed', duration: '2h 15m', requests: 1250000, errors: 0.02, avgLatency: 45 },
  { id: '2', name: 'Database Connection Pool Test', status: 'completed', duration: '45m', requests: 890000, errors: 0, avgLatency: 12 },
  { id: '3', name: 'Concurrent Users Simulation', status: 'running', duration: '1h 23m', requests: 450000, errors: 0.01, avgLatency: 89 },
  { id: '4', name: 'AI Inference Benchmark', status: 'completed', duration: '1h', requests: 12500, errors: 0.05, avgLatency: 890 },
  { id: '5', name: 'WebSocket Connection Test', status: 'scheduled', duration: '-', requests: 0, errors: 0, avgLatency: 0 },
];

const optimizations = [
  { name: 'Query Optimization', impact: 'high', effort: 'medium', status: 'identified', savings: '+35% throughput' },
  { name: 'Connection Pooling', impact: 'high', effort: 'low', status: 'implemented', savings: '-40% latency' },
  { name: 'CDN Edge Caching', impact: 'medium', effort: 'low', status: 'implemented', savings: '-60% origin requests' },
  { name: 'Image Optimization', impact: 'medium', effort: 'low', status: 'in_progress', savings: '-50% bandwidth' },
  { name: 'Code Splitting', impact: 'medium', effort: 'medium', status: 'identified', savings: '-30% initial load' },
  { name: 'Database Indexing', impact: 'high', effort: 'medium', status: 'identified', savings: '-45% query time' },
];

const resourceUsage = [
  { resource: 'API Servers', cpu: 45, memory: 62, disk: 34, network: 56 },
  { resource: 'Database Cluster', cpu: 34, memory: 78, disk: 67, network: 45 },
  { resource: 'Cache Layer', cpu: 12, memory: 85, disk: 23, network: 89 },
  { resource: 'AI Cluster', cpu: 89, memory: 91, disk: 45, network: 34 },
];

export default function PerformancePage() {
  const [timeRange, setTimeRange] = useState('1h');
  const [runningTest, setRunningTest] = useState(false);

  function runLoadTest() {
    setRunningTest(true);
    setTimeout(() => setRunningTest(false), 3000);
  }

  const stats = {
    avgLatency: 45,
    p95Latency: 120,
    throughput: 4200,
    errorRate: 0.12,
    cacheHitRate: 94.2,
    activeConnections: 2450,
  };

  const performanceScore = 87;

  return (
    <AppShell>
      <PageHeader
        title="Performance Engineering"
        description="System optimization, load testing, and performance benchmarks"
        action={
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15m">Last 15 min</SelectItem>
                <SelectItem value="1h">Last hour</SelectItem>
                <SelectItem value="6h">Last 6 hours</SelectItem>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={runLoadTest} disabled={runningTest} className="gap-2 rounded-xl">
              {runningTest ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Run Load Test
            </Button>
          </div>
        }
      />

      {/* Performance Score */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-1"
        >
          <Card className="h-full">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="relative inline-flex mb-4">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-muted" />
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={352} strokeDashoffset={352 * (1 - performanceScore / 100)} className="text-green-500" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-4xl font-bold">{performanceScore}</span>
                  <span className="text-sm text-muted-foreground">Score</span>
                </div>
              </div>
              <h3 className="font-semibold mb-1">Overall Performance</h3>
              <p className="text-sm text-muted-foreground">Good - Within targets</p>
              <div className="flex items-center gap-1 mt-2 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+3% vs last week</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Avg Latency', value: `${stats.avgLatency}ms`, icon: Clock, color: 'text-green-500', trend: '+5%' },
            { label: 'P95 Latency', value: `${stats.p95Latency}ms`, icon: TrendingUp, color: 'text-yellow-500', trend: '-2%' },
            { label: 'Throughput', value: `${stats.throughput}/s`, icon: Zap, color: 'text-blue-500', trend: '+12%' },
            { label: 'Error Rate', value: `${stats.errorRate}%`, icon: AlertTriangle, color: 'text-green-500', trend: '-0.05%' },
            { label: 'Cache Hit', value: `${stats.cacheHitRate}%`, icon: Database, color: 'text-purple-500', trend: '+2.1%' },
            { label: 'Active Conns', value: stats.activeConnections.toLocaleString(), icon: Wifi, color: 'text-cyan-500', trend: '+145' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card p-4"
            >
              <div className="flex items-center justify-between mb-1">
                <stat.icon className={cn('h-4 w-4', stat.color)} />
                <span className={cn('text-xs', stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600')}>
                  {stat.trend}
                </span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <Tabs defaultValue="benchmarks" className="mt-6">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="benchmarks" className="rounded-lg gap-1.5">
            <Target className="h-4 w-4" />
            Benchmarks
          </TabsTrigger>
          <TabsTrigger value="load-testing" className="rounded-lg gap-1.5">
            <Activity className="h-4 w-4" />
            Load Testing
          </TabsTrigger>
          <TabsTrigger value="optimization" className="rounded-lg gap-1.5">
            <Zap className="h-4 w-4" />
            Optimization
          </TabsTrigger>
          <TabsTrigger value="resources" className="rounded-lg gap-1.5">
            <Server className="h-4 w-4" />
            Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="benchmarks" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">System Benchmarks</CardTitle>
              <CardDescription>Compare current performance against baselines and targets</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {systemBenchmarks.map((benchmark, i) => (
                  <motion.div
                    key={benchmark.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Gauge className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{benchmark.name}</p>
                          <p className="text-xs text-muted-foreground">Target: {benchmark.target}{benchmark.unit}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold">{benchmark.current}{benchmark.unit}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>Baseline: {benchmark.baseline}{benchmark.unit}</span>
                            {benchmark.current <= benchmark.baseline ? (
                              <ArrowDownRight className="h-3 w-3 text-green-500" />
                            ) : (
                              <ArrowUpRight className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', benchmark.current <= benchmark.target ? 'bg-green-500' : 'bg-yellow-500')}
                          style={{ width: `${Math.min(100, (benchmark.current / benchmark.target) * 100)}%` }}
                        />
                      </div>
                      <Badge variant="outline" className={cn(
                        'text-[10px]',
                        benchmark.current <= benchmark.target ? 'text-green-600' : 'text-yellow-600'
                      )}>
                        {benchmark.current <= benchmark.target ? 'On Target' : 'Needs Attention'}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="load-testing" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Load Test Results</CardTitle>
              <CardDescription>Performance under simulated traffic conditions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left text-xs font-medium text-muted-foreground">Test Name</th>
                      <th className="p-4 text-left text-xs font-medium text-muted-foreground">Status</th>
                      <th className="p-4 text-right text-xs font-medium text-muted-foreground">Duration</th>
                      <th className="p-4 text-right text-xs font-medium text-muted-foreground">Requests</th>
                      <th className="p-4 text-right text-xs font-medium text-muted-foreground">Errors</th>
                      <th className="p-4 text-right text-xs font-medium text-muted-foreground">Avg Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadTests.map((test) => (
                      <tr key={test.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-4">
                          <p className="text-sm font-medium">{test.name}</p>
                        </td>
                        <td className="p-4">
                          <Badge className={cn(
                            'text-[10px]',
                            test.status === 'completed' && 'bg-green-500/10 text-green-600',
                            test.status === 'running' && 'bg-blue-500/10 text-blue-600',
                            test.status === 'scheduled' && 'bg-gray-500/10 text-gray-600'
                          )}>
                            {test.status === 'running' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                            {test.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right text-sm">{test.duration}</td>
                        <td className="p-4 text-right text-sm">{test.requests.toLocaleString()}</td>
                        <td className={cn(
                          'p-4 text-right text-sm',
                          test.errors > 0.01 && 'text-red-600'
                        )}>
                          {test.errors}%
                        </td>
                        <td className={cn(
                          'p-4 text-right text-sm',
                          test.avgLatency > 500 && 'text-yellow-600'
                        )}>
                          {test.avgLatency}ms
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Optimization Opportunities</CardTitle>
              <CardDescription>Identified improvements and their expected impact</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {optimizations.map((opt, i) => (
                  <motion.div
                    key={opt.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        opt.status === 'implemented' && 'bg-green-500/10',
                        opt.status === 'in_progress' && 'bg-blue-500/10',
                        opt.status === 'identified' && 'bg-muted'
                      )}>
                        {opt.status === 'implemented' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : opt.status === 'in_progress' ? (
                          <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                        ) : (
                          <Target className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{opt.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Badge variant="outline" className="text-[10px]">Impact: {opt.impact}</Badge>
                          <Badge variant="outline" className="text-[10px]">Effort: {opt.effort}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">{opt.savings}</p>
                      <Badge className={cn(
                        'text-[10px]',
                        opt.status === 'implemented' && 'bg-green-500/10 text-green-600',
                        opt.status === 'in_progress' && 'bg-blue-500/10 text-blue-600',
                        opt.status === 'identified' && 'bg-gray-500/10 text-gray-600'
                      )}>
                        {opt.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="mt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            {resourceUsage.map((resource, i) => (
              <motion.div
                key={resource.resource}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{resource.resource}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">CPU</span>
                          <span className={cn(resource.cpu > 80 && 'text-red-600')}>{resource.cpu}%</span>
                        </div>
                        <Progress value={resource.cpu} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Memory</span>
                          <span className={cn(resource.memory > 85 && 'text-red-600')}>{resource.memory}%</span>
                        </div>
                        <Progress value={resource.memory} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Disk I/O</span>
                          <span>{resource.disk}%</span>
                        </div>
                        <Progress value={resource.disk} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Network</span>
                          <span>{resource.network}%</span>
                        </div>
                        <Progress value={resource.network} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
