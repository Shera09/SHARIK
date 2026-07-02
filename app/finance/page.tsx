'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Wallet,
  PiggyBank,
  Building2,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
  Sparkles,
  Lightbulb,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const revenueData = [
  { month: 'Jan', revenue: 450000, expense: 320000, profit: 130000 },
  { month: 'Feb', revenue: 520000, expense: 350000, profit: 170000 },
  { month: 'Mar', revenue: 480000, expense: 380000, profit: 100000 },
  { month: 'Apr', revenue: 610000, expense: 420000, profit: 190000 },
  { month: 'May', revenue: 590000, expense: 390000, profit: 200000 },
  { month: 'Jun', revenue: 680000, expense: 450000, profit: 230000 },
];

const cashFlowData = [
  { month: 'Jan', inflow: 480000, outflow: 420000, net: 60000 },
  { month: 'Feb', inflow: 520000, outflow: 450000, net: 70000 },
  { month: 'Mar', inflow: 460000, outflow: 490000, net: -30000 },
  { month: 'Apr', inflow: 620000, outflow: 480000, net: 140000 },
  { month: 'May', inflow: 580000, outflow: 440000, net: 140000 },
  { month: 'Jun', inflow: 700000, outflow: 510000, net: 190000 },
];

const expenseBreakdown = [
  { name: 'Salaries', value: 45, color: '#3b82f6' },
  { name: 'Marketing', value: 20, color: '#10b981' },
  { name: 'Operations', value: 15, color: '#f59e0b' },
  { name: 'Rent', value: 12, color: '#ef4444' },
  { name: 'Others', value: 8, color: '#8b5cf6' },
];

