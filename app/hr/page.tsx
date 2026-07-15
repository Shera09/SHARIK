'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Briefcase,
  GraduationCap,
  Award,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileText,
  Download,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart as RechartsPie, Pie, Cell, Legend,
} from 'recharts';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const headcountData = [
  { month: 'Jan', current: 145, new: 12, left: 5 },
  { month: 'Feb', current: 152, new: 10, left: 3 },
  { month: 'Mar', current: 159, new: 8, left: 1 },
  { month: 'Apr', current: 166, new: 9, left: 2 },
  { month: 'May', current: 173, new: 11, left: 4 },
  { month: 'Jun', current: 180, new: 9, left: 2 },
];

const departmentData = [
  { name: 'Engineering', value: 65, color: 'hsl(221 83% 53%)' },
  { name: 'Sales', value: 35, color: 'hsl(199 89% 48%)' },
  { name: 'Marketing', value: 20, color: 'hsl(142 71% 45%)' },
  { name: 'HR', value: 15, color: 'hsl(38 92% 50%)' },
  { name: 'Finance', value: 12, color: 'hsl(280 65% 60%)' },
  { name: 'Operations', value: 33, color: 'hsl(0 84% 60%)' },
];

const attritionData = [
  { month: 'Jan', voluntary: 3, involuntary: 2 },
  { month: 'Feb', voluntary: 2, involuntary: 1 },
  { month: 'Mar', voluntary: 1, involuntary: 0 },
  { month: 'Apr', voluntary: 2, involuntary: 0 },
  { month: 'May', voluntary: 3, involuntary: 1 },
  { month: 'Jun', voluntary: 1, involuntary: 1 },
];

const recruitmentFunnel = [
  { stage: 'Applications', count: 245, color: 'bg-blue-500' },
  { stage: 'Screened', count: 120, color: 'bg-cyan-500' },
  { stage: 'Interviewed', count: 45, color: 'bg-purple-500' },
  { stage: 'Selected', count: 18, color: 'bg-green-500' },
  { stage: 'Hired', count: 12, color: 'bg-emerald-500' },
];

