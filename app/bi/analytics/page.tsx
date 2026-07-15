'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  RefreshCcw,
  ChevronDown,
  Activity,
  DollarSign,
  Users,
  ShoppingCart,
  Target,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart as RLineChart, Line,
  PieChart as RPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ComposedChart, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsExplorerPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Mock data for charts
  const revenueData = [
    { date: 'Week 1', current: 820000, previous: 750000 },
    { date: 'Week 2', current: 960000, previous: 820000 },
    { date: 'Week 3', current: 1100000, previous: 950000 },
    { date: 'Week 4', current: 1280000, previous: 1100000 },
    { date: 'Week 5', current: 1450000, previous: 1250000 },
    { date: 'Week 6', current: 1620000, previous: 1400000 },
  ];

  const salesByCategory = [
    { category: 'Web Development', sales: 4500000, growth: 15 },
    { category: 'Cloud Services', sales: 3200000, growth: 22 },
    { category: 'Consulting', sales: 2100000, growth: 8 },
    { category: 'Support', sales: 1800000, growth: -3 },
    { category: 'Training', sales: 900000, growth: 12 },
    { category: 'Other', sales: 600000, growth: 5 },
  ];

  const customerTrend = [
    { month: 'Jan', new: 45, churned: 12, net: 33 },
    { month: 'Feb', new: 52, churned: 8, net: 44 },
    { month: 'Mar', new: 48, churned: 15, net: 33 },
    { month: 'Apr', new: 65, churned: 10, net: 55 },
    { month: 'May', new: 78, churned: 12, net: 66 },
    { month: 'Jun', new: 92, churned: 8, net: 84 },
  ];

  const performanceRadar = [
    { metric: 'Revenue', value: 85, fullMark: 100 },
    { metric: 'Customers', value: 78, fullMark: 100 },
    { metric: 'Satisfaction', value: 92, fullMark: 100 },
    { metric: 'Efficiency', value: 70, fullMark: 100 },
    { metric: 'Growth', value: 88, fullMark: 100 },
    { metric: 'Retention', value: 82, fullMark: 100 },
  ];

  const geoData = [
    { region: 'North', revenue: 4200000, customers: 580 },
    { region: 'South', revenue: 3800000, customers: 710 },
    { region: 'East', revenue: 2900000, customers: 420 },
    { region: 'West', revenue: 3500000, customers: 530 },
    { region: 'Central', revenue: 2100000, customers: 340 },
  ];

  const funnelData = [
    { stage: 'Leads', value: 10000, fill: '#3b82f6' },
    { stage: 'Qualified', value: 4500, fill: '#10b981' },
    { stage: 'Proposals', value: 2200, fill: '#f59e0b' },
    { stage: 'Negotiations', value: 1100, fill: '#8b5cf6' },
    { stage: 'Closed', value: 650, fill: '#ec4899' },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Analytics Explorer"
        description="Interactive data visualization and exploration"
        action={
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="12m">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total Revenue', value: '₹13.1M', change: '+18.2%', positive: true, icon: DollarSign },
              { label: 'Active Customers', value: '2,580', change: '+12.4%', positive: true, icon: Users },
              { label: 'Total Orders', value: '1,420', change: '+8.6%', positive: true, icon: ShoppingCart },
              { label: 'Conversion Rate', value: '24.8%', change: '-2.1%', positive: false, icon: Target },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                        <div className={cn(
                          "mt-1 text-sm",
                          stat.positive ? "text-green-600" : "text-red-600"
                        )}>
                          {stat.positive ? <TrendingUp className="inline h-3 w-3 mr-1" /> : <TrendingDown className="inline h-3 w-3 mr-1" />}
                          {stat.change}
                        </div>
                      </div>
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        stat.positive ? "bg-green-500/10" : "bg-red-500/10"
                      )}>
                        <stat.icon className={cn("h-5 w-5", stat.positive ? "text-green-600" : "text-red-600")} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Current vs previous period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" tickFormatter={(v) => `₹${v/1000}K`} />
                    <RechartsTooltip formatter={(value: any) => `₹${(value/1000).toFixed(0)}K`} />
                    <Legend />
                    <Area type="monotone" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Current Period" />
                    <Line type="monotone" dataKey="previous" stroke="#94a3b8" strokeDasharray="5 5" name="Previous Period" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sales by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Revenue breakdown by service type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={salesByCategory} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#6b7280" tickFormatter={(v) => `₹${v/100000}L`} />
                    <YAxis dataKey="category" type="category" stroke="#6b7280" width={100} />
                    <RechartsTooltip formatter={(value: any) => `₹${(value/100000).toFixed(1)}L`} />
                    <Bar dataKey="sales" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Radar</CardTitle>
                <CardDescription>Multi-dimensional performance view</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={performanceRadar}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="metric" stroke="#6b7280" />
                    <PolarRadiusAxis stroke="#6b7280" />
                    <Radar name="Performance" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Regional Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Regional Performance</CardTitle>
                <CardDescription>Revenue by geographic region</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={geoData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="region" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" tickFormatter={(v) => `₹${v/100000}L`} />
                    <RechartsTooltip formatter={(value: any) => `₹${(value/100000).toFixed(1)}L`} />
                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="mt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Detailed revenue analysis over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" tickFormatter={(v) => `₹${v/1000}K`} />
                    <RechartsTooltip formatter={(value: any) => `₹${(value/1000).toFixed(0)}K`} />
                    <Area type="monotone" dataKey="current" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRev)" name="Revenue" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Sources</CardTitle>
                <CardDescription>By service category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RPieChart>
                    <Pie
                      data={salesByCategory.map((s, i) => ({ name: s.category, value: s.sales, fill: COLORS[i % COLORS.length] }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {salesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: any) => `₹${(value/100000).toFixed(0)}L`} />
                  </RPieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {salesByCategory.slice(0, 4).map((cat, i) => (
                    <div key={cat.category} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                        <span>{cat.category}</span>
                      </div>
                      <span>₹{cat.sales/100000}L</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="mt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition Trend</CardTitle>
                <CardDescription>New, churned, and net customers</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={customerTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="new" fill="#10b981" name="New Customers" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="churned" fill="#ef4444" name="Churned" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="net" fill="#3b82f6" name="Net Growth" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales Funnel</CardTitle>
                <CardDescription>Lead to customer conversion</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={funnelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#6b7280" />
                    <YAxis dataKey="stage" type="category" stroke="#6b7280" width={100} />
                    <RechartsTooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Performance by Category</CardTitle>
              <CardDescription>Revenue and growth by service type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={salesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="category" stroke="#6b7280" />
                  <YAxis yAxisId="left" stroke="#6b7280" tickFormatter={(v) => `₹${v/100000}L`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" tickFormatter={(v) => `${v}%`} />
                  <RechartsTooltip formatter={(value: any, name: string) => name === 'sales' ? `₹${(value/100000).toFixed(1)}L` : `${value}%`} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="sales" fill="#3b82f6" name="Revenue" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="growth" stroke="#10b981" strokeWidth={2} name="Growth %" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Overall Performance</CardTitle>
                <CardDescription>Multi-dimensional metrics radar</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={performanceRadar}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="metric" stroke="#6b7280" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" />
                    <Radar name="Current" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                    <Radar name="Target" dataKey="fullMark" stroke="#94a3b8" fill="transparent" />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Breakdown</CardTitle>
                <CardDescription>Revenue and customers by region</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={geoData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="region" stroke="#6b7280" />
                    <YAxis yAxisId="left" stroke="#6b7280" tickFormatter={(v) => `₹${v/100000}L`} />
                    <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                    <RechartsTooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="customers" stroke="#10b981" strokeWidth={2} name="Customers" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
