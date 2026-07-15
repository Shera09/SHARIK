'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  Activity,
  Target,
  Zap,
  Brain,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Shield,
  Lightbulb,
  AlertCircle,
  Bell,
  Calendar,
  RefreshCw,
  ChevronRight,
  Play,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type HealthMetric = {
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
};

type Prediction = {
  id: string;
  category: string;
  prediction_text: string;
  predicted_value: number;
  confidence: string;
  confidence_score: number;
  created_at: string;
};

type Alert = {
  id: string;
  title: string;
  message: string;
  category: string;
  priority: string;
  is_acknowledged: boolean;
  created_at: string;
};

type Risk = {
  id: string;
  title: string;
  category: string;
  severity: string;
  risk_score: number;
  status: string;
};

type MorningReport = {
  id: string;
  report_date: string;
  executive_summary: string;
  revenue_yesterday: number;
  revenue_mtd: number;
  revenue_target: number;
  new_leads: number;
  converted_leads: number;
  ai_health_score: number;
  cash_position: number;
  receivables: number;
  payables: number;
  key_wins: string[];
  key_concerns: string[];
  recommendations: string[];
};

const healthColors: Record<string, string> = {
  financial: 'text-emerald-500',
  operational: 'text-blue-500',
  customer: 'text-purple-500',
  employee: 'text-orange-500',
  system: 'text-cyan-500',
  market: 'text-pink-500',
};

const priorityColors: Record<string, string> = {
  info: 'bg-blue-500/10 text-blue-500',
  warning: 'bg-yellow-500/10 text-yellow-500',
  critical: 'bg-red-500/10 text-red-500',
  emergency: 'bg-red-600/20 text-red-600 border border-red-600/30',
};

const severityColors: Record<string, string> = {
  low: 'text-green-500',
  medium: 'text-yellow-500',
  high: 'text-orange-500',
  critical: 'text-red-500',
};

