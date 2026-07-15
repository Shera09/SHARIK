'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Users,
  UserPlus,
  FileText,
  Wallet,
  CheckSquare,
  ArrowUpRight,
  Calendar,
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
} from 'recharts';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const COLORS = ['hsl(221 83% 53%)', 'hsl(199 89% 48%)', 'hsl(142 71% 45%)', 'hsl(38 92% 50%)', 'hsl(280 65% 60%)'];

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [data, setData] = useState({
    customers: [] as any[],
    leads: [] as any[],
    invoices: [] as any[],
    payments: [] as any[],
    expenses: [] as any[],
    tasks: [] as any[],
    employees: [] as any[],
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [customers, leads, invoices, payments, expenses, tasks, employees] = await Promise.all([
        supabase.from('customers').select('*'),
        supabase.from('leads').select('*'),
        supabase.from('invoices').select('*'),
        supabase.from('payments').select('*'),
        supabase.from('expenses').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('employees').select('*'),
      ]);

      setData({
        customers: customers.data || [],
        leads: leads.data || [],
        invoices: invoices.data || [],
        payments: payments.data || [],
        expenses: expenses.data || [],
        tasks: tasks.data || [],
        employees: employees.data || [],
      });
      setLoading(false);
    }
    load();
  }, []);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const getMonthData = () => {
    const paymentsByMonth = months.slice(0, currentMonth + 1).map((m, i) => {
      const monthPayments = data.payments
        .filter((p) => {
          const d = new Date(p.payment_date);
          return d.getMonth() === i && d.getFullYear() === currentYear && p.status === 'completed';
        })
        .reduce((s, p) => s + Number(p.amount), 0);
      const monthExpenses = data.expenses
        .filter((e) => {
          const d = new Date(e.expense_date);
          return d.getMonth() === i && d.getFullYear() === currentYear;
        })
        .reduce((s, e) => s + Number(e.amount), 0);
      return { month: m, revenue: monthPayments, expenses: monthExpenses, profit: monthPayments - monthExpenses };
    });
    return paymentsByMonth;
  };

  const leadsBySource = () => {
    const sources: Record<string, number> = {};
    data.leads.forEach((l) => {
      sources[l.source] = (sources[l.source] || 0) + 1;
    });
    return Object.entries(sources).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '), value }));
  };

  const invoicesByStatus = () => {
    const status: Record<string, { count: number; total: number }> = {};
    data.invoices.forEach((inv) => {
      if (!status[inv.status]) status[inv.status] = { count: 0, total: 0 };
      status[inv.status].count++;
      status[inv.status].total += Number(inv.total);
    });
    return Object.entries(status).map(([status, { count, total }]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      total,
    }));
  };

  const tasksByStatus = () => {
    const statusCounts: Record<string, number> = { todo: 0, in_progress: 0, review: 0, done: 0 };
    data.tasks.forEach((t) => {
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1),
      count,
    }));
  };

  // Key metrics
  const totalRevenue = data.payments.filter((p) => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0);
  const totalExpenses = data.expenses.reduce((s, e) => s + Number(e.amount), 0);
  const grossProfit = totalRevenue - totalExpenses;
  const totalInvoiced = data.invoices.reduce((s, i) => s + Number(i.total), 0);
  const pendingPayments = data.invoices.filter((i) => i.status === 'sent' || i.status === 'partial' || i.status === 'overdue').reduce((s, i) => s + Number(i.total), 0);
  const wonLeads = data.leads.filter((l) => l.status === 'won').length;
  const conversionRate = data.leads.length > 0 ? Math.round((wonLeads / data.leads.length) * 100) : 0;
  const activeCustomers = data.customers.filter((c) => c.status === 'active').length;

  return (
    <AppShell>
      <PageHeader
        title="Reports"
        description="Comprehensive business analytics and insights"
        action={
          <Select value={dateRange} onValueChange={(v: 'month' | 'quarter' | 'year') => setDateRange(v)}>
            <SelectTrigger className="w-32 rounded-xl">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {[
          { label: 'Total Revenue', value: `₹${(totalRevenue / 1000).toFixed(0)}k`, icon: Wallet, up: true, change: '+18%' },
          { label: 'Total Expenses', value: `₹${(totalExpenses / 1000).toFixed(0)}k`, icon: TrendingDown, up: false, change: '+5%' },
          { label: 'Gross Profit', value: `₹${(grossProfit / 1000).toFixed(0)}k`, icon: TrendingUp, up: grossProfit > 0, change: grossProfit > 0 ? '+12%' : '-8%' },
          { label: 'Pending Payments', value: `₹${(pendingPayments / 1000).toFixed(0)}k`, icon: FileText, up: false, change: '3 invoices' },
          { label: 'Active Customers', value: activeCustomers.toString(), icon: Users, up: true, change: '+2 this month' },
          { label: 'Conversion Rate', value: `${conversionRate}%`, icon: UserPlus, up: conversionRate > 30, change: `${wonLeads} won` },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4 premium-shadow"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <m.icon className={cn('h-4 w-4', m.up ? 'text-success' : 'text-muted-foreground')} />
            </div>
            <p className="mt-2 font-display text-xl font-bold">{loading ? '—' : m.value}</p>
            <p className={cn('mt-1 text-xs', m.up ? 'text-success' : 'text-muted-foreground')}>{m.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue vs Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-card p-5 premium-shadow"
        >
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold">Revenue vs Expenses</h3>
            <p className="text-xs text-muted-foreground">Monthly comparison</p>
          </div>
          {loading ? (
            <div className="h-[260px] rounded-xl shimmer" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={getMonthData()}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0 72% 51%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(0 72% 51%)" stopOpacity={0} />
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
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(142 71% 45%)" strokeWidth={2} fill="url(#revGrad)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="hsl(0 72% 51%)" strokeWidth={2} fill="url(#expGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Lead Sources */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="glass-card p-5 premium-shadow"
        >
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold">Lead Sources</h3>
            <p className="text-xs text-muted-foreground">Distribution by channel</p>
          </div>
          {loading ? (
            <div className="h-[260px] rounded-xl shimmer" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={leadsBySource()} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {leadsBySource().map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Invoice Status */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="glass-card p-5 premium-shadow"
        >
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold">Invoice Status</h3>
            <p className="text-xs text-muted-foreground">By count and value</p>
          </div>
          {loading ? (
            <div className="h-[200px] rounded-xl shimmer" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={invoicesByStatus()}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="status" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" name="Count" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Task Completion */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="glass-card p-5 premium-shadow"
        >
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold">Task Progress</h3>
            <p className="text-xs text-muted-foreground">By status</p>
          </div>
          {loading ? (
            <div className="h-[200px] rounded-xl shimmer" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={tasksByStatus()} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="status" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" name="Tasks" fill="hsl(199 89% 48%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Summary Tables */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Customers */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="glass-card p-5 premium-shadow"
        >
          <h3 className="mb-4 font-display text-base font-semibold">Top Customers by Revenue</h3>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 rounded-lg shimmer" />)}</div>
          ) : (
            <div className="space-y-2">
              {data.customers.sort((a, b) => Number(b.total_revenue) - Number(a.total_revenue)).slice(0, 5).map((c, i) => (
                <div key={c.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/40">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    {c.company && <p className="text-xs text-muted-foreground truncate">{c.company}</p>}
                  </div>
                  <p className="text-sm font-semibold">₹{Number(c.total_revenue).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Employee Summary */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="glass-card p-5 premium-shadow"
        >
          <h3 className="mb-4 font-display text-base font-semibold">Employee Overview</h3>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 rounded-lg shimmer" />)}</div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Total Employees', value: data.employees.length, sub: `${data.employees.filter((e) => e.status === 'active').length} active` },
                { label: 'Total Payroll', value: `₹${data.employees.reduce((s, e) => s + Number(e.salary), 0).toLocaleString('en-IN')}`, sub: 'monthly' },
                { label: 'On Leave', value: data.employees.filter((e) => e.status === 'on_leave').length, sub: 'currently' },
                { label: 'Departments', value: new Set(data.employees.map((e) => e.department)).size, sub: 'unique' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border border-border/40 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                  <p className="text-lg font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AppShell>
  );
}

function cn(...args: any[]) {
  return args.filter(Boolean).join(' ');
}