export default function HRDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 180,
    newHires: 9,
    exits: 2,
    openPositions: 24,
    attendanceToday: 94.5,
    leaveRequests: 8,
    payrollProcessed: true,
    avgTenure: 2.8,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Load HR stats
      const [empRes, reqRes] = await Promise.all([
        supabase.from('hr_employees').select('id', { count: 'exact', head: true }),
        supabase.from('hr_job_requisitions').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      ]);

      if (empRes.count) {
        setStats(prev => ({ ...prev, totalEmployees: empRes.count || 180 }));
      }
    } catch (error) {
      console.error('Error loading HR data:', error);
    } finally {
      setLoading(false);
    }
  }

  const kpiCards = [
    {
      label: 'Total Employees',
      value: stats.totalEmployees,
      change: '+9 this month',
      changeType: 'positive',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Open Positions',
      value: stats.openPositions,
      change: '12 active',
      changeType: 'neutral',
      icon: Briefcase,
      color: 'text-purple-600',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Attendance Today',
      value: `${stats.attendanceToday}%`,
      change: 'On track',
      changeType: 'positive',
      icon: Calendar,
      color: 'text-green-600',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Leave Requests',
      value: stats.leaveRequests,
      change: '5 pending',
      changeType: 'neutral',
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Payroll Status',
      value: stats.payrollProcessed ? 'Processed' : 'Pending',
      change: 'June 2024',
      changeType: stats.payrollProcessed ? 'positive' : 'negative',
      icon: DollarSign,
      color: stats.payrollProcessed ? 'text-green-600' : 'text-red-600',
      bg: stats.payrollProcessed ? 'bg-green-500/10' : 'bg-red-500/10',
    },
    {
      label: 'Avg. Tenure',
      value: `${stats.avgTenure} yrs`,
      change: '+0.3 vs last year',
      changeType: 'positive',
      icon: Target,
      color: 'text-cyan-600',
      bg: 'bg-cyan-500/10',
    },
  ];

  const pendingActions = [
    { title: 'Leave Approval - Rahul Sharma', type: 'leave', priority: 'high', time: '2h ago' },
    { title: 'Interview Schedule - Sr. Developer', type: 'interview', priority: 'medium', time: '3h ago' },
    { title: 'Expense Claim - Marketing Team', type: 'expense', priority: 'low', time: '5h ago' },
    { title: 'Offer Letter Approval - Candidate 124', type: 'offer', priority: 'high', time: '1d ago' },
    { title: 'Performance Review - Q2 Deadline', type: 'review', priority: 'medium', time: '2d ago' },
  ];

  const upcomingEvents = [
    { title: 'New Employee Orientation', date: 'Jul 5, 2024', type: 'onboarding', count: 4 },
    { title: 'Performance Review Cycle End', date: 'Jul 15, 2024', type: 'review', count: null },
    { title: 'Payroll Processing', date: 'Jul 25, 2024', type: 'payroll', count: null },
    { title: 'Training: Leadership Skills', date: 'Jul 28, 2024', type: 'training', count: 25 },
  ];

  return (
    <AppShell>
      <PageHeader
        title="HR Dashboard"
        description="Human Resource Management overview"
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 rounded-xl">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button className="gap-2 rounded-xl">
              <UserPlus className="h-4 w-4" />
              Quick Actions
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', kpi.bg)}>
              <kpi.icon className={cn('h-5 w-5', kpi.color)} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{kpi.label}</p>
            <p className="text-2xl font-bold">{kpi.value}</p>
            <p className={cn(
              'text-xs mt-1',
              kpi.changeType === 'positive' && 'text-green-600',
              kpi.changeType === 'negative' && 'text-red-600',
              kpi.changeType === 'neutral' && 'text-muted-foreground'
            )}>
              {kpi.change}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Headcount Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Headcount Trend</CardTitle>
            <CardDescription>Employee growth over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={headcountData}>
                  <defs>
                    <linearGradient id="colorHeadcount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(221 83% 53%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(221 83% 53%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Area type="monotone" dataKey="current" stroke="hsl(221 83% 53%)" fill="url(#colorHeadcount)" strokeWidth={2} />
                  <Bar dataKey="new" fill="hsl(142 71% 45%)" barSize={20} name="New Hires" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>Employees by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {departmentData.slice(0, 3).map(dept => (
                <div key={dept.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: dept.color }} />
                    {dept.name}
                  </span>
                  <span className="font-medium">{dept.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recruitment Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Recruitment Funnel</CardTitle>
            <CardDescription>Current hiring pipeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recruitmentFunnel.map((stage, i) => (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{stage.stage}</span>
                  <span className="text-sm text-muted-foreground">{stage.count}</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-muted">
                  <div
                    className={cn('h-full rounded-full transition-all', stage.color)}
                    style={{ width: `${(stage.count / recruitmentFunnel[0].count) * 100}%` }}
                  />
                </div>
              </motion.div>
            ))}
            <Button variant="outline" className="w-full mt-4 gap-2">
              View All Jobs <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Attrition Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Attrition Analysis</CardTitle>
            <CardDescription>Employee exits by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attritionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="voluntary" fill="hsl(142 71% 45%)" name="Voluntary" />
                  <Bar dataKey="involuntary" fill="hsl(0 84% 60%)" name="Involuntary" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-green-500/10">
                <p className="text-2xl font-bold text-green-600">3.2%</p>
                <p className="text-xs text-muted-foreground">Voluntary Rate</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-500/10">
                <p className="text-2xl font-bold text-red-600">1.1%</p>
                <p className="text-xs text-muted-foreground">Involuntary Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Pending Actions</CardTitle>
              <CardDescription>{pendingActions.length} items need attention</CardDescription>
            </div>
            <Bell className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingActions.map((action, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer"
              >
                <div className={cn(
                  'mt-0.5 h-2 w-2 rounded-full',
                  action.priority === 'high' && 'bg-red-500',
                  action.priority === 'medium' && 'bg-yellow-500',
                  action.priority === 'low' && 'bg-green-500'
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.time}</p>
                </div>
                <Badge variant="outline" className="text-xs capitalize">{action.type}</Badge>
              </motion.div>
            ))}
            <Button variant="outline" className="w-full mt-2">
              View All Actions
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming HR Events</CardTitle>
            <CardDescription>Important dates and activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
                <div className={cn(
                  'h-10 w-10 rounded-lg flex items-center justify-center',
                  event.type === 'onboarding' && 'bg-blue-500/10 text-blue-600',
                  event.type === 'review' && 'bg-purple-500/10 text-purple-600',
                  event.type === 'payroll' && 'bg-green-500/10 text-green-600',
                  event.type === 'training' && 'bg-cyan-500/10 text-cyan-600',
                )}>
                  {event.type === 'onboarding' && <UserPlus className="h-5 w-5" />}
                  {event.type === 'review' && <Target className="h-5 w-5" />}
                  {event.type === 'payroll' && <DollarSign className="h-5 w-5" />}
                  {event.type === 'training' && <GraduationCap className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.date}</p>
                </div>
                {event.count && (
                  <Badge variant="secondary">{event.count} participants</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common HR operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Add Employee', icon: UserPlus, color: 'text-blue-600 bg-blue-500/10' },
                { label: 'Post Job', icon: Briefcase, color: 'text-purple-600 bg-purple-500/10' },
                { label: 'Leave Approvals', icon: CheckCircle2, color: 'text-green-600 bg-green-500/10' },
                { label: 'Run Payroll', icon: DollarSign, color: 'text-cyan-600 bg-cyan-500/10' },
                { label: 'Performance Review', icon: Target, color: 'text-orange-600 bg-orange-500/10' },
                { label: 'Training', icon: GraduationCap, color: 'text-pink-600 bg-pink-500/10' },
                { label: 'Reports', icon: FileText, color: 'text-indigo-600 bg-indigo-500/10' },
                { label: 'Announcements', icon: Bell, color: 'text-amber-600 bg-amber-500/10' },
              ].map((action, i) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4 rounded-xl hover:scale-[1.02] transition-transform"
                >
                  <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', action.color)}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