export default function FinanceDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [bankRes, budgetRes, insightRes] = await Promise.all([
        supabase.from('bank_accounts').select('*').limit(5),
        supabase.from('budgets').select('*').limit(5),
        supabase.from('ai_financial_insights').select('*').limit(5),
      ]);

      if (bankRes.data) setBankAccounts(bankRes.data);
      if (budgetRes.data) setBudgets(budgetRes.data);
      if (insightRes.data) setInsights(insightRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: '₹33,30,000',
      change: '+12.5%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-500/10',
    },
    {
      title: 'Total Expenses',
      value: '₹24,10,000',
      change: '+8.2%',
      trend: 'up',
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-500/10',
    },
    {
      title: 'Net Profit',
      value: '₹9,20,000',
      change: '+23.1%',
      trend: 'up',
      icon: PiggyBank,
      color: 'text-blue-600',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Outstanding Receivables',
      value: '₹8,50,000',
      change: '-5.3%',
      trend: 'down',
      icon: CreditCard,
      color: 'text-orange-600',
      bg: 'bg-orange-500/10',
    },
  ];

  const bankBalance = bankAccounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);

  return (
    <AppShell>
      <PageHeader
        title="Finance Dashboard"
        description="Unified view of financial health, revenue, expenses, and cash flow"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-4">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={cn('rounded-lg p-2', kpi.bg)}>
                    <kpi.icon className={cn('h-5 w-5', kpi.color)} />
                  </div>
                  <Badge variant={kpi.trend === 'up' ? 'default' : 'secondary'} className="gap-1">
                    {kpi.trend === 'up' ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {kpi.change}
                  </Badge>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Second Row KPIs */}
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Bank Balance', value: `₹${(bankBalance || 1250000).toLocaleString()}`, icon: Building2, color: 'text-blue-600' },
          { label: 'GST Payable', value: '₹1,45,000', icon: Receipt, color: 'text-purple-600' },
          { label: 'Budget Utilized', value: '68%', icon: PieChart, color: 'text-orange-600' },
          { label: 'Financial Score', value: '85/100', icon: CheckCircle2, color: 'text-green-600' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 + 0.2 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3">
              <item.icon className={cn('h-5 w-5', item.color)} />
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-lg font-semibold">{item.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue vs Expense */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue vs Expenses
            </CardTitle>
            <CardDescription>Monthly comparison for current fiscal year</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `₹${v / 1000}k`} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '8px' }}
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, '']}
                />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cash Flow */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Cash Flow Trend
            </CardTitle>
            <CardDescription>Monthly cash inflow and outflow analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `₹${v / 1000}k`} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '8px' }}
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, '']}
                />
                <Area
                  type="monotone"
                  dataKey="inflow"
                  name="Inflow"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="outflow"
                  name="Outflow"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Second Row Charts */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {expenseBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="ml-auto font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Profit Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Profit Trend
            </CardTitle>
            <CardDescription>6-month profit analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `₹${v / 1000}k`} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '8px' }}
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Profit']}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Financial Insights
            </CardTitle>
            <CardDescription>Smart recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.length > 0 ? insights.slice(0, 3).map((insight) => (
              <div key={insight.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{insight.title}</p>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            )) : [
              { title: 'Reduce Marketing Spend', desc: 'Consider reducing marketing budget by 15% for better ROI' },
              { title: 'Optimize Inventory Costs', desc: 'Potential savings of ₹50,000 on procurement' },
              { title: 'Upcoming GST Payment', desc: 'GST payment of ₹1,45,000 due on 20th July' },
            ].map((insight, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{insight.title}</p>
                  <p className="text-xs text-muted-foreground">{insight.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Budget Status & Bank Accounts */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Budget Status */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Status</CardTitle>
            <CardDescription>Department-wise budget utilization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Marketing', allocated: 500000, used: 380000, color: 'bg-blue-500' },
              { name: 'Operations', allocated: 800000, used: 620000, color: 'bg-green-500' },
              { name: 'Sales', allocated: 400000, used: 290000, color: 'bg-orange-500' },
              { name: 'IT', allocated: 300000, used: 285000, color: 'bg-red-500' },
              { name: 'HR', allocated: 200000, used: 120000, color: 'bg-purple-500' },
            ].map((budget) => {
              const percent = Math.round((budget.used / budget.allocated) * 100);
              return (
                <div key={budget.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{budget.name}</span>
                    <span className="text-muted-foreground">
                      ₹{budget.used.toLocaleString()} / ₹{budget.allocated.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={percent} className="h-2" />
                    <span className={cn(
                      'text-sm font-medium w-12',
                      percent > 90 ? 'text-red-600' : percent > 70 ? 'text-orange-600' : 'text-green-600'
                    )}>
                      {percent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Bank Accounts */}
        <Card>
          <CardHeader className="flex-flex-row items-center justify-between">
            <div>
              <CardTitle>Bank Accounts</CardTitle>
              <CardDescription>Account balances overview</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {bankAccounts.length > 0 ? bankAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{account.account_name}</p>
                    <p className="text-sm text-muted-foreground">{account.bank_name} - {account.account_number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{Number(account.balance || 0).toLocaleString()}</p>
                  <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                    {account.status}
                  </Badge>
                </div>
              </div>
            )) : [
              { name: 'HDFC Current', bank: 'HDFC Bank', number: 'xxxx4521', balance: 850000 },
              { name: 'ICICI Savings', bank: 'ICICI Bank', number: 'xxxx8834', balance: 320000 },
              { name: 'SBI OD Account', bank: 'State Bank', number: 'xxxx2190', balance: 150000 },
            ].map((acc, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{acc.name}</p>
                    <p className="text-sm text-muted-foreground">{acc.bank} - {acc.number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{acc.balance.toLocaleString()}</p>
                  <Badge>Active</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Quick Actions */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Alerts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Financial Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { type: 'warning', title: 'IT Budget Near Limit', desc: '95% utilized with 2 months remaining', time: '2h ago' },
                { type: 'info', title: 'Invoice Payment Due', desc: 'INV-2024-089 due in 3 days', time: '5h ago' },
                { type: 'success', title: 'Payment Received', desc: '₹85,000 received from Customer XYZ', time: '1d ago' },
                { type: 'warning', title: 'Low Cash Alert', desc: 'Cash balance below ₹50,000 in ICICI account', time: '1d ago' },
              ].map((alert, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center',
                    alert.type === 'warning' ? 'bg-orange-500/10' :
                    alert.type === 'success' ? 'bg-green-500/10' : 'bg-blue-500/10'
                  )}>
                    {alert.type === 'warning' ? (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    ) : alert.type === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.desc}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { label: 'New Journal', icon: Receipt, color: 'bg-blue-500' },
              { label: 'Record Expense', icon: CreditCard, color: 'bg-red-500' },
              { label: 'Create Invoice', icon: DollarSign, color: 'bg-green-500' },
              { label: 'Transfer Funds', icon: ArrowRight, color: 'bg-purple-500' },
              { label: 'View Reports', icon: BarChart3, color: 'bg-orange-500' },
              { label: 'Tax Summary', icon: Receipt, color: 'bg-cyan-500' },
            ].map((action) => (
              <Button key={action.label} variant="outline" className="h-auto py-3 flex-col gap-1">
                <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', action.color)}>
                  <action.icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
