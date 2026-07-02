'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  IndianRupee,
  FileText,
  Target,
  Sparkles,
  ArrowUpRight,
  Zap,
  RefreshCw,
  Brain,
  Lightbulb,
  Shield,
  Calendar,
  Building2,
  Eye,
  MessageSquare,
  Play,
  BarChart3,
  PieChart,
  DollarSign,
  Globe,
  ChevronRight,
  Award,
  Clock3,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type Agent = {
  id: string;
  name: string;
  role: string;
  status: string;
  last_activity: string | null;
  metrics: Record<string, any>;
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
  key_wins: string[];
  key_concerns: string[];
  recommendations: string[];
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

type StrategicInsight = {
  id: string;
  title: string;
  category: string;
  content: string;
  recommended_actions: string[];
  confidence_score: number;
  is_actioned: boolean;
  priority: number;
};

type Risk = {
  id: string;
  title: string;
  category: string;
  severity: string;
  risk_score: number;
  mitigation_strategies: string[];
  status: string;
};

type Decision = {
  id: string;
  decision_type: string;
  title: string;
  context: string;
  selected_option: string;
  rationale: string;
  confidence_score: number;
  status: string;
};

const agentColors: Record<string, string> = {
  ceo: 'hsl(221 83% 53%)',
  sales_manager: 'hsl(142 71% 45%)',
  crm_manager: 'hsl(199 89% 48%)',
  accountant: 'hsl(38 92% 50%)',
  gst_consultant: 'hsl(280 65% 60%)',
  support: 'hsl(0 72% 51%)',
  marketing: 'hsl(330 80% 60%)',
  hr: 'hsl(180 60% 50%)',
  operations: 'hsl(260 60% 50%)',
};

const priorityColors: Record<string, string> = {
  info: 'bg-blue-500/10 text-blue-500',
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-yellow-500/10 text-yellow-500',
  high: 'bg-orange-500/10 text-orange-500',
  urgent: 'bg-red-500/10 text-red-500',
};

export default function AICEODashboard() {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [morningReport, setMorningReport] = useState<MorningReport | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [insights, setInsights] = useState<StrategicInsight[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedInsight, setSelectedInsight] = useState<StrategicInsight | null>(null);
  const [businessMetrics, setBusinessMetrics] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    activeLeads: 0,
    conversionRate: 0,
    customerHealth: 0,
    employeeProductivity: 0,
    overallHealth: 78,
  });

  const loadData = useCallback(async () => {
    setLoading(true);

    const [agentsRes, reportRes, predictionsRes, insightsRes, risksRes, decisionsRes, customers, leads, payments, invoices, tasksData] = await Promise.all([
      supabase.from('ai_agents').select('*').order('name'),
      supabase.from('ceo_morning_reports').select('*').order('report_date', { ascending: false }).limit(1).single(),
      supabase.from('predictions').select('*').order('created_at', { ascending: false }).limit(8),
      supabase.from('ceo_strategic_insights').select('*').order('priority', { ascending: false }).limit(10),
      supabase.from('business_risks').select('*').eq('status', 'active').order('risk_score', { ascending: false }).limit(6),
      supabase.from('ai_decisions').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('customers').select('status, total_revenue'),
      supabase.from('leads').select('status, value'),
      supabase.from('payments').select('amount, status'),
      supabase.from('invoices').select('total, status'),
      supabase.from('tasks').select('status'),
    ]);

    if (agentsRes.data) setAgents(agentsRes.data);
    if (reportRes.data) setMorningReport(reportRes.data);
    if (predictionsRes.data) setPredictions(predictionsRes.data);
    if (insightsRes.data) setInsights(insightsRes.data);
    if (risksRes.data) setRisks(risksRes.data);
    if (decisionsRes.data) setDecisions(decisionsRes.data);

    const totalRevenue = payments.data?.filter((p) => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0) || 0;
    const pendingPayments = invoices.data?.filter((i) => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + Number(i.total), 0) || 0;
    const activeLeads = leads.data?.filter((l) => !['won', 'lost'].includes(l.status)).length || 0;
    const wonLeads = leads.data?.filter((l) => l.status === 'won').length || 0;
    const conversionRate = leads.data?.length ? Math.round((wonLeads / leads.data.length) * 100) : 0;
    const activeCustomers = customers.data?.filter((c) => c.status === 'active').length || 0;
    const totalCustomers = customers.data?.length || 1;
    const customerHealth = Math.round((activeCustomers / totalCustomers) * 100);
    const doneTasks = tasksData.data?.filter((t) => t.status === 'done').length || 0;
    const totalTasks = tasksData.data?.length || 1;
    const employeeProductivity = Math.round((doneTasks / totalTasks) * 100);
    const overallHealth = Math.round((customerHealth + conversionRate + employeeProductivity) / 3);

    setBusinessMetrics({
      totalRevenue,
      pendingPayments,
      activeLeads,
      conversionRate,
      customerHealth,
      employeeProductivity,
      overallHealth,
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeAgents = agents.filter((a) => a.status === 'active').length;
  const criticalRisks = risks.filter(r => r.severity === 'critical' || r.severity === 'high').length;

  const generateReport = async () => {
    const { error } = await supabase.from('ai_reports').insert({
      agent_id: agents.find((a) => a.role === 'ceo')?.id,
      report_type: 'daily_executive',
      title: `Daily Executive Report - ${new Date().toLocaleDateString('en-IN')}`,
      data: { summary: businessMetrics, predictions: predictions.slice(0, 3), risks: risks.slice(0, 3) },
    });
    if (!error) alert('Report generated successfully!');
  };

  const getHealthStatus = (score: number) => {
    if (score >= 85) return { label: 'Excellent', color: 'text-success', bg: 'bg-success' };
    if (score >= 70) return { label: 'Good', color: 'text-emerald-500', bg: 'bg-emerald-500' };
    if (score >= 50) return { label: 'Fair', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    return { label: 'Needs Attention', color: 'text-orange-500', bg: 'bg-orange-500' };
  };

  const healthStatus = getHealthStatus(businessMetrics.overallHealth);

  return (
    <AppShell>
      <PageHeader
        title="AI CEO"
        description="Autonomous executive intelligence and strategic decision engine"
        action={
          <Button onClick={generateReport} className="gap-2 rounded-xl">
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
          {/* Executive Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: 'AI Health Score', value: businessMetrics.overallHealth, suffix: '/100', icon: Activity, color: healthStatus.color },
              { label: 'Active Agents', value: activeAgents, suffix: `/${agents.length}`, icon: Bot, color: 'text-primary' },
              { label: 'Total Revenue', value: `${(businessMetrics.totalRevenue / 1000).toFixed(0)}k`, prefix: '₹', icon: DollarSign, color: 'text-success' },
              { label: 'Active Leads', value: businessMetrics.activeLeads, icon: Target, color: 'text-blue-500' },
              { label: 'Conversion', value: `${businessMetrics.conversionRate}%`, icon: TrendingUp, color: 'text-emerald-500' },
              { label: 'Critical Risks', value: criticalRisks, icon: Shield, color: criticalRisks > 0 ? 'text-red-500' : 'text-success' },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 premium-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <m.icon className={cn('h-4 w-4', m.color)} />
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </div>
                <p className={cn('text-2xl font-bold', m.color)}>
                  {m.prefix}{m.value}{m.suffix}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="glass-card p-1 h-auto mb-4">
              <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
              <TabsTrigger value="predictions" className="rounded-lg gap-2">
                <Brain className="h-3.5 w-3.5" />
                Predictions
              </TabsTrigger>
              <TabsTrigger value="strategy" className="rounded-lg gap-2">
                <Target className="h-3.5 w-3.5" />
                Strategy
              </TabsTrigger>
              <TabsTrigger value="risks" className="rounded-lg gap-2">
                <Shield className="h-3.5 w-3.5" />
                Risks
              </TabsTrigger>
              <TabsTrigger value="agents" className="rounded-lg gap-2">
                <Bot className="h-3.5 w-3.5" />
                Agents
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0 space-y-6">
              {/* Morning Report */}
              {morningReport && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6 premium-shadow"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">AI CEO Morning Brief</h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(morningReport.report_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                      </div>
                    </div>
                    <Badge className={healthStatus.bg ? `${healthStatus.bg}/10 ${healthStatus.color}` : ''}>
                      Score: {morningReport.ai_health_score || businessMetrics.overallHealth}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{morningReport.executive_summary}</p>

                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-muted/30">
                      <p className="text-xs text-muted-foreground">Revenue MTD</p>
                      <p className="text-xl font-bold">₹{(morningReport.revenue_mtd / 100000).toFixed(1)}L</p>
                      <Progress value={(morningReport.revenue_mtd / morningReport.revenue_target) * 100} className="h-1 mt-2" />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Target: ₹{(morningReport.revenue_target / 100000).toFixed(1)}L
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/30">
                      <p className="text-xs text-muted-foreground">New Leads</p>
                      <p className="text-xl font-bold">{morningReport.new_leads}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Today&apos;s additions</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/30">
                      <p className="text-xs text-muted-foreground">Converted</p>
                      <p className="text-xl font-bold">{morningReport.converted_leads}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Won opportunities</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/30">
                      <p className="text-xs text-muted-foreground">AI Health</p>
                      <p className="text-xl font-bold">{morningReport.ai_health_score || businessMetrics.overallHealth}%</p>
                      <p className="text-[10px] text-muted-foreground mt-1">System wellness</p>
                    </div>
                  </div>

                  {/* Wins & Concerns */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-success/5 border border-success/20">
                      <p className="text-xs font-medium text-success mb-2 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Key Wins
                      </p>
                      <ul className="space-y-1">
                        {(morningReport.key_wins as string[] || []).slice(0, 3).map((win, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <ArrowUpRight className="h-3 w-3 text-success mt-0.5 shrink-0" />
                            {win}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/20">
                      <p className="text-xs font-medium text-orange-500 mb-2 flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" /> Key Concerns
                      </p>
                      <ul className="space-y-1">
                        {(morningReport.key_concerns as string[] || []).slice(0, 3).map((concern, i) => (
                          <li key={i} className="text-xs text-muted-foreground">{concern}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Quick Insights Grid */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Predictions */}
                <div className="glass-card overflow-hidden premium-shadow">
                  <div className="p-4 border-b border-border/40 flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      AI Predictions
                    </h3>
                    <Badge variant="outline" className="text-[10px]">{predictions.length}</Badge>
                  </div>
                  <div className="divide-y divide-border/40 max-h-[300px] overflow-y-auto">
                    {predictions.slice(0, 5).map((pred) => (
                      <div key={pred.id} className="p-3 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-[9px] capitalize">{pred.category.replace('_', ' ')}</Badge>
                          <span className={cn('text-[10px] font-medium',
                            pred.confidence === 'high' ? 'text-success' :
                            pred.confidence === 'medium' ? 'text-yellow-500' : 'text-muted-foreground'
                          )}>
                            {Math.round(pred.confidence_score * 100)}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{pred.prediction_text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strategic Recommendations */}
                <div className="glass-card overflow-hidden premium-shadow">
                  <div className="p-4 border-b border-border/40 flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Recommendations
                    </h3>
                  </div>
                  <div className="divide-y divide-border/40 max-h-[300px] overflow-y-auto">
                    {insights.slice(0, 5).map((insight) => (
                      <button
                        key={insight.id}
                        onClick={() => setSelectedInsight(insight)}
                        className="w-full p-3 hover:bg-muted/20 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={cn('text-[9px]', priorityColors[insight.priority <= 3 ? 'urgent' : insight.priority <= 5 ? 'high' : 'medium'])}>
                            P{insight.priority}
                          </Badge>
                          <span className="text-sm font-medium truncate">{insight.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{insight.content}</p>
                      </button>
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
                      criticalRisks > 0 ? 'bg-red-500/10 text-red-500' : 'bg-success/10 text-success'
                    )}>
                      {criticalRisks} critical
                    </Badge>
                  </div>
                  <div className="divide-y divide-border/40 max-h-[300px] overflow-y-auto">
                    {risks.slice(0, 5).map((risk) => (
                      <div key={risk.id} className="p-3 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold',
                            risk.severity === 'critical' ? 'bg-red-500/10 text-red-500' :
                            risk.severity === 'high' ? 'bg-orange-500/10 text-orange-500' :
                            risk.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-muted'
                          )}>
                            {risk.risk_score}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium truncate">{risk.title}</p>
                            <p className="text-[10px] text-muted-foreground capitalize">{risk.category}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CEO Summary Actions */}
              <div className="glass-card p-6 premium-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI CEO Strategic Actions</h3>
                    <p className="text-xs text-muted-foreground">Recommended next steps</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(morningReport?.recommendations as string[] || [
                    'Review pending payments follow-up',
                    'Approve high-value quotations',
                    'Monitor lead conversion rate',
                    'Schedule customer health check',
                  ]).slice(0, 4).map((rec, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-semibold">
                          {i + 1}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-sm">{rec}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Predictions Tab */}
            <TabsContent value="predictions" className="mt-0">
              <div className="glass-card p-6 premium-shadow">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Predictive Intelligence
                </h3>
                {predictions.length === 0 ? (
                  <div className="py-12 text-center">
                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No predictions available yet</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {predictions.map((pred, i) => (
                      <motion.div
                        key={pred.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="p-4 rounded-xl bg-muted/30 border border-border/30"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className="text-[10px] capitalize">{pred.category.replace('_', ' ')}</Badge>
                          <Badge className={cn('text-[10px]',
                            pred.confidence === 'high' ? 'bg-success/10 text-success' :
                            pred.confidence === 'medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-muted'
                          )}>
                            {Math.round(pred.confidence_score * 100)}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{pred.prediction_text}</p>
                        {pred.predicted_value && (
                          <div className="flex items-center gap-2 text-lg font-bold">
                            {pred.category.includes('revenue') || pred.category.includes('cash') ? (
                              <>
                                <DollarSign className="h-5 w-5 text-success" />
                                {(pred.predicted_value / 100000).toFixed(1)}L
                              </>
                            ) : (
                              pred.predicted_value.toLocaleString()
                            )}
                          </div>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-2">
                          Generated {new Date(pred.created_at).toLocaleDateString()}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Strategy Tab */}
            <TabsContent value="strategy" className="mt-0">
              <div className="glass-card p-6 premium-shadow">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Strategic Insights & Recommendations
                </h3>
                {insights.length === 0 ? (
                  <div className="py-12 text-center">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No strategic insights available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {insights.map((insight, i) => (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                            insight.priority <= 3 ? 'bg-red-500/10' :
                            insight.priority <= 5 ? 'bg-orange-500/10' : 'bg-blue-500/10'
                          )}>
                            <Lightbulb className={cn('h-5 w-5',
                              insight.priority <= 3 ? 'text-red-500' :
                              insight.priority <= 5 ? 'text-orange-500' : 'text-blue-500'
                            )} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{insight.title}</h4>
                              <Badge variant="outline" className="text-[10px]">{insight.category}</Badge>
                              {insight.is_actioned && (
                                <Badge className="bg-success/10 text-success text-[10px]">Done</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{insight.content}</p>
                            {(insight.recommended_actions as string[] || []).length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {(insight.recommended_actions as string[]).slice(0, 3).map((action, j) => (
                                  <Badge key={j} variant="secondary" className="text-[10px]">{action}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-2xl font-bold">{Math.round((insight.confidence_score || 0.5) * 100)}%</p>
                            <p className="text-[10px] text-muted-foreground">confidence</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Risks Tab */}
            <TabsContent value="risks" className="mt-0">
              <div className="glass-card p-6 premium-shadow">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-orange-500" />
                  Active Risk Register
                </h3>
                {risks.length === 0 ? (
                  <div className="py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
                    <p className="text-sm font-medium">All Clear</p>
                    <p className="text-xs text-muted-foreground">No active risks identified</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {risks.map((risk, i) => (
                      <motion.div
                        key={risk.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn('p-4 rounded-xl border',
                          risk.severity === 'critical' ? 'bg-red-500/5 border-red-500/20' :
                          risk.severity === 'high' ? 'bg-orange-500/5 border-orange-500/20' :
                          risk.severity === 'medium' ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-muted/30 border-border/30'
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                            risk.severity === 'critical' ? 'bg-red-500/10' :
                            risk.severity === 'high' ? 'bg-orange-500/10' :
                            risk.severity === 'medium' ? 'bg-yellow-500/10' : 'bg-muted'
                          )}>
                            <Shield className={cn('h-6 w-6',
                              risk.severity === 'critical' ? 'text-red-500' :
                              risk.severity === 'high' ? 'text-orange-500' :
                              risk.severity === 'medium' ? 'text-yellow-500' : 'text-muted-foreground'
                            )} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{risk.title}</h4>
                              <Badge className={cn('text-[10px] capitalize',
                                risk.severity === 'critical' ? 'bg-red-500/10 text-red-500' :
                                risk.severity === 'high' ? 'bg-orange-500/10 text-orange-500' :
                                risk.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-muted'
                              )}>
                                {risk.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{risk.category}</p>
                            {(risk.mitigation_strategies as string[] || []).length > 0 && (
                              <div className="space-y-1">
                                {(risk.mitigation_strategies as string[]).slice(0, 2).map((strategy, j) => (
                                  <p key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                                    <Zap className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                                    {strategy}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold">{risk.risk_score}</p>
                            <p className="text-[10px] text-muted-foreground">Risk Score</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Agents Tab */}
            <TabsContent value="agents" className="mt-0">
              <div className="glass-card p-6 premium-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    AI Workforce Orchestration
                  </h3>
                  <Badge>
                    <Activity className="h-3 w-3 mr-1" />
                    {activeAgents} Active
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {agents.map((agent, i) => {
                    const color = agentColors[agent.role] || 'hsl(200 50% 50%)';
                    const isActive = agent.status === 'active';
                    return (
                      <motion.div
                        key={agent.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn(
                          'p-4 rounded-xl border transition-all cursor-pointer',
                          isActive ? 'border-primary/20 bg-primary/5' : 'border-border/40 bg-muted/20'
                        )}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                            style={{ background: color }}
                          >
                            <Bot className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{agent.name.replace('AI ', '')}</p>
                            <p className="text-[10px] text-muted-foreground capitalize">{agent.role.replace('_', ' ')}</p>
                          </div>
                          <span className={cn('w-2.5 h-2.5 rounded-full', isActive ? 'bg-success animate-pulse' : 'bg-muted-foreground')} />
                        </div>
                        {agent.last_activity && (
                          <p className="text-[10px] text-muted-foreground">
                            Last: {new Date(agent.last_activity).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                        {agent.metrics && (
                          <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
                            {Object.entries(agent.metrics).slice(0, 2).map(([key, val]) => (
                              <div key={key} className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-success" />
                                <span className="text-muted-foreground truncate">{String(val)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Insight Detail Dialog */}
      <Dialog open={!!selectedInsight} onOpenChange={() => setSelectedInsight(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedInsight?.title}</DialogTitle>
          </DialogHeader>
          {selectedInsight && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedInsight.category}</Badge>
                <Badge className={cn(selectedInsight.priority <= 3 ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500')}>
                  Priority {selectedInsight.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{selectedInsight.content}</p>
              <div className="p-3 rounded-xl bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2">Recommended Actions</p>
                <ul className="space-y-1">
                  {(selectedInsight.recommended_actions as string[] || []).map((action, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Zap className="h-3.5 w-3.5 text-primary" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Confidence Level</span>
                <Badge>{Math.round((selectedInsight.confidence_score || 0.5) * 100)}%</Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
