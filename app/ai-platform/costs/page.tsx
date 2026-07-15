'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Activity,
  Zap,
  AlertTriangle,
  Settings,
  Download,
  Calendar,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';

type Budget = {
  id: string;
  entity_type: string;
  budget_type: string;
  amount: number;
  spent_amount: number;
  alert_threshold_pct: number;
  is_active: boolean;
};

type CostLog = {
  id: string;
  model_id: string;
  request_type: string;
  input_tokens: number;
  output_tokens: number;
  total_cost: number;
  created_at: string;
};

export default function AICostManagementPage() {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [costLogs, setCostLogs] = useState<CostLog[]>([]);
  const [models, setModels] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [budgetsRes] = await Promise.all([
      supabase.from('ai_budgets').select('*').limit(10),
    ]);
    if (budgetsRes.data) setBudgets(budgetsRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const mockStats = {
    monthlySpend: 127.45,
    dailySpend: 4.23,
    projectedMonthly: 142.50,
    costPerRequest: 0.0023,
    totalRequests: 55421,
    totalTokens: 12.4,
  };

  const getSpendingProgress = (spent: number, budget: number) => {
    return (spent / budget) * 100;
  };

  return (
    <AppShell>
      <PageHeader
        title="AI Cost Management"
        description="Budget tracking, usage analytics, and cost optimization"
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2">
              <Settings className="h-4 w-4" />
              Set Budget
            </Button>
          </div>
        }
      />

      {/* Cost Overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Monthly Spend', value: `$${mockStats.monthlySpend}`, icon: DollarSign, trend: '+12%', color: 'text-green-500' },
          { label: 'Daily Average', value: `$${mockStats.dailySpend}`, icon: TrendingUp, trend: '-3%', color: 'text-red-500' },
          { label: 'Projected Monthly', value: `$${mockStats.projectedMonthly}`, icon: BarChart3, trend: '+8%', color: 'text-yellow-500' },
          { label: 'Total Requests', value: mockStats.totalRequests.toLocaleString(), icon: Activity, trend: '+24%', color: 'text-blue-500' },
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className={cn('text-xs mt-2', stat.color)}>{stat.trend} from last month</p>
          </motion.div>
        ))}
      </div>

      {/* Budget Progress */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Budget Progress</h2>
          <Badge variant="outline">Monthly</Badge>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Total Budget', spent: 127.45, budget: 200, color: 'bg-green-500' },
            { label: 'OpenAI', spent: 45.23, budget: 100, color: 'bg-blue-500' },
            { label: 'Anthropic', spent: 62.18, budget: 75, color: 'bg-purple-500' },
            { label: 'Google AI', spent: 20.04, budget: 25, color: 'bg-emerald-500' },
          ].map((budget, i) => {
            const percentage = getSpendingProgress(budget.spent, budget.budget);
            const threshold = 80;
            return (
              <div key={budget.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{budget.label}</span>
                  <span className={percentage > threshold ? 'text-yellow-600' : ''}>
                    ${budget.spent.toFixed(2)} / ${budget.budget}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className={cn('h-2 rounded-full', percentage > threshold ? 'bg-yellow-500' : budget.color)}
                  />
                </div>
                {percentage > threshold && (
                  <p className="text-xs text-yellow-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Approaching budget limit
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Tabs defaultValue="by-model" className="space-y-6">
        <TabsList>
          <TabsTrigger value="by-model">By Model</TabsTrigger>
          <TabsTrigger value="by-department">By Department</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="by-model">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Cost by Model</h2>
            <div className="space-y-3">
              {[
                { model: 'GPT-4o', requests: 12543, tokens: '2.1M', cost: 45.23 },
                { model: 'Claude 4 Sonnet', requests: 8234, tokens: '3.4M', cost: 62.18 },
                { model: 'Gemini 1.5 Pro', requests: 4521, tokens: '1.2M', cost: 15.04 },
                { model: 'GPT-4o Mini', requests: 28412, tokens: '5.2M', cost: 4.86 },
                { model: 'Claude 3.5 Haiku', requests: 1711, tokens: '487K', cost: 0.14 },
              ].map((row, i) => (
                <motion.div
                  key={row.model}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="grid grid-cols-4 gap-4 p-3 rounded-lg bg-muted/20"
                >
                  <div>
                    <p className="text-xs text-muted-foreground">Model</p>
                    <p className="font-medium">{row.model}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Requests</p>
                    <p className="font-medium">{row.requests.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tokens</p>
                    <p className="font-medium">{row.tokens}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Cost</p>
                    <p className="font-bold text-green-600">${row.cost.toFixed(2)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="by-department">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Cost by Department</h2>
            <div className="text-center py-12">
              <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">Department Analytics</p>
              <p className="text-sm text-muted-foreground">View AI spending by department and team</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="optimization">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Cost Optimization</h2>
            <div className="space-y-4">
              {[
                { title: 'Switch to GPT-4o Mini', savings: '$15.20/month', severity: 'high' },
                { title: 'Reduce max tokens for Haiku', savings: '$8.40/month', severity: 'medium' },
                { title: 'Enable prompt caching', savings: '$12.00/month', severity: 'high' },
              ].map((rec, i) => (
                <div key={i} className="p-4 rounded-lg bg-muted/20 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{rec.title}</p>
                    <p className="text-xs text-muted-foreground">Potential savings: {rec.savings}</p>
                  </div>
                  <Badge className={rec.severity === 'high' ? 'bg-green-500/20 text-green-600' : 'bg-yellow-500/20 text-yellow-600'}>
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {rec.savings}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

import { cn } from '@/lib/utils';