export default function CEODashboardPage() {
  const [loading, setLoading] = useState(true);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [morningReport, setMorningReport] = useState<MorningReport | null>(null);
  const [overallHealth, setOverallHealth] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState<HealthMetric | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    const [metricsRes, predictionsRes, alertsRes, risksRes, reportRes] = await Promise.all([
      supabase.from('digital_twin_metrics').select('*').order('last_updated', { ascending: false }).limit(20),
      supabase.from('predictions').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('smart_alerts').select('*').eq('is_resolved', false).order('created_at', { ascending: false }).limit(10),
      supabase.from('business_risks').select('*').eq('status', 'active').order('risk_score', { ascending: false }).limit(8),
      supabase.from('ceo_morning_reports').select('*').order('report_date', { ascending: false }).limit(1).single(),
    ]);

    if (metricsRes.data) {
      setHealthMetrics(metricsRes.data);
      const avg = metricsRes.data.reduce((sum, m) => sum + (m.health_score || 0), 0) / metricsRes.data.length;
      setOverallHealth(Math.round(avg));
    }
    if (predictionsRes.data) setPredictions(predictionsRes.data);
    if (alertsRes.data) setAlerts(alertsRes.data);
    if (risksRes.data) setRisks(risksRes.data);
    if (reportRes.data) setMorningReport(reportRes.data);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const acknowledgeAlert = async (id: string) => {
    await supabase.from('smart_alerts').update({ is_acknowledged: true, acknowledged_at: new Date().toISOString() }).eq('id', id);
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const metricsByCategory = healthMetrics.reduce((acc, m) => {
    if (!acc[m.metric_type]) acc[m.metric_type] = [];
    acc[m.metric_type].push(m);
    return acc;
  }, {} as Record<string, HealthMetric[]>);

  const revenueProgress = morningReport ? (morningReport.revenue_mtd / morningReport.revenue_target) * 100 : 0;

  return (
    <AppShell>
      <PageHeader
        title="CEO Command Center"
        description="Enterprise executive dashboard with AI-powered insights"
        action={
          <Button
            onClick={refresh}
            disabled={refreshing}
            variant="outline"
            className="gap-2 rounded-xl"
          >
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            Refresh
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl shimmer" />
            ))}
          </div>
          <div className="h-96 rounded-2xl shimmer" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Health Score Hero */}
          <div className="glass-card p-6 premium-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted/20" />
                    <circle
                      cx="40" cy="40" r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${overallHealth * 2.2} 220`}
                      className={cn(
                        overallHealth >= 80 ? 'text-success' :
                        overallHealth >= 60 ? 'text-yellow-500' :
                        overallHealth >= 40 ? 'text-orange-500' : 'text-red-500'
                      )}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{overallHealth}</span>
                  </div>
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">AI Health Score</h2>
                  <p className="text-sm text-muted-foreground">
                    {overallHealth >= 80 ? 'Excellent condition' :
                     overallHealth >= 60 ? 'Good condition' :
                     overallHealth >= 40 ? 'Needs attention' : 'Critical state'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={cn(
                  overallHealth >= 80 ? 'bg-success/10 text-success' :
                  overallHealth >= 60 ? 'bg-yellow-500/10 text-yellow-500' :
                  overallHealth >= 40 ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'
                )}>
                  {overallHealth >= 80 ? 'Optimal' : overallHealth >= 60 ? 'Stable' : overallHealth >= 40 ? 'Warning' : 'Critical'}
                </Badge>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {[
                { label: 'Active Alerts', value: alerts.filter(a => !a.is_acknowledged).length, icon: AlertTriangle, color: alerts.length > 0 ? 'text-red-500' : 'text-success' },
                { label: 'Active Risks', value: risks.length, icon: Shield, color: risks.filter(r => r.severity === 'critical').length > 0 ? 'text-red-500' : 'text-yellow-500' },
                { label: 'Predictions', value: predictions.length, icon: Brain, color: 'text-purple-500' },
                { label: 'Today\'s Leads', value: morningReport?.new_leads || 0, icon: Users, color: 'text-blue-500' },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    <stat.icon className={cn('h-4 w-4', stat.color)} />
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className="mt-1 text-xl font-semibold">{stat.value}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Morning Report Card */}
          {morningReport && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 premium-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">AI CEO Morning Brief</h3>
                    <Badge variant="outline" className="text-[10px]">
                      {new Date(morningReport.report_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{morningReport.executive_summary}</p>

                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Revenue */}
                    <div className="p-4 rounded-xl bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Revenue MTD</span>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                      </div>
                      <p className="text-2xl font-bold">
                        {(morningReport.revenue_mtd / 100000).toFixed(1)}L
                      </p>
                      <Progress value={revenueProgress} className="h-1.5 mt-2" />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Target: {(morningReport.revenue_target / 100000).toFixed(1)}L ({revenueProgress.toFixed(0)}%)
                      </p>
                    </div>

                    {/* Conversion */}
                    <div className="p-4 rounded-xl bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Lead Conversion</span>
                        <Target className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold">{morningReport.converted_leads}</p>
                        <span className="text-xs text-muted-foreground">/ {morningReport.new_leads}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2">
                        {morningReport.new_leads > 0 ? ((morningReport.converted_leads / morningReport.new_leads) * 100).toFixed(1) : 0}% conversion rate
                      </p>
                    </div>

                    {/* Cash Position */}
                    <div className="p-4 rounded-xl bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Cash Position</span>
                        <Activity className="h-4 w-4 text-cyan-500" />
                      </div>
                      <p className="text-2xl font-bold">
                        {(morningReport.cash_position / 100000).toFixed(1)}L
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-2">
                        Receivables: {(morningReport.receivables / 100000).toFixed(1)}L
                      </p>
                    </div>
                  </div>

                  {/* WINS & CONCERNS */}
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="p-3 rounded-xl bg-success/5 border border-success/20">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium text-success">Key Wins</span>
                      </div>
                      <ul className="space-y-1">
                        {(morningReport.key_wins as string[] || []).slice(0, 3).map((win, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <ArrowUpRight className="h-3 w-3 text-success mt-0.5 shrink-0" />
                            {win}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <span className="text-sm font-medium text-destructive">Key Concerns</span>
                      </div>
                      <ul className="space-y-1">
                        {(morningReport.key_concerns as string[] || []).slice(0, 3).map((concern, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <ArrowDownRight className="h-3 w-3 text-destructive mt-0.5 shrink-0" />
                            {concern}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Health Metrics by Category */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Business Health Metrics
              </h3>

              {Object.entries(metricsByCategory).map(([category, metrics]) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-4 premium-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-sm capitalize flex items-center gap-2">
                      <span className={cn('w-2 h-2 rounded-full',
                        category === 'financial' ? 'bg-emerald-500' :
                        category === 'operational' ? 'bg-blue-500' :
                        category === 'customer' ? 'bg-purple-500' :
                        category === 'employee' ? 'bg-orange-500' :
                        category === 'system' ? 'bg-cyan-500' : 'bg-pink-500'
                      )} />
                      {category}
                    </h4>
                    <Badge variant="outline" className="text-[10px]">
                      Avg: {Math.round(metrics.reduce((sum, m) => sum + (m.health_score || 0), 0) / metrics.length)}%
                    </Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {metrics.slice(0, 4).map((metric) => (
                      <button
                        key={metric.id}
                        onClick={() => setSelectedMetric(metric)}
                        className="p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-left group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground line-clamp-1">{metric.metric_name}</span>
                          {metric.trend_direction === 'up' ? (
                            <TrendingUp className="h-3.5 w-3.5 text-success" />
                          ) : metric.trend_direction === 'down' ? (
                            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                          ) : (
                            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                          <p className="text-lg font-semibold">
                            {metric.unit === 'currency' ? `${(metric.current_value / 1000).toFixed(0)}K` :
                             metric.unit === 'percentage' ? `${metric.current_value}%` :
                             metric.current_value.toLocaleString()}
                          </p>
                          {metric.trend_percentage !== 0 && (
                            <span className={cn('text-[10px]', metric.trend_percentage > 0 ? 'text-success' : 'text-red-500')}>
                              {metric.trend_percentage > 0 ? '+' : ''}{metric.trend_percentage}%
                            </span>
                          )}
                        </div>
                        <Progress value={metric.health_score} className="h-1 mt-2" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4">
              {/* Smart Alerts */}
              <div className="glass-card overflow-hidden premium-shadow">
                <div className="p-4 border-b border-border/40 flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    Smart Alerts
                  </h3>
                  <Badge variant={alerts.length > 0 ? 'destructive' : 'secondary'} className="text-[10px]">
                    {alerts.length} active
                  </Badge>
                </div>
                {alerts.length === 0 ? (
                  <div className="p-6 text-center">
                    <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">All clear!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/40 max-h-[300px] overflow-y-auto">
                    {alerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className="p-3 hover:bg-muted/20 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <Badge className={cn('text-[9px] mb-1', priorityColors[alert.priority] || priorityColors.info)}>
                              {alert.priority}
                            </Badge>
                            <p className="text-sm font-medium line-clamp-1">{alert.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{alert.message}</p>
                          </div>
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="text-muted-foreground hover:text-primary"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Predictions */}
              <div className="glass-card overflow-hidden premium-shadow">
                <div className="p-4 border-b border-border/40">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    AI Predictions
                  </h3>
                </div>
                <div className="divide-y divide-border/40 max-h-[250px] overflow-y-auto">
                  {predictions.slice(0, 5).map((pred) => (
                    <div key={pred.id} className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-[9px] capitalize">{pred.category.replace('_', ' ')}</Badge>
                        <span className={cn('text-[10px] font-medium',
                          pred.confidence === 'high' ? 'text-success' :
                          pred.confidence === 'medium' ? 'text-yellow-500' : 'text-muted-foreground'
                        )}>
                          {Math.round(pred.confidence_score * 100)}% confidence
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{pred.prediction_text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Radar */}
              <div className="glass-card overflow-hidden premium-shadow">
                <div className="p-4 border-b border-border/40 flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-orange-500" />
                    Risk Radar
                  </h3>
                  <Badge className={cn('text-[10px]',
                    risks.some(r => r.severity === 'critical') ? 'bg-red-500/10 text-red-500' :
                    risks.some(r => r.severity === 'high') ? 'bg-orange-500/10 text-orange-500' : 'bg-muted'
                  )}>
                    {risks.filter(r => r.severity === 'critical' || r.severity === 'high').length} high priority
                  </Badge>
                </div>
                <div className="divide-y divide-border/40 max-h-[200px] overflow-y-auto">
                  {risks.slice(0, 4).map((risk) => (
                    <div key={risk.id} className="p-3 flex items-center gap-3">
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                        risk.severity === 'critical' ? 'bg-red-500/10' :
                        risk.severity === 'high' ? 'bg-orange-500/10' :
                        risk.severity === 'medium' ? 'bg-yellow-500/10' : 'bg-muted'
                      )}>
                        <AlertTriangle className={cn('h-4 w-4', severityColors[risk.severity])} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{risk.title}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{risk.category} risk</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{risk.risk_score}</p>
                        <p className="text-[9px] text-muted-foreground">risk score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Button size="sm" className="w-full justify-start gap-2 rounded-lg" variant="outline">
                    <Play className="h-3.5 w-3.5" />
                    Run Business Simulation
                  </Button>
                  <Button size="sm" className="w-full justify-start gap-2 rounded-lg" variant="outline">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Ask AI CEO
                  </Button>
                  <Button size="sm" className="w-full justify-start gap-2 rounded-lg" variant="outline">
                    <Calendar className="h-3.5 w-3.5" />
                    Schedule Board Meeting
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          {morningReport?.recommendations && (morningReport.recommendations as string[]).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 premium-shadow"
            >
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <h3 className="font-semibold">AI CEO Recommendations</h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(morningReport.recommendations as string[]).map((rec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-semibold shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-sm">{rec}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-end">
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Metric Detail Dialog */}
      <Dialog open={!!selectedMetric} onOpenChange={() => setSelectedMetric(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedMetric?.metric_name}</DialogTitle>
          </DialogHeader>
          {selectedMetric && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground">Current</p>
                  <p className="text-xl font-bold">
                    {selectedMetric.unit === 'currency' ? `${(selectedMetric.current_value / 1000).toFixed(0)}K` :
                     selectedMetric.current_value.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground">Previous</p>
                  <p className="text-xl font-bold">
                    {selectedMetric.unit === 'currency' ? `${((selectedMetric.previous_value || 0) / 1000).toFixed(0)}K` :
                     (selectedMetric.previous_value || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Health Score</span>
                  <span className="text-sm font-semibold">{selectedMetric.health_score}%</span>
                </div>
                <Progress value={selectedMetric.health_score} className="h-2" />
              </div>
              <div className="p-3 rounded-xl bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1">Trend</p>
                <div className="flex items-center gap-2">
                  {selectedMetric.trend_direction === 'up' ? (
                    <TrendingUp className="h-5 w-5 text-success" />
                  ) : selectedMetric.trend_direction === 'down' ? (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  ) : (
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className={cn('font-medium',
                    selectedMetric.trend_direction === 'up' ? 'text-success' :
                    selectedMetric.trend_direction === 'down' ? 'text-red-500' : 'text-muted-foreground'
                  )}>
                    {selectedMetric.trend_percentage > 0 ? '+' : ''}{selectedMetric.trend_percentage}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
