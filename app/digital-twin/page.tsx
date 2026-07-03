'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Users,
  Package,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Eye,
  Brain,
  Cpu,
  Database,
  Globe,
  Shield,
  Heart,
  LucideIcon,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type TwinMetric = {
  id: string;
  metric_type: string;
  metric_name: string;
  current_value: number;
  previous_value: number;
  target_value: number;
  unit: string;
  trend_direction: string;
  trend_percentage: number;
  health_score: number;
  last_updated: string;
  metadata: Record<string, any>;
};

type TwinSnapshot = {
  id: string;
  snapshot_date: string;
  overall_health_score: number;
  financial_health: number;
  operational_health: number;
  customer_health: number;
  employee_health: number;
  system_health: number;
  insights: string[];
  alerts: string[];
};

const metricTypeConfig: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  financial: { icon: DollarSign, color: 'emerald', label: 'Financial Health' },
  operational: { icon: Settings, color: 'blue', label: 'Operations' },
  customer: { icon: Users, color: 'purple', label: 'Customer Relations' },
  employee: { icon: Heart, color: 'orange', label: 'Employee Wellbeing' },
  system: { icon: Cpu, color: 'cyan', label: 'System Performance' },
  market: { icon: Globe, color: 'pink', label: 'Market Position' },
};

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/20' },
  pink: { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/20' },
  red: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
  yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20' },
};

