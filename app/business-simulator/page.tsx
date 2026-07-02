'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  Sliders,
  Calculator,
  Percent,
  Building2,
  Globe,
  Calendar,
  ArrowRight,
  ChevronDown,
  Info,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type Simulation = {
  id: string;
  name: string;
  description: string;
  scenario_type: string;
  status: string;
  base_metrics: Record<string, number>;
  scenario_parameters: Record<string, any>;
  projected_outcomes: Record<string, any>;
  risk_assessment: Record<string, any>;
  recommendations: string[];
  roi_projection: number;
  time_to_impact: number;
  confidence_level: number;
  created_at: string;
};

type MetricChange = {
  metric: string;
  baseline: number;
  adjusted: number;
  change: number;
  changePercent: number;
};

type ScenarioImpact = {
  category: string;
  impact: 'positive' | 'negative' | 'neutral';
  score: number;
  description: string;
};

const scenarioTypes = [
  { id: 'revenue_growth', label: 'Revenue Growth', icon: TrendingUp, color: 'emerald' },
  { id: 'cost_reduction', label: 'Cost Reduction', icon: DollarSign, color: 'blue' },
  { id: 'market_expansion', label: 'Market Expansion', icon: Globe, color: 'purple' },
  { id: 'hiring', label: 'Hiring Plan', icon: Users, color: 'orange' },
  { id: 'pricing', label: 'Pricing Strategy', icon: Percent, color: 'pink' },
  { id: 'investment', label: 'Capital Investment', icon: Building2, color: 'cyan' },
];

const defaultParams = {
  revenue_change: 0,
  expense_change: 0,
  headcount_change: 0,
  price_change: 0,
  marketing_spend: 0,
  market_share_target: 0,
  investment_amount: 0,
  timeline_months: 12,
};

const defaultMetrics = {
  current_revenue: 5000000,
  current_expenses: 3500000,
  current_profit: 1500000,
  profit_margin: 30,
  customer_count: 250,
  employee_count: 15,
  avg_revenue_per_customer: 20000,
  customer_acquisition_cost: 2500,
};

