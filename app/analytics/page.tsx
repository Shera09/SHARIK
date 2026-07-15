'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Users,
  UserPlus,
  Wallet,
  FileText,
  CheckSquare,
  Target,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const taskStatusColors: Record<string, string> = {
  todo: 'hsl(215 20% 65%)',
  in_progress: 'hsl(199 89% 48%)',
  review: 'hsl(38 92% 50%)',
  done: 'hsl(142 71% 45%)',
};

const leadStageColors: Record<string, string> = {
  new: 'hsl(221 83% 53%)',
  contacted: 'hsl(199 89% 48%)',
  qualified: 'hsl(142 71% 45%)',
  proposal: 'hsl(38 92% 50%)',
  won: 'hsl(142 71% 40%)',
  lost: 'hsl(0 72% 51%)',
};

function StatCard({
  title,
  value,
  change,
  up,
  icon: Icon,
  delay,
}: {
  title: string;
  value: string;
  change: string;
  up: boolean;
  icon: typeof TrendingUp;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card p-5 premium-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="mt-1.5 font-display text-2xl font-bold">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        {up ? (
          <TrendingUp className="h-3.5 w-3.5 text-success" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5 text-destructive" />
        )}
        <span className={`text-xs font-medium ${up ? 'text-success' : 'text-destructive'}`}>
          {change}
        </span>
        <span className="text-xs text-muted-foreground">vs last month</span>
      </div>
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState({
    totalCustomers: 0,
    activeLeads: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    tasksDone: 0,
    conversionRate: 0,
    leadsPerStage: [] as { stage: string; count: number }[],
    tasksByStatus: [] as { status: string; count: number }[],
    revenueByMonth: [] as { month: string; revenue: number; expenses: number }[],
    customersByStatus: [] as { status: string; count: number }[],
    topCustomers: [] as { name: string; company: string; revenue: number }[],
    invoicesByStatus: [] as { status: string; count: number; total: number }[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [customers, leads, payments, invoices, tasks, expenses] = await Promise.all([
        supabase.from('customers').select('status, total_revenue, name, company'),
        supabase.from('leads').select('status, value'),
        supabase.from('payments').select('amount, status, created_at'),
        supabase.from('invoices').select('status, total, created_at'),
        supabase.from('tasks').select('status'),
        supabase.from('expenses').select('amount, expense_date'),
      ]);

      const custData = customers.data || [];
      const leadsData = leads.data || [];
      const paymentsData = payments.data || [];
      const invoicesData = invoices.data || [];
      const tasksData = tasks.data || [];
      const expData = expenses.data || [];

      const totalRevenue = paymentsData
        .filter((p) => p.status === 'completed')
        .reduce((s, p) => s + Number(p.amount), 0);

      const activeLeads = leadsData.filter(
        (l) => l.status !== 'won' && l.status !== 'lost'
      ).length;

      const wonLeads = leadsData.filter((l) => l.status === 'won').length;
      const conversionRate =
        leadsData.length > 0 ? Math.round((wonLeads / leadsData.length) * 100) : 0;

      const pendingInvoices = invoicesData.filter(
        (i) => i.status === 'sent' || i.status === 'overdue'
      ).reduce((s, i) => s + Number(i.total), 0);

      const tasksDone = tasksData.filter((t) => t.status === 'done').length;

      const stageKeys = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
      const leadsPerStage = stageKeys.map((s) => ({
        stage: s.charAt(0).toUpperCase() + s.slice(1),
        count: leadsData.filter((l) => l.status === s).length,
      }));

      const statusKeys = ['todo', 'in_progress', 'review', 'done'];
      const tasksByStatus = statusKeys.map((s) => ({
        status: s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1),
        count: tasksData.filter((t) => t.status === s).length,
      }));

      const now = new Date();
      const revenueByMonth = months.slice(0, now.getMonth() + 1).map((m, i) => {
        const monthRevenue = paymentsData
          .filter((p) => {
            const d = new Date(p.created_at);
            return (
              d.getMonth() === i &&
              d.getFullYear() === now.getFullYear() &&
              p.status === 'completed'
            );
          })
          .reduce((s, p) => s + Number(p.amount), 0);
        const monthExpenses = expData
          .filter((e) => {
            const d = new Date(e.expense_date);
            return d.getMonth() === i && d.getFullYear() === now.getFullYear();
          })
          .reduce((s, e) => s + Number(e.amount), 0);
        return { month: m, revenue: monthRevenue, expenses: monthExpenses };
      });

      const custStatusKeys = ['active', 'prospect', 'inactive', 'churned'];
      const customersByStatus = custStatusKeys.map((s) => ({
        status: s.charAt(0).toUpperCase() + s.slice(1),
        count: custData.filter((c) => c.status === s).length,
      }));

      const topCustomers = [...custData]
        .sort((a, b) => Number(b.total_revenue) - Number(a.total_revenue))
        .slice(0, 5)
        .map((c) => ({
          name: c.name,
          company: c.company || '',
          revenue: Number(c.total_revenue),
        }));

      const invStatusKeys = ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'];
      const invoicesByStatus = invStatusKeys.map((s) => ({
        status: s.charAt(0).toUpperCase() + s.slice(1),
        count: invoicesData.filter((i) => i.status === s).length,
        total: invoicesData.filter((i) => i.status === s).reduce((sum, i) => sum + Number(i.total), 0),
      })).filter((x) => x.count > 0);

      setData({
        totalCustomers: custData.length,
        activeLeads,
        totalRevenue,
        pendingInvoices,
        tasksDone,
        conversionRate,
        leadsPerStage,
        tasksByStatus,
        revenueByMonth,
        customersByStatus,
        topCustomers,
        invoicesByStatus,
      });
      setLoading(false);
    }
    load();
  }, []);

  const pieColors = [
    'hsl(221 83% 53%)',
    'hsl(199 89% 48%)',
    'hsl(142 71% 45%)',
    'hsl(38 92% 50%)',
    'hsl(0 72% 51%)',
    'hsl(280 65% 60%)',
  ];

  return (
    <AppShell>
      <PageHeader
        title="Analytics"
        description="Business performance insights and trends"
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Customers" value={loading ? '—' : data.totalCustomers.toString()} change="+12%" up={true} icon={Users} delay={0} />
        <StatCard title="Active Leads" value={loading ? '—' : data.activeLeads.toString()} change="+8%" up={true} icon={UserPlus} delay={0.05} />
        <StatCard title="Total Revenue" value={loading ? '—' : `₹${(data.totalRevenue / 1000).toFixed(0)}k`} change="+18%" up={true} icon={Wallet} delay={0.1} />
        <StatCard title="Pending Invoices" value={loading ? '—' : `₹${(data.pendingInvoices / 1000).toFixed(0)}k`} change="+3%" up={false} icon={FileText} delay={0.15} />
        <StatCard title="Tasks Done" value={loading ? '—' : data.tasksDone.toString()} change="+5" up={true} icon={CheckSquare} delay={0.2} />
        <StatCard title="Conversion Rate" value={loading ? '—' : `${data.conversionRate}%`} change="+2%" up={true} icon={Target} delay={0.25} />
      </div>

      {/* Revenue chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="glass-card mt-6 p-5 premium-shadow"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-semibold">Revenue vs Expenses</h3>
            <p className="text-xs text-muted-foreground">Month-by-month breakdown</p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <TrendingUp className="h-3 w-3 text-success" />
            Growing
          </Badge>
        </div>
        {loading ? (
          <div className="h-[280px] rounded-xl shimmer" />
        ) : data.revenueByMonth.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No revenue data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.revenueByMonth}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(221 83% 53%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(221 83% 53%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38 92% 50%)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(38 92% 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`}
              />
              <Legend />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(221 83% 53%)" strokeWidth={2.5} fill="url(#revGrad)" />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="hsl(38 92% 50%)" strokeWidth={2} fill="url(#expGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Mid row charts */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Lead pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="glass-card p-5 premium-shadow"
        >
          <h3 className="mb-1 font-display text-base font-semibold">Lead Pipeline</h3>
          <p className="mb-4 text-xs text-muted-foreground">Distribution across stages</p>
          {loading ? (
            <div className="h-[220px] rounded-xl shimmer" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.leadsPerStage} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="stage" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={70} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Leads" radius={[0, 6, 6, 0]}>
                  {data.leadsPerStage.map((entry, index) => (
                    <Cell key={index} fill={Object.values(leadStageColors)[index % 6]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Tasks by status */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="glass-card p-5 premium-shadow"
        >
          <h3 className="mb-1 font-display text-base font-semibold">Task Distribution</h3>
          <p className="mb-4 text-xs text-muted-foreground">Tasks by current status</p>
          {loading ? (
            <div className="h-[220px] rounded-xl shimmer" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.tasksByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {data.tasksByStatus.map((entry, index) => (
                    <Cell key={index} fill={Object.values(taskStatusColors)[index % 4]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top customers */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="glass-card p-5 premium-shadow"
        >
          <h3 className="mb-1 font-display text-base font-semibold">Top Customers</h3>
          <p className="mb-4 text-xs text-muted-foreground">By total revenue</p>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 rounded-xl shimmer" />
              ))}
            </div>
          ) : data.topCustomers.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No customer data yet</p>
          ) : (
            <div className="space-y-3">
              {data.topCustomers.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    {c.company && <p className="truncate text-xs text-muted-foreground">{c.company}</p>}
                  </div>
                  <span className="text-sm font-semibold text-success">
                    ₹{c.revenue.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Invoice status */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="glass-card p-5 premium-shadow"
        >
          <h3 className="mb-1 font-display text-base font-semibold">Invoice Summary</h3>
          <p className="mb-4 text-xs text-muted-foreground">Breakdown by status</p>
          {loading ? (
            <div className="h-[200px] rounded-xl shimmer" />
          ) : data.invoicesByStatus.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No invoice data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.invoicesByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="status" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Count" radius={[6, 6, 0, 0]}>
                  {data.invoicesByStatus.map((entry, index) => (
                    <Cell key={index} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </AppShell>
  );
}