export default function DigitalTwinPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<TwinMetric[]>([]);
  const [snapshot, setSnapshot] = useState<TwinSnapshot | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  const loadData = useCallback(async () => {
    setLoading(true);

    const [metricsRes, snapshotRes] = await Promise.all([
      supabase.from('digital_twin_metrics').select('*').order('last_updated', { ascending: false }),
      supabase.from('digital_twin_snapshot').select('*').order('snapshot_date', { ascending: false }).limit(1).single(),
    ]);

    if (metricsRes.data) setMetrics(metricsRes.data);
    if (snapshotRes.data) setSnapshot(snapshotRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredMetrics = selectedCategory === 'all'
    ? metrics
    : metrics.filter(m => m.metric_type === selectedCategory);

  const metricsByType = metrics.reduce((acc, m) => {
    if (!acc[m.metric_type]) acc[m.metric_type] = [];
    acc[m.metric_type].push(m);
    return acc;
  }, {} as Record<string, TwinMetric[]>);

  const overallHealth = snapshot?.overall_health_score ||
    Math.round(metrics.reduce((sum, m) => sum + (m.health_score || 0), 0) / Math.max(metrics.length, 1));

  const getHealthStatus = (score: number) => {
    if (score >= 85) return { label: 'Excellent', class: 'text-success', badge: 'bg-success/10 text-success' };
    if (score >= 70) return { label: 'Good', class: 'text-emerald-500', badge: 'bg-emerald-500/10 text-emerald-500' };
    if (score >= 50) return { label: 'Fair', class: 'text-yellow-500', badge: 'bg-yellow-500/10 text-yellow-500' };
    if (score >= 30) return { label: 'Needs Attention', class: 'text-orange-500', badge: 'bg-orange-500/10 text-orange-500' };
    return { label: 'Critical', class: 'text-red-500', badge: 'bg-red-500/10 text-red-500' };
  };

  return (
    <AppShell>
      <PageHeader
        title="Business Digital Twin"
        description="Real-time mirror of your entire business ecosystem"
      />

      {loading ? (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl shimmer" />
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="h-96 rounded-2xl shimmer" />
            <div className="lg:col-span-2 h-96 rounded-2xl shimmer" />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Twin Status Overview */}
          <div className="glass-card p-6 premium-shadow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-12 w-12 text-primary" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold">Business Digital Twin</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    Live synchronization active
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last synced: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={loadData} className="gap-2 rounded-xl">
                <RefreshCw className="h-4 w-4" />
                Sync
              </Button>
            </div>

            {/* Health Score Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Overall', score: overallHealth, icon: Building2, color: 'emerald' },
                { label: 'Financial', score: snapshot?.financial_health || 0, icon: DollarSign, color: 'blue' },
                { label: 'Operations', score: snapshot?.operational_health || 0, icon: Settings, color: 'purple' },
                { label: 'Customers', score: snapshot?.customer_health || 0, icon: Users, color: 'orange' },
                { label: 'Employees', score: snapshot?.employee_health || 0, icon: Heart, color: 'cyan' },
                { label: 'Systems', score: snapshot?.system_health || 0, icon: Cpu, color: 'pink' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className={cn('h-4 w-4', colorClasses[item.color]?.text || 'text-muted-foreground')} />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={cn('text-2xl font-bold', getHealthStatus(item.score).class)}>
                      {item.score}
                    </span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                  <Progress value={item.score} className="h-1 mt-2" />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {getHealthStatus(item.score).label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Main Content with Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="glass-card p-1 h-auto mb-4">
              <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
              <TabsTrigger value="financial" className="rounded-lg">Financial</TabsTrigger>
              <TabsTrigger value="operational" className="rounded-lg">Operational</TabsTrigger>
              <TabsTrigger value="customer" className="rounded-lg">Customer</TabsTrigger>
              <TabsTrigger value="employee" className="rounded-lg">Employee</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Live Metrics Grid */}
                <div className="lg:col-span-2">
                  <div className="glass-card p-6 premium-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        Live Business Metrics
                      </h3>
                      <div className="flex items-center gap-2">
                        {['day', 'week', 'month'].map((range) => (
                          <button
                            key={range}
                            onClick={() => setTimeRange(range as any)}
                            className={cn(
                              'px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors',
                              timeRange === range
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                            )}
                          >
                            {range}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredMetrics.slice(0, 12).map((metric, i) => {
                        const config = metricTypeConfig[metric.metric_type] || { icon: BarChart3, color: 'gray', label: 'Other' };
                        const colors = colorClasses[config.color] || colorClasses.blue;

                        return (
                          <motion.div
                            key={metric.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.02 }}
                            className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colors.bg)}>
                                <config.icon className={cn('h-4 w-4', colors.text)} />
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                {metric.trend_direction === 'up' ? (
                                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                                ) : metric.trend_direction === 'down' ? (
                                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                                ) : (
                                  <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                                <span className={cn(
                                  'font-medium',
                                  metric.trend_percentage > 0 ? 'text-success' :
                                  metric.trend_percentage < 0 ? 'text-red-500' : 'text-muted-foreground'
                                )}>
                                  {metric.trend_percentage > 0 ? '+' : ''}{metric.trend_percentage}%
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">{metric.metric_name}</p>
                            <p className="text-xl font-bold mt-1">
                              {metric.unit === 'currency' ? `${(metric.current_value / 1000).toFixed(0)}K` :
                               metric.unit === 'percentage' ? `${metric.current_value.toFixed(1)}%` :
                               metric.current_value.toLocaleString()}
                            </p>
                            <div className="mt-2">
                              <Progress value={metric.health_score} className="h-1" />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  {/* AI Insights */}
                  <div className="glass-card p-6 premium-shadow">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      AI Insights
                    </h3>
                    <div className="space-y-3">
                      {(snapshot?.insights as string[] || [
                        'Revenue trending 12% above target',
                        'Customer satisfaction at all-time high',
                        '3 employees need training attention',
                        'System performance optimal',
                        'New market opportunity identified',
                      ]).slice(0, 5).map((insight, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/20 transition-colors">
                          <Zap className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                          <p className="text-xs text-muted-foreground">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System Connections */}
                  <div className="glass-card p-6 premium-shadow">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Database className="h-4 w-4 text-cyan-500" />
                      Connected Systems
                    </h3>
                    <div className="space-y-2">
                      {[
                        { name: 'CRM Database', status: 'connected', sync: '2m ago' },
                        { name: 'Invoice System', status: 'connected', sync: '30s ago' },
                        { name: 'Payment Gateway', status: 'connected', sync: '1m ago' },
                        { name: 'Email Server', status: 'connected', sync: '5m ago' },
                        { name: 'Analytics Engine', status: 'connected', sync: 'real-time' },
                      ].map((sys) => (
                        <div key={sys.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-success" />
                            <span className="text-sm">{sys.name}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{sys.sync}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Category-specific tabs */}
            {['financial', 'operational', 'customer', 'employee'].map((category) => (
              <TabsContent key={category} value={category} className="mt-0">
                <div className="glass-card p-6 premium-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold capitalize flex items-center gap-2">
                      {category === 'financial' && <DollarSign className="h-5 w-5 text-emerald-500" />}
                      {category === 'operational' && <Settings className="h-5 w-5 text-blue-500" />}
                      {category === 'customer' && <Users className="h-5 w-5 text-purple-500" />}
                      {category === 'employee' && <Heart className="h-5 w-5 text-orange-500" />}
                      {category} Metrics
                    </h3>
                    <Badge variant="outline">
                      {(metricsByType[category] || []).length} metrics tracked
                    </Badge>
                  </div>

                  {(metricsByType[category] || []).length === 0 ? (
                    <div className="py-12 text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No {category} metrics available</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(metricsByType[category] || []).map((metric, i) => {
                        const config = metricTypeConfig[category] || metricTypeConfig.financial;
                        const colors = colorClasses[config.color] || colorClasses.blue;

                        return (
                          <motion.div
                            key={metric.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="p-4 rounded-xl bg-muted/30 border border-border/30"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium line-clamp-1">{metric.metric_name}</span>
                              <Badge className={cn(
                                'text-[9px]',
                                metric.health_score >= 80 ? 'bg-success/10 text-success' :
                                metric.health_score >= 60 ? 'bg-yellow-500/10 text-yellow-500' :
                                'bg-red-500/10 text-red-500'
                              )}>
                                {metric.health_score}%
                              </Badge>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <p className="text-2xl font-bold">
                                {metric.unit === 'currency' ? `${(metric.current_value / 1000).toFixed(0)}K` :
                                 metric.unit === 'percentage' ? `${metric.current_value.toFixed(1)}%` :
                                 metric.current_value.toLocaleString()}
                              </p>
                              {metric.target_value > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  / {metric.unit === 'currency' ? `${(metric.target_value / 1000).toFixed(0)}K` :
                                     metric.unit === 'percentage' ? `${metric.target_value}%` :
                                     metric.target_value.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                                <span>Progress to target</span>
                                <span>{metric.target_value > 0 ? Math.round((metric.current_value / metric.target_value) * 100) : 100}%</span>
                              </div>
                              <Progress
                                value={metric.target_value > 0 ? Math.min((metric.current_value / metric.target_value) * 100, 100) : metric.health_score}
                                className="h-1.5"
                              />
                            </div>
                            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                              <span>Previous: {
                                metric.unit === 'currency' ? `${(metric.previous_value / 1000).toFixed(0)}K` :
                                metric.unit === 'percentage' ? `${metric.previous_value}%` :
                                metric.previous_value.toLocaleString()
                              }</span>
                              {metric.trend_direction === 'up' ? (
                                <span className="text-success flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />+{metric.trend_percentage}%
                                </span>
                              ) : metric.trend_direction === 'down' ? (
                                <span className="text-red-500 flex items-center gap-1">
                                  <TrendingDown className="h-3 w-3" />{metric.trend_percentage}%
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Activity className="h-3 w-3" />Stable
                                </span>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Twin Alerts */}
          {snapshot?.alerts && (snapshot.alerts as string[]).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 premium-shadow"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                Twin Alerts
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(snapshot.alerts as string[]).map((alert, i) => (
                  <div key={i} className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/20 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">{alert}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AppShell>
  );
}
