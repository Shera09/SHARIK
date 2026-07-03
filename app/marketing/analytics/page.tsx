'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  Mail,
  MessageSquare,
  Smartphone,
  Share2,
  DollarSign,
  Target,
  Calendar,
  Download,
  ArrowRight,
  Eye,
  MousePointer,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const monthlyTrends = [
  { month: 'Jan', leads: 1200, conversions: 85, revenue: 125000, spend: 42000 },
  { month: 'Feb', leads: 1450, conversions: 102, revenue: 148000, spend: 48000 },
  { month: 'Mar', leads: 1380, conversions: 95, revenue: 142000, spend: 45000 },
  { month: 'Apr', leads: 1650, conversions: 128, revenue: 185000, spend: 52000 },
  { month: 'May', leads: 1850, conversions: 145, revenue: 210000, spend: 58000 },
  { month: 'Jun', leads: 1920, conversions: 158, revenue: 225000, spend: 62000 },
];

const channelPerformance = [
  { name: 'Email', leads: 450, cost: 8500, conversions: 42, color: '#3b82f6' },
  { name: 'WhatsApp', leads: 380, cost: 12000, conversions: 58, color: '#22c55e' },
  { name: 'SMS', leads: 210, cost: 5200, conversions: 15, color: '#f59e0b' },
  { name: 'Social', leads: 520, cost: 28000, conversions: 35, color: '#8b5cf6' },
  { name: 'Ads', leads: 360, cost: 45000, conversions: 28, color: '#ec4899' },
];

const conversionFunnel = [
  { stage: 'Impressions', value: 2500000 },
  { stage: 'Clicks', value: 125000 },
  { stage: 'Visitors', value: 45000 },
  { stage: 'Leads', value: 1920 },
  { stage: 'Opportunities', value: 480 },
  { stage: 'Customers', value: 158 },
];

export default function MarketingAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  const stats = {
    totalLeads: monthlyTrends.reduce((sum, m) => sum + m.leads, 0),
    totalConversions: monthlyTrends.reduce((sum, m) => sum + m.conversions, 0),
    totalRevenue: monthlyTrends.reduce((sum, m) => sum + m.revenue, 0),
    totalSpend: monthlyTrends.reduce((sum, m) => sum + m.spend, 0),
    avgLeadCost: 42,
    overallROI: (monthlyTrends.reduce((sum, m) => sum + m.revenue, 0) / monthlyTrends.reduce((sum, m) => sum + m.spend, 0) * 100).toFixed(0),
  };

  return (
    <AppShell>
      <PageHeader
        title="Marketing Analytics"
        description="Comprehensive marketing performance analysis and insights"
        action={
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total Leads', value: stats.totalLeads.toLocaleString(), icon: Users, color: 'text-blue-600' },
          { label: 'Conversions', value: stats.totalConversions, icon: Target, color: 'text-green-600' },
          { label: 'Total Revenue', value: `₹${(stats.totalRevenue / 1000).toFixed(0)}k`, icon: DollarSign, color: 'text-emerald-600' },
          { label: 'Total Spend', value: `₹${(stats.totalSpend / 1000).toFixed(0)}k`, icon: BarChart3, color: 'text-orange-600' },
          { label: 'Cost/Lead', value: `₹${stats.avgLeadCost}`, icon: TrendingUp, color: 'text-purple-600' },
          { label: 'Marketing ROI', value: `${stats.overallROI}%`, icon: RefreshCw, color: 'text-cyan-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <stat.icon className={cn('h-5 w-5', stat.color)} />
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Spend Trend</CardTitle>
            <CardDescription>Marketing ROI over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} name="Revenue" />
                  <Area type="monotone" dataKey="spend" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} name="Spend" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leads & Conversions</CardTitle>
            <CardDescription>Lead generation and conversion trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} name="Leads" />
                  <Line type="monotone" dataKey="conversions" stroke="#22c55e" strokeWidth={2} name="Conversions" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channel Performance & Funnel */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Channel Performance</CardTitle>
            <CardDescription>Performance breakdown by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" className="text-xs" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="leads" fill="#3b82f6" name="Leads" />
                  <Bar dataKey="conversions" fill="#22c55e" name="Conversions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Stage-wise drop-off analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {conversionFunnel.map((stage, i) => {
              const percentage = i === 0 ? 100 : Math.round((stage.value / conversionFunnel[0].value) * 100);
              return (
                <div key={stage.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{stage.stage}</span>
                    <span className="font-medium">{stage.value.toLocaleString()}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Cost Analysis */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Cost Analysis by Channel</CardTitle>
            <CardDescription>Cost efficiency and ROI per channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Channel</th>
                    <th className="text-right p-3">Leads</th>
                    <th className="text-right p-3">Conversions</th>
                    <th className="text-right p-3">Spend</th>
                    <th className="text-right p-3">CPL</th>
                    <th className="text-right p-3">Conv. Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {channelPerformance.map((ch) => (
                    <tr key={ch.name} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: ch.color }} />
                          <span className="font-medium">{ch.name}</span>
                        </div>
                      </td>
                      <td className="text-right p-3">{ch.leads}</td>
                      <td className="text-right p-3 text-green-600">{ch.conversions}</td>
                      <td className="text-right p-3">₹{ch.cost.toLocaleString()}</td>
                      <td className="text-right p-3">₹{Math.round(ch.cost / ch.leads)}</td>
                      <td className="text-right p-3">{Math.round((ch.conversions / ch.leads) * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
