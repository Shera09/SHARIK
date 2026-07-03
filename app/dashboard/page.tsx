'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Wallet,
  TrendingUp,
  CheckSquare,
  Clock,
  Phone,
  Mail,
  FileText,
  MessageSquare,
  StickyNote,
  ArrowRight,
  Brain,
  Bot,
  Server,
  Shield,
  Globe,
  Smartphone,
  Activity,
  Layers,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
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
import { KpiCard } from '@/components/kpi-card';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const revenueData = [
  { month: 'Jan', revenue: 145000, expenses: 82000 },
  { month: 'Feb', revenue: 168000, expenses: 78000 },
  { month: 'Mar', revenue: 192000, expenses: 91000 },
  { month: 'Apr', revenue: 178000, expenses: 85000 },
  { month: 'May', revenue: 215000, expenses: 94000 },
  { month: 'Jun', revenue: 248000, expenses: 102000 },
];

const leadSourceData = [
  { name: 'Website', value: 35, color: 'hsl(221 83% 53%)' },
  { name: 'Referral', value: 25, color: 'hsl(199 89% 48%)' },
  { name: 'WhatsApp', value: 20, color: 'hsl(142 71% 45%)' },
  { name: 'Social', value: 12, color: 'hsl(38 92% 50%)' },
  { name: 'Direct', value: 8, color: 'hsl(280 65% 60%)' },
];

const activityIcons: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  invoice: FileText,
  payment: Wallet,
  whatsapp: MessageSquare,
  task: CheckSquare,
  note: StickyNote,
  lead: UserPlus,
  meeting: Users,
  other: StickyNote,
};

export default function DashboardPage() {
  const [stats, setStats] = useState({
    customers: 0,
    leads: 0,
    revenue: 0,
    tasks: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [customers, leads, payments, tasks, acts] = await Promise.all([
        supabase.from('customers').select('total_revenue'),
        supabase.from('leads').select('value, status'),
        supabase.from('payments').select('amount').eq('status', 'completed'),
        supabase.from('tasks').select('id').neq('status', 'done'),
        supabase
          .from('activities')
          .select('id, type, title, description, created_at')
          .order('created_at', { ascending: false })
          .limit(6),
      ]);

      const totalRevenue =
        payments.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      setStats({
        customers: customers.data?.length || 0,
        leads: leads.data?.filter((l) => l.status !== 'won' && l.status !== 'lost').length || 0,
        revenue: totalRevenue,
        tasks: tasks.data?.length || 0,
      });
      setActivities(acts.data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Your business at a glance — real-time overview"
        action={
          <Button className="gap-2 rounded-xl">
            <Sparkles />
            Ask AI
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Customers"
          value={loading ? '—' : stats.customers.toString()}
          change="+12% this month"
          trend="up"
          icon={Users}
          gradient="bg-gradient-to-br from-primary to-accent"
          delay={0}
        />
        <KpiCard
          title="Active Leads"
          value={loading ? '—' : stats.leads.toString()}
          change="+3 new this week"
          trend="up"
          icon={UserPlus}
          gradient="bg-gradient-to-br from-accent to-success"
          delay={0.05}
        />
        <KpiCard
          title="Total Revenue"
          value={loading ? '—' : `₹${stats.revenue.toLocaleString('en-IN')}`}
          change="+18% vs last month"
          trend="up"
          icon={Wallet}
          gradient="bg-gradient-to-br from-success to-warning"
          delay={0.1}
        />
        <KpiCard
          title="Pending Tasks"
          value={loading ? '—' : stats.tasks.toString()}
          change="2 due today"
          trend="neutral"
          icon={CheckSquare}
          gradient="bg-gradient-to-br from-warning to-destructive"
          delay={0.15}
        />
      </div>

      {/* Platform Quick Access */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-6">
        {[
          { label: 'AI Platform', icon: Brain, href: '/ai-platform', color: 'from-purple-500 to-pink-500', badge: '27 Agents' },
          { label: 'Finance', icon: Wallet, href: '/finance', color: 'from-green-500 to-emerald-500' },
          { label: 'HRMS', icon: Users, href: '/hr', color: 'from-cyan-500 to-blue-500' },
          { label: 'Marketing', icon: Zap, href: '/marketing', color: 'from-orange-500 to-amber-500' },
          { label: 'DevOps', icon: Server, href: '/devops', color: 'from-slate-500 to-gray-500' },
          { label: 'Security', icon: Shield, href: '/security', color: 'from-red-500 to-orange-500' },
          { label: 'Mobile', icon: Smartphone, href: '/mobile', color: 'from-rose-500 to-pink-500' },
          { label: 'Integrations', icon: Layers, href: '/integration', color: 'from-yellow-500 to-orange-500' },
        ].map((item, i) => (
          <Link key={item.href} href={item.href}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.03 }}
              className="glass-card p-3 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br mb-2', item.color)}>
                <item.icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm font-medium group-hover:text-primary transition-colors">{item.label}</p>
              {item.badge && (
                <Badge variant="outline" className="text-[9px] mt-1">{item.badge}</Badge>
              )}
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Revenue chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-card p-5 premium-shadow lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-semibold">Revenue Overview</h3>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3 text-success" />
              Growing
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(221 83% 53%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(221 83% 53%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38 92% 50%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(38 92% 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(221 83% 53%)"
                strokeWidth={2.5}
                fill="url(#revGrad)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="hsl(38 92% 50%)"
                strokeWidth={2}
                fill="url(#expGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Lead sources pie */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="glass-card p-5 premium-shadow"
        >
          <h3 className="font-display text-base font-semibold">Lead Sources</h3>
          <p className="text-xs text-muted-foreground">Where leads come from</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={leadSourceData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                {leadSourceData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {leadSourceData.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: s.color }}
                />
                <span className="text-muted-foreground">{s.name}</span>
                <span className="ml-auto font-medium">{s.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Intelligence Status */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="glass-card mt-6 p-5 premium-shadow"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <h3 className="font-display text-base font-semibold">AI Intelligence Status</h3>
          </div>
          <Link href="/ai-platform">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              AI Platform
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Agents', value: '23/27', icon: Bot, color: 'text-purple-500' },
            { label: 'Today Conversations', value: '15,678', icon: MessageSquare, color: 'text-blue-500' },
            { label: 'Avg Response', value: '1.24s', icon: Activity, color: 'text-green-500' },
            { label: 'Success Rate', value: '99.2%', icon: CheckSquare, color: 'text-emerald-500' },
          ].map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
              <stat.icon className={cn('h-5 w-5', stat.color)} />
              <div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="glass-card mt-6 p-5 premium-shadow"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold">Recent Activity</h3>
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            View all
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-9 w-9 shrink-0 rounded-full shimmer" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-1/3 rounded shimmer" />
                  <div className="h-3 w-1/2 rounded shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No recent activity
          </p>
        ) : (
          <div className="space-y-1">
            {activities.map((act, i) => {
              const Icon = activityIcons[act.type] || StickyNote;
              return (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/40"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight">{act.title}</p>
                    {act.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                        {act.description}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {new Date(act.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </AppShell>
  );
}

function Sparkles() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}
