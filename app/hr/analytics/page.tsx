'use client';

import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Clock,
  Target,
  Award,
  Building2,
  Briefcase,
  GraduationCap,
  UserX,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const headcountTrend = [
  { month: 'Jan', actual: 145, budget: 140, attrition: 3.5 },
  { month: 'Feb', actual: 152, budget: 145, attrition: 3.2 },
  { month: 'Mar', actual: 159, budget: 150, attrition: 2.8 },
  { month: 'Apr', actual: 166, budget: 155, attrition: 3.1 },
  { month: 'May', actual: 173, budget: 160, attrition: 2.9 },
  { month: 'Jun', actual: 180, budget: 165, attrition: 2.5 },
];

const departmentHeadcount = [
  { department: 'Engineering', headcount: 65, color: 'hsl(221 83% 53%)' },
  { department: 'Sales', headcount: 35, color: 'hsl(199 89% 48%)' },
  { department: 'Marketing', headcount: 20, color: 'hsl(142 71% 45%)' },
  { department: 'HR', headcount: 15, color: 'hsl(38 92% 50%)' },
  { department: 'Finance', headcount: 12, color: 'hsl(280 65% 60%)' },
  { department: 'Operations', headcount: 33, color: 'hsl(0 84% 60%)' },
];

const recruitmentMetrics = [
  { month: 'Jan', timeToHire: 28, costPerHire: 45000, offers: 12 },
  { month: 'Feb', timeToHire: 25, costPerHire: 42000, offers: 10 },
  { month: 'Mar', timeToHire: 22, costPerHire: 40000, offers: 8 },
  { month: 'Apr', timeToHire: 24, costPerHire: 41000, offers: 9 },
  { month: 'May', timeToHire: 21, costPerHire: 38000, offers: 11 },
  { month: 'Jun', timeToHire: 20, costPerHire: 35000, offers: 9 },
];

const performanceScores = [
  { quarter: 'Q1 2023', avgScore: 3.6, belowTarget: 18 },
  { quarter: 'Q2 2023', avgScore: 3.7, belowTarget: 15 },
  { quarter: 'Q3 2023', avgScore: 3.8, belowTarget: 12 },
  { quarter: 'Q4 2023', avgScore: 3.9, belowTarget: 10 },
  { quarter: 'Q1 2024', avgScore: 4.0, belowTarget: 8 },
  { quarter: 'Q2 2024', avgScore: 4.1, belowTarget: 6 },
];

export default function HRAnalyticsPage() {
  const kpiCards = [
    { label: 'Headcount', value: 180, change: '+9.7%', changeType: 'positive', icon: Users, color: 'text-blue-600' },
    { label: 'Attrition Rate', value: '2.5%', change: '-0.4%', changeType: 'positive', icon: TrendingDown, color: 'text-green-600' },
    { label: 'Avg. Tenure', value: '2.8 yrs', change: '+0.3', changeType: 'positive', icon: Clock, color: 'text-purple-600' },
    { label: 'Training Hours', value: '1,250', change: '+15%', changeType: 'positive', icon: GraduationCap, color: 'text-cyan-600' },
    { label: 'Engagement Score', value: '78%', change: '+5%', changeType: 'positive', icon: Target, color: 'text-orange-600' },
    { label: 'HR Cost Ratio', value: '0.12', change: '-0.02', changeType: 'positive', icon: DollarSign, color: 'text-pink-600' },
  ];

  return (
    <AppShell>
      <PageHeader
        title="HR Analytics"
        description="Workforce insights and metrics"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <kpi.icon className={cn('h-5 w-5', kpi.color)} />
            <p className="mt-2 text-sm text-muted-foreground">{kpi.label}</p>
            <p className="text-xl font-bold">{kpi.value}</p>
            <p className={cn('text-xs mt-1', kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600')}>
              {kpi.change} vs last month
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
            <CardDescription>Actual vs budget with attrition rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={headcountTrend}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(221 83% 53%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(221 83% 53%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis yAxisId="left" className="text-xs" />
                  <YAxis yAxisId="right" orientation="right" className="text-xs" domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="actual" stroke="hsl(221 83% 53%)" fill="url(#colorActual)" strokeWidth={2} name="Actual" />
                  <Line yAxisId="left" type="monotone" dataKey="budget" stroke="hsl(142 71% 45%)" strokeDasharray="5 5" name="Budget" />
                  <Line yAxisId="right" type="monotone" dataKey="attrition" stroke="hsl(0 84% 60%)" strokeWidth={2} name="Attrition %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>Headcount by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={departmentHeadcount} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="headcount" nameKey="department">
                    {departmentHeadcount.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {departmentHeadcount.slice(0, 4).map(dept => (
                <div key={dept.department} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: dept.color }} />
                    {dept.department}
                  </span>
                  <span className="font-medium">{dept.headcount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recruitment Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Recruitment Efficiency</CardTitle>
            <CardDescription>Time to hire and cost per hire</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recruitmentMetrics}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis yAxisId="left" className="text-xs" />
                  <YAxis yAxisId="right" orientation="right" className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="timeToHire" fill="hsl(199 89% 48%)" name="Days to Hire" />
                  <Line yAxisId="right" type="monotone" dataKey="costPerHire" stroke="hsl(0 84% 60%)" strokeWidth={2} name="Cost (INR)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Average scores and below-target employees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceScores}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="quarter" className="text-xs" />
                  <YAxis yAxisId="left" domain={[3, 5]} className="text-xs" />
                  <YAxis yAxisId="right" orientation="right" className="text-xs" domain={[0, 20]} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="avgScore" stroke="hsl(142 71% 45%)" strokeWidth={2} name="Avg Score" />
                  <Line yAxisId="right" type="monotone" dataKey="belowTarget" stroke="hsl(0 84% 60%)" strokeWidth={2} name="Below Target" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Workforce Demographics', description: 'Age, gender, and tenure distribution', icon: Users, value: 'Click to explore' },
          { title: 'Compensation Analysis', description: 'Salary bands and equity metrics', icon: DollarSign, value: 'Click to explore' },
          { title: 'Training ROI', description: 'Investment vs outcomes', icon: GraduationCap, value: 'Click to explore' },
          { title: 'Retention Analysis', description: 'At-risk employees', icon: Target, value: 'Click to explore' },
        ].map((card, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <card.icon className={cn('h-8 w-8', 'text-blue-600')} />
              <p className="mt-3 font-medium">{card.title}</p>
              <p className="text-sm text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