export default function BusinessSimulatorPage() {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [params, setParams] = useState(defaultParams);
  const [baseMetrics, setBaseMetrics] = useState(defaultMetrics);
  const [results, setResults] = useState<{
    metrics: MetricChange[];
    impacts: ScenarioImpact[];
    roi: number;
    breakeven: number;
    netImpact: number;
    confidence: number;
    risks: string[];
  } | null>(null);
  const [saveDialog, setSaveDialog] = useState(false);
  const [simulationName, setSimulationName] = useState('');
  const [activeScenario, setActiveScenario] = useState('revenue_growth');

  const loadSimulations = useCallback(async () => {
    const { data } = await supabase.from('business_simulations').select('*').order('created_at', { ascending: false }).limit(10);
    if (data) setSimulations(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSimulations();
  }, [loadSimulations]);

  const runSimulation = () => {
    setRunning(true);

    setTimeout(() => {
      const metrics: MetricChange[] = [
        {
          metric: 'Revenue',
          baseline: baseMetrics.current_revenue,
          adjusted: baseMetrics.current_revenue * (1 + params.revenue_change / 100),
          change: baseMetrics.current_revenue * (params.revenue_change / 100),
          changePercent: params.revenue_change,
        },
        {
          metric: 'Expenses',
          baseline: baseMetrics.current_expenses,
          adjusted: baseMetrics.current_expenses * (1 + params.expense_change / 100),
          change: baseMetrics.current_expenses * (params.expense_change / 100),
          changePercent: params.expense_change,
        },
        {
          metric: 'Net Profit',
          baseline: baseMetrics.current_profit,
          adjusted: baseMetrics.current_profit * (1 + (params.revenue_change - params.expense_change) / 100),
          change: baseMetrics.current_profit * ((params.revenue_change - params.expense_change) / 100),
          changePercent: params.revenue_change - params.expense_change,
        },
        {
          metric: 'Customers',
          baseline: baseMetrics.customer_count,
          adjusted: Math.round(baseMetrics.customer_count * (1 + params.marketing_spend / 100)),
          change: Math.round(baseMetrics.customer_count * (params.marketing_spend / 100)),
          changePercent: params.marketing_spend,
        },
        {
          metric: 'Headcount',
          baseline: baseMetrics.employee_count,
          adjusted: baseMetrics.employee_count + params.headcount_change,
          change: params.headcount_change,
          changePercent: (params.headcount_change / baseMetrics.employee_count) * 100,
        },
        {
          metric: 'Profit Margin',
          baseline: baseMetrics.profit_margin,
          adjusted: ((baseMetrics.current_revenue * (1 + params.revenue_change / 100)) -
            (baseMetrics.current_expenses * (1 + params.expense_change / 100))) /
            (baseMetrics.current_revenue * (1 + params.revenue_change / 100)) * 100,
          change: ((baseMetrics.current_revenue * (1 + params.revenue_change / 100)) -
            (baseMetrics.current_expenses * (1 + params.expense_change / 100))) /
            (baseMetrics.current_revenue * (1 + params.revenue_change / 100)) * 100 - baseMetrics.profit_margin,
          changePercent: 0,
        },
      ];

      const impacts: ScenarioImpact[] = [
        {
          category: 'Financial',
          impact: params.revenue_change > 0 ? 'positive' : params.revenue_change < 0 ? 'negative' : 'neutral',
          score: Math.abs(params.revenue_change) * 0.6,
          description: params.revenue_change > 0
            ? `Revenue increase of ${(baseMetrics.current_revenue * params.revenue_change / 100 / 100000).toFixed(1)}L expected`
            : `Revenue decrease of ${(Math.abs(baseMetrics.current_revenue * params.revenue_change / 100) / 100000).toFixed(1)}L projected`,
        },
        {
          category: 'Operations',
          impact: params.headcount_change > 0 ? 'positive' : params.headcount_change < 0 ? 'negative' : 'neutral',
          score: Math.abs(params.headcount_change) * 2,
          description: params.headcount_change > 0
            ? `Team expansion by ${params.headcount_change} members planned`
            : `Workforce reduction of ${Math.abs(params.headcount_change)} positions`,
        },
        {
          category: 'Market',
          impact: params.market_share_target > 0 ? 'positive' : 'neutral',
          score: params.market_share_target * 1.5,
          description: params.market_share_target > 0
            ? `Market share target increased by ${params.market_share_target}%`
            : 'Maintaining current market position',
        },
        {
          category: 'Investment',
          impact: params.investment_amount > 0 ? 'positive' : 'neutral',
          score: params.investment_amount / 1000000,
          description: params.investment_amount > 0
            ? `Capital investment of ${(params.investment_amount / 100000).toFixed(1)}L planned`
            : 'No additional capital investment',
        },
      ];

      const netImpact = metrics.reduce((sum, m) => m.metric === 'Net Profit' ? sum + m.change : sum, 0);
      const totalInvestment = params.investment_amount + (params.marketing_spend / 100 * baseMetrics.current_expenses * 0.2) + (params.headcount_change * 50000);
      const roi = totalInvestment > 0 ? ((netImpact * 12) / totalInvestment) * 100 : 0;
      const breakeven = totalInvestment > 0 && netImpact > 0 ? Math.ceil(totalInvestment / netImpact) : 0;

      const risks: string[] = [];
      if (params.expense_change > 10) risks.push('High expense increase may impact cash flow');
      if (params.headcount_change > 5) risks.push('Large hiring may strain onboarding resources');
      if (params.revenue_change < -10) risks.push('Significant revenue decline projected');
      if (params.investment_amount > 1000000) risks.push('Large capital outlay requires financing evaluation');
      if (params.marketing_spend > 30) risks.push('Aggressive marketing spend may not yield proportional results');

      const confidence = Math.max(50, 95 - risks.length * 10 - Math.abs(params.revenue_change) * 0.5);

      setResults({
        metrics,
        impacts,
        roi,
        breakeven,
        netImpact,
        confidence,
        risks,
      });

      setRunning(false);
    }, 1500);
  };

  const saveSimulation = async () => {
    if (!simulationName.trim()) {
      toast.error('Please enter a simulation name');
      return;
    }

    const { error } = await supabase.from('business_simulations').insert({
      name: simulationName,
      description: `${activeScenario} simulation with ${params.revenue_change}% revenue change`,
      scenario_type: activeScenario,
      status: 'completed',
      base_metrics: baseMetrics,
      scenario_parameters: params,
      projected_outcomes: results?.metrics.reduce((acc, m) => ({ ...acc, [m.metric]: m.adjusted }), {}) || {},
      risk_assessment: results?.risks || {},
      recommendations: (results?.risks?.length || 0) > 0 ? ['Monitor key metrics closely', 'Review risk mitigation strategies'] : [],
      roi_projection: results?.roi || 0,
      time_to_impact: params.timeline_months,
      confidence_level: (results?.confidence || 50) / 100,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Simulation saved');
      setSaveDialog(false);
      setSimulationName('');
      loadSimulations();
    }
  };

  const resetSimulation = () => {
    setParams(defaultParams);
    setResults(null);
  };

  const loadSimulation = (sim: Simulation) => {
    setActiveScenario(sim.scenario_type);
    setParams({ ...defaultParams, ...sim.scenario_parameters as typeof defaultParams });
    setBaseMetrics({ ...defaultMetrics, ...sim.base_metrics as typeof defaultMetrics });
    toast.success('Simulation loaded');
  };

  const scenarioConfig = scenarioTypes.find(s => s.id === activeScenario) || scenarioTypes[0];

  return (
    <AppShell>
      <PageHeader
        title="Business Simulator"
        description="Run what-if scenarios and predict business outcomes"
        action={
          <Button
            onClick={() => setSaveDialog(true)}
            disabled={!results || running}
            variant="outline"
            className="gap-2 rounded-xl"
          >
            Save Scenario
          </Button>
        }
      />

      {loading ? (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="h-[600px] rounded-2xl shimmer" />
          <div className="lg:col-span-2 h-[600px] rounded-2xl shimmer" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="space-y-4">
            {/* Scenario Type Selection */}
            <div className="glass-card p-4 premium-shadow">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Zap className={cn('h-4 w-4', `text-${scenarioConfig.color}-500`)} />
                Scenario Type
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {scenarioTypes.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => setActiveScenario(scenario.id)}
                    className={cn(
                      'p-3 rounded-xl border transition-all flex items-center gap-2 text-left',
                      activeScenario === scenario.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border/40 hover:bg-muted/30'
                    )}
                  >
                    <scenario.icon className={cn('h-4 w-4', `text-${scenario.color}-500`)} />
                    <span className="text-xs font-medium">{scenario.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Parameter Controls */}
            <div className="glass-card p-4 premium-shadow">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                Parameters
              </h3>

              <div className="space-y-5">
                {/* Revenue Change */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Revenue Change</Label>
                    <Badge variant="outline" className={cn(
                      params.revenue_change > 0 ? 'text-success' :
                      params.revenue_change < 0 ? 'text-red-500' : ''
                    )}>
                      {params.revenue_change > 0 ? '+' : ''}{params.revenue_change}%
                    </Badge>
                  </div>
                  <Slider
                    value={[params.revenue_change]}
                    onValueChange={([v]) => setParams(p => ({ ...p, revenue_change: v }))}
                    min={-30}
                    max={50}
                    step={1}
                    className="py-2"
                  />
                </div>

                {/* Expense Change */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Expense Change</Label>
                    <Badge variant="outline" className={cn(
                      params.expense_change < 0 ? 'text-success' :
                      params.expense_change > 0 ? 'text-red-500' : ''
                    )}>
                      {params.expense_change > 0 ? '+' : ''}{params.expense_change}%
                    </Badge>
                  </div>
                  <Slider
                    value={[params.expense_change]}
                    onValueChange={([v]) => setParams(p => ({ ...p, expense_change: v }))}
                    min={-20}
                    max={30}
                    step={1}
                    className="py-2"
                  />
                </div>

                {/* Headcount Change */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Headcount Change</Label>
                    <Badge variant="outline">
                      {params.headcount_change > 0 ? '+' : ''}{params.headcount_change} employees
                    </Badge>
                  </div>
                  <Slider
                    value={[params.headcount_change]}
                    onValueChange={([v]) => setParams(p => ({ ...p, headcount_change: v }))}
                    min={-10}
                    max={20}
                    step={1}
                    className="py-2"
                  />
                </div>

                {/* Marketing Spend */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Marketing Spend Increase</Label>
                    <Badge variant="outline">+{params.marketing_spend}%</Badge>
                  </div>
                  <Slider
                    value={[params.marketing_spend]}
                    onValueChange={([v]) => setParams(p => ({ ...p, marketing_spend: v }))}
                    min={0}
                    max={50}
                    step={1}
                    className="py-2"
                  />
                </div>

                {/* Investment Amount */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Investment Amount</Label>
                    <Badge variant="outline">{(params.investment_amount / 100000).toFixed(0)}L</Badge>
                  </div>
                  <Slider
                    value={[params.investment_amount]}
                    onValueChange={([v]) => setParams(p => ({ ...p, investment_amount: v }))}
                    min={0}
                    max={5000000}
                    step={50000}
                    className="py-2"
                  />
                </div>

                {/* Timeline */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Timeline</Label>
                    <Badge variant="outline">{params.timeline_months} months</Badge>
                  </div>
                  <Slider
                    value={[params.timeline_months]}
                    onValueChange={([v]) => setParams(p => ({ ...p, timeline_months: v }))}
                    min={1}
                    max={36}
                    step={1}
                    className="py-2"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6">
                <Button
                  onClick={runSimulation}
                  disabled={running}
                  className="flex-1 gap-2 rounded-xl"
                >
                  {running ? (
                    <>
                      <RotateCcw className="h-4 w-4 animate-spin" />
                      Simulating...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Run Simulation
                    </>
                  )}
                </Button>
                <Button
                  onClick={resetSimulation}
                  variant="outline"
                  className="rounded-xl"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Saved Simulations */}
            <div className="glass-card p-4 premium-shadow">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Saved Scenarios
              </h3>
              {simulations.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No saved scenarios</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {simulations.slice(0, 5).map((sim) => (
                    <button
                      key={sim.id}
                      onClick={() => loadSimulation(sim)}
                      className="w-full p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{sim.name}</span>
                        <Badge variant="outline" className="text-[9px]">
                          {sim.confidence_level ? Math.round(sim.confidence_level * 100) : 0}% conf
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(sim.created_at).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2 space-y-4">
            {!results ? (
              <div className="glass-card p-12 text-center premium-shadow h-[600px] flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Calculator className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">Scenario Simulator</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Adjust parameters on the left and click "Run Simulation" to see projected business outcomes.
                </p>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-4 premium-shadow"
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                      Net Impact
                    </div>
                    <p className={cn(
                      'text-2xl font-bold',
                      results.netImpact > 0 ? 'text-success' :
                      results.netImpact < 0 ? 'text-red-500' : ''
                    )}>
                      {results.netImpact > 0 ? '+' : ''}{(results.netImpact / 100000).toFixed(1)}L
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">monthly</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="glass-card p-4 premium-shadow"
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Percent className="h-3.5 w-3.5 text-blue-500" />
                      ROI
                    </div>
                    <p className="text-2xl font-bold">{results.roi.toFixed(0)}%</p>
                    <p className="text-[10px] text-muted-foreground mt-1">annualized</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-4 premium-shadow"
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Calendar className="h-3.5 w-3.5 text-orange-500" />
                      Break-even
                    </div>
                    <p className="text-2xl font-bold">{results.breakeven || 'N/A'}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">months</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="glass-card p-4 premium-shadow"
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Target className="h-3.5 w-3.5 text-purple-500" />
                      Confidence
                    </div>
                    <p className={cn(
                      'text-2xl font-bold',
                      results.confidence >= 80 ? 'text-success' :
                      results.confidence >= 60 ? 'text-yellow-500' : 'text-orange-500'
                    )}>
                      {results.confidence.toFixed(0)}%
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">reliability</p>
                  </motion.div>
                </div>

                {/* Metric Comparison */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card p-6 premium-shadow"
                >
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Metric Comparison
                  </h3>

                  <div className="space-y-4">
                    {results.metrics.map((metric, i) => (
                      <motion.div
                        key={metric.metric}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + i * 0.05 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{metric.metric}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {metric.metric === 'Profit Margin' || metric.metric === 'Headcount'
                                ? metric.baseline.toLocaleString()
                                : `${(metric.baseline / 100000).toFixed(0)}L`}
                            </span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className={cn(
                              'text-sm font-bold',
                              metric.change > 0 ? 'text-success' :
                              metric.change < 0 ? 'text-red-500' : ''
                            )}>
                              {metric.metric === 'Profit Margin' || metric.metric === 'Headcount'
                                ? metric.adjusted.toLocaleString(undefined, { maximumFractionDigits: 1 })
                                : `${(metric.adjusted / 100000).toFixed(0)}L`}
                            </span>
                          </div>
                        </div>
                        <div className="relative h-2 rounded-full bg-muted">
                          <div
                            className="absolute h-full rounded-full bg-muted-foreground/30"
                            style={{ width: `${Math.min((metric.baseline / metric.adjusted) * 100, 100)}%` }}
                          />
                          <div
                            className={cn(
                              'absolute h-full rounded-full',
                              metric.change > 0 ? 'bg-success' :
                              metric.change < 0 ? 'bg-red-500' : 'bg-muted-foreground'
                            )}
                            style={{ width: `${Math.min((metric.adjusted / metric.baseline) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">Baseline</span>
                          <span className={cn(
                            metric.change > 0 ? 'text-success' :
                            metric.change < 0 ? 'text-red-500' : 'text-muted-foreground'
                          )}>
                            {metric.change > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%
                          </span>
                          <span className="text-muted-foreground">Adjusted</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Impact Analysis */}
                <div className="grid md:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6 premium-shadow"
                  >
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      Impact Analysis
                    </h3>
                    <div className="space-y-3">
                      {results.impacts.map((impact) => (
                        <div key={impact.category} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                          <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                            impact.impact === 'positive' ? 'bg-success/10' :
                            impact.impact === 'negative' ? 'bg-red-500/10' : 'bg-muted'
                          )}>
                            {impact.impact === 'positive' ? (
                              <TrendingUp className="h-5 w-5 text-success" />
                            ) : impact.impact === 'negative' ? (
                              <TrendingDown className="h-5 w-5 text-red-500" />
                            ) : (
                              <BarChart3 className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{impact.category}</p>
                            <p className="text-xs text-muted-foreground">{impact.description}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            Score: {impact.score.toFixed(1)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Risk Assessment */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="glass-card p-6 premium-shadow"
                  >
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      Risk Assessment
                    </h3>
                    {results.risks.length === 0 ? (
                      <div className="py-8 text-center">
                        <CheckCircle className="h-12 w-12 text-success mx-auto mb-2" />
                        <p className="text-sm font-medium">Low Risk Scenario</p>
                        <p className="text-xs text-muted-foreground mt-1">No significant risks identified</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {results.risks.map((risk, i) => (
                          <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-orange-500/5 border border-orange-500/20">
                            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                            <p className="text-sm text-muted-foreground">{risk}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Save Simulation Dialog */}
      <Dialog open={saveDialog} onOpenChange={setSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Scenario</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Scenario Name</Label>
            <Input
              value={simulationName}
              onChange={(e) => setSimulationName(e.target.value)}
              placeholder="Revenue Growth Q1 Strategy"
              className="mt-2 rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialog(false)}>Cancel</Button>
            <Button onClick={saveSimulation} className="gap-2 rounded-xl">
              <CheckCircle className="h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
