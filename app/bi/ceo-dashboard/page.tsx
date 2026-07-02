'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Target,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Eye,
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart as RPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function CEODashboardPage() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const [kpisRes, insightsRes, anomaliesRes] = await Promise.all([
        supabase.from('kpi_definitions').select('*').eq('is_active', true).limit(12),
        supabase.from('ai_business_insights').select('*').eq('status', 'active').order('detection_timestamp', { ascending: false }).limit(6),
        supabase.from('detected_anomalies').select('*').eq('status', 'new').order('detection_timestamp', { ascending: false }).limit(5),
      ]);

      setKpis(kpisRes.data || []);
      setInsights(insightsRes.data || []);
      setAnomalies(anomaliesRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Mock trend data for charts
  const revenueTrend = [
    { month: 'Jan', revenue: 4200000, target: 4000000 },
    { month: 'Feb', revenue: 4400000, target: 4200000 },
    { month: 'Mar', revenue: 4100000, target: 4400000 },
    { month: 'Apr', revenue: 4800000, target: 4600000 },
    { month: 'May', revenue: 5200000, target: 4800000 },
    { month: 'Jun', revenue: 5600000, target: 5000000 },
  ];

  const segmentData = [
    { name: 'Enterprise', value: 45, color: '#3b82f6' },
    { name: 'SMB', value: 30, color: '#10b981' },
    { name: 'Startup', value: 15, color: '#f59e0b' },
    { name: 'Individual', value: 10, color: '#8b5cf6' },
  ];

  const channelData = [
    { channel: 'Direct', customers: 1240, revenue: 4500000 },
    { channel: 'Referral', customers: 890, revenue: 2800000 },
    { channel: 'Organic', customers: 650, revenue: 1900000 },
    { channel: 'Paid Ads', customers: 420, revenue: 1200000 },
    { channel: 'Social', customers: 280, revenue: 800000 },
  ];

  const executiveMetrics = [
    { label: 'Total Revenue', value: '₹5.6Cr', change: '+12.5%', positive: true, icon: DollarSign },
    { label: 'Active Customers', value: '3,480', change: '+8.2%', positive: true, icon: Users },
    { label: 'New Orders', value: '892', change: '+15.3%', positive: true, icon: ShoppingCart },
    { label: 'Avg Deal Size', value: '₹1.2L', change: '-3.1%', positive: false, icon: Target },
  ];

  return (
    <AppShell>
      <PageHeader
        title="CEO Dashboard"
        description="Executive overview of business performance and strategic insights"
        action={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5">
              <Activity className="h-3 w-3 text-green-500" />
              Real-time
            </Badge>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Calendar className="h-4 w-4" />
              Last 30 Days
            </Button>
          </div>
        }
      />

      {/* Executive Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {executiveMetrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="mt-1 text-3xl font-bold">{metric.value}</p>
                    <div className={cn(
                      "mt-2 flex items-center gap-1 text-sm",
                      metric.positive ? "text-green-600" : "text-red-600"
                    )}>
                      {metric.positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      {metric.change} vs last month
                    </div>
                  </div>
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    metric.positive ? "bg-green-500/10" : "bg-red-500/10"
                  )}>
                    <metric.icon className={cn("h-6 w-6", metric.positive ? "text-green-600" : "text-red-600")} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Monthly revenue vs target performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" tickFormatter={(v) => `₹${v/100000}L`} />
                <RechartsTooltip formatter={(value: any) => `₹${(value/100000).toFixed(1)}L`} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRevenue)" />
                <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-500" />
              Customer Segments
            </CardTitle>
            <CardDescription>Distribution by customer type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RPieChart>
                <Pie
                  data={segmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => `${value}%`} />
              </RPieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {segmentData.map((segment) => (
                <div key={segment.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: segment.color }} />
                    <span>{segment.name}</span>
                  </div>
                  <span className="font-medium">{segment.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channel Performance & Insights */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Channel Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              Channel Performance
            </CardTitle>
            <CardDescription>Customer acquisition by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={channelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="channel" type="category" stroke="#6b7280" width={70} />
                <RechartsTooltip />
                <Bar dataKey="customers" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              AI Business Insights
            </CardTitle>
            <CardDescription>AI-detected patterns and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-lg shimmer" />
                ))}
              </div>
            ) : insights.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Lightbulb className="h-10 w-10 text-muted-foreground/50" />
                <p className="mt-2 text-muted-foreground">No insights available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight) => (
                  <motion.div
                    key={insight.insight_id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <div className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      insight.insight_type === 'opportunity' && "bg-green-500/10",
                      insight.insight_type === 'risk' && "bg-red-500/10",
                      insight.insight_type === 'anomaly' && "bg-orange-500/10",
                      insight.insight_type === 'trend' && "bg-blue-500/10",
                      insight.insight_type === 'recommendation' && "bg-purple-500/10",
                    )}>
                      <Lightbulb className={cn(
                        "h-5 w-5",
                        insight.insight_type === 'opportunity' && "text-green-600",
                        insight.insight_type === 'risk' && "text-red-600",
                        insight.insight_type === 'anomaly' && "text-orange-600",
                        insight.insight_type === 'trend' && "text-blue-600",
                        insight.insight_type === 'recommendation' && "text-purple-600",
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{insight.title}</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {insight.insight_type}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {insight.description}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Anomalies & KPIs */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Detected Anomalies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Anomalies Detected
            </CardTitle>
            <CardDescription>Requires attention</CardDescription>
          </CardHeader>
          <CardContent>
            {anomalies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">All metrics normal</p>
              </div>
            ) : (
              <div className="space-y-3">
                {anomalies.map((anomaly) => (
                  <div key={anomaly.anomaly_id} className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      anomaly.anomaly_severity === 'critical' && "bg-red-500/10",
                      anomaly.anomaly_severity === 'high' && "bg-orange-500/10",
                      anomaly.anomaly_severity === 'medium' && "bg-yellow-500/10",
                      anomaly.anomaly_severity === 'low' && "bg-green-500/10",
                    )}>
                      <AlertTriangle className={cn(
                        "h-4 w-4",
                        anomaly.anomaly_severity === 'critical' && "text-red-600",
                        anomaly.anomaly_severity === 'high' && "text-orange-600",
                        anomaly.anomaly_severity === 'medium' && "text-yellow-600",
                        anomaly.anomaly_severity === 'low' && "text-green-600",
                      )} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{anomaly.metric_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {anomaly.deviation_percent?.toFixed(1)}% deviation
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {anomaly.anomaly_severity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* KPI Quick View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Key Performance Indicators
            </CardTitle>
            <CardDescription>Tracked metrics vs targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {kpis.slice(0, 6).map((kpi) => {
                const progress = kpi.target_value ? Math.min(100, (Math.random() * 100 + 20)) : 75;
                return (
                  <div key={kpi.kpi_id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{kpi.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {kpi.category}
                      </Badge>
                    </div>
                    <div className="mt-3">
                      <Progress value={progress} className="h-2" />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{progress.toFixed(0)}% achieved</span>
                      <span>Target: {kpi.unit_of_measure === 'INR' ? '₹' : ''}{kpi.target_value?.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
