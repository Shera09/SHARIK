'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Users,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Database,
  Shield,
  Zap,
  Bot,
  Globe,
  Smartphone,
  Mail,
  MessageSquare,
  Bell,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  RefreshCw,
  Settings,
  LayoutDashboard,
  Eye,
  Cpu,
  Layers,
  FileText,
  Lock,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const platformModules = [
  { name: 'AI Platform', icon: Brain, href: '/ai-platform', status: 'healthy', uptime: 99.9, requests: 125000, color: 'from-purple-500 to-pink-500' },
  { name: 'CRM', icon: Users, href: '/customers', status: 'healthy', uptime: 99.8, requests: 89000, color: 'from-blue-500 to-cyan-500' },
  { name: 'Finance', icon: DollarSign, href: '/finance', status: 'healthy', uptime: 99.9, requests: 45000, color: 'from-green-500 to-emerald-500' },
  { name: 'Marketing', icon: Target, href: '/marketing', status: 'healthy', uptime: 99.7, requests: 67000, color: 'from-orange-500 to-amber-500' },
  { name: 'HRMS', icon: Users, href: '/hr', status: 'healthy', uptime: 99.8, requests: 23000, color: 'from-cyan-500 to-blue-500' },
  { name: 'DevOps', icon: Server, href: '/devops', status: 'healthy', uptime: 99.9, requests: 12000, color: 'from-slate-500 to-gray-500' },
  { name: 'Integrations', icon: Zap, href: '/integration', status: 'healthy', uptime: 99.6, requests: 156000, color: 'from-yellow-500 to-orange-500' },
  { name: 'Mobile', icon: Smartphone, href: '/mobile', status: 'healthy', uptime: 99.5, requests: 78000, color: 'from-rose-500 to-pink-500' },
  { name: 'Security', icon: Shield, href: '/security', status: 'healthy', uptime: 99.9, requests: 8900, color: 'from-red-500 to-orange-500' },
  { name: 'Collaboration', icon: MessageSquare, href: '/collab/chat', status: 'healthy', uptime: 99.7, requests: 45000, color: 'from-indigo-500 to-purple-500' },
];

const systemHealth = {
  overallScore: 99.2,
  activeServices: 47,
  totalServices: 48,
  criticalAlerts: 0,
  warnings: 2,
  resolved24h: 12,
};

const aiMetrics = {
  totalAgents: 27,
  activeAgents: 23,
  conversationsToday: 15678,
  tokensUsed: 4.2,
  avgLatency: 1240,
  successRate: 99.2,
  costToday: 127.45,
};

const businessMetrics = {
  revenue: { value: 2845000, change: 12.5, trend: 'up' },
  customers: { value: 1245, change: 8.2, trend: 'up' },
  leads: { value: 389, change: -3.1, trend: 'down' },
  tasks: { value: 156, change: 5.4, trend: 'up' },
  invoices: { value: 89, change: 15.2, trend: 'up' },
};

const recentEvents = [
  { time: '2 min ago', type: 'ai', message: 'Sales AI completed lead scoring for 50 leads', severity: 'info' },
  { time: '5 min ago', type: 'integration', message: 'Stripe webhook processed payment $4,567.89', severity: 'success' },
  { time: '8 min ago', type: 'security', message: 'MFA enabled for user john.doe@company.com', severity: 'info' },
  { time: '12 min ago', type: 'alert', message: 'High memory usage on production server (85%)', severity: 'warning' },
  { time: '15 min ago', type: 'ai', message: 'Document AI extracted 24 fields from Invoice-0892.pdf', severity: 'success' },
  { time: '20 min ago', type: 'marketing', message: 'Email campaign "Q3 Promo" sent to 5,234 recipients', severity: 'info' },
  { time: '25 min ago', type: 'hr', message: 'Leave request approved for Sarah Johnson', severity: 'success' },
  { time: '30 min ago', type: 'finance', message: 'Invoice INV-2024-0891 marked as paid', severity: 'success' },
];

const activeAgents = [
  { name: 'CEO AI', status: 'active', tasks: 45, success: 98.5, lastAction: 'Strategic analysis completed' },
  { name: 'Sales AI', status: 'active', tasks: 234, success: 99.1, lastAction: 'Lead scoring updated' },
  { name: 'Finance AI', status: 'active', tasks: 89, success: 97.8, lastAction: 'Invoice processed' },
  { name: 'Support AI', status: 'active', tasks: 567, success: 96.2, lastAction: 'Ticket resolved' },
  { name: 'Marketing AI', status: 'active', tasks: 123, success: 95.5, lastAction: 'Campaign optimized' },
  { name: 'HR AI', status: 'idle', tasks: 34, success: 98.9, lastAction: 'Resume screened' },
];

export default function CommandCenterPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setLastUpdate(new Date());
    }, 1500);
  };

  return (
    <AppShell>
      <PageHeader
        title="Unified Command Center"
        description="Master dashboard for all platform operations"
        action={
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="gap-2">
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Configure
            </Button>
          </div>
        }
      />

      {/* System Health Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'System Health', value: `${systemHealth.overallScore}%`, icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Active Services', value: `${systemHealth.activeServices}/${systemHealth.totalServices}`, icon: Server, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Critical Alerts', value: systemHealth.criticalAlerts, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Warnings', value: systemHealth.warnings, icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          { label: 'Resolved 24h', value: systemHealth.resolved24h, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Uptime', value: '99.8%', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={cn('p-1.5 rounded-lg', stat.bg)}>
                <stat.icon className={cn('h-4 w-4', stat.color)} />
              </div>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Business Metrics */}
      <div className="glass-card p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Business Metrics Today</h2>
          </div>
          <Badge variant="outline" className="text-green-600">
            <TrendingUp className="h-3 w-3 mr-1" />
            All Systems Operational
          </Badge>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Revenue', value: `₹${(businessMetrics.revenue.value / 100000).toFixed(1)}L`, change: businessMetrics.revenue.change, trend: businessMetrics.revenue.trend, icon: DollarSign },
            { label: 'Customers', value: businessMetrics.customers.value.toLocaleString(), change: businessMetrics.customers.change, trend: businessMetrics.customers.trend, icon: Users },
            { label: 'Active Leads', value: businessMetrics.leads.value.toLocaleString(), change: businessMetrics.leads.change, trend: businessMetrics.leads.trend, icon: Target },
            { label: 'Pending Tasks', value: businessMetrics.tasks.value.toLocaleString(), change: businessMetrics.tasks.change, trend: businessMetrics.tasks.trend, icon: CheckCircle },
            { label: 'Invoices', value: businessMetrics.invoices.value.toLocaleString(), change: businessMetrics.invoices.change, trend: businessMetrics.invoices.trend, icon: FileText },
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl bg-muted/30"
            >
              <div className="flex items-center justify-between mb-2">
                <metric.icon className="h-4 w-4 text-muted-foreground" />
                <span className={cn(
                  'text-xs font-medium flex items-center gap-1',
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                )}>
                  {metric.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </span>
              </div>
              <p className="text-xl font-bold">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        {/* Platform Modules */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Platform Modules</CardTitle>
                </div>
                <Badge variant="outline">{platformModules.filter(m => m.status === 'healthy').length}/{platformModules.length} Healthy</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {platformModules.map((module, i) => (
                  <Link key={module.name} href={module.href}>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br',
                        module.color
                      )}>
                        <module.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{module.name}</p>
                          <div className={cn(
                            'w-2 h-2 rounded-full shrink-0',
                            module.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'
                          )} />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>{module.uptime}% uptime</span>
                          <span>{(module.requests / 1000).toFixed(0)}K req</span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Events */}
        <div>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Event Stream</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[400px] overflow-y-auto">
                {recentEvents.map((event, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-start gap-3 p-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className={cn(
                      'w-2 h-2 rounded-full mt-1.5 shrink-0',
                      event.severity === 'success' && 'bg-green-500',
                      event.severity === 'warning' && 'bg-yellow-500',
                      event.severity === 'error' && 'bg-red-500',
                      event.severity === 'info' && 'bg-blue-500'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">{event.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{event.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Intelligence */}
      <div className="mt-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">AI Intelligence Layer</CardTitle>
              </div>
              <Badge className="bg-purple-500/10 text-purple-600">
                {aiMetrics.activeAgents}/{aiMetrics.totalAgents} Agents Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {[
                { label: 'Conversations Today', value: aiMetrics.conversationsToday.toLocaleString(), icon: MessageSquare, color: 'text-blue-500' },
                { label: 'Tokens Used', value: `${aiMetrics.tokensUsed}M`, icon: Database, color: 'text-green-500' },
                { label: 'Avg Latency', value: `${aiMetrics.avgLatency}ms`, icon: Clock, color: 'text-orange-500' },
                { label: 'Success Rate', value: `${aiMetrics.successRate}%`, icon: CheckCircle, color: 'text-purple-500' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/20"
                >
                  <stat.icon className={cn('h-5 w-5', stat.color)} />
                  <div>
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {activeAgents.map((agent, i) => (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    'p-3 rounded-lg border',
                    agent.status === 'active' ? 'border-green-500/30 bg-green-500/5' : 'border-muted bg-muted/20'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{agent.name}</p>
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      agent.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                    )} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{agent.tasks} tasks</span>
                    <span className="text-green-600">{agent.success}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <div className="mt-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Quick Access</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'CEO Dashboard', href: '/ceo-dashboard', icon: LayoutDashboard },
                { label: 'AI Brain Center', href: '/ai-platform', icon: Brain },
                { label: 'Analytics', href: '/analytics', icon: BarChart3 },
                { label: 'All Tasks', href: '/tasks', icon: CheckCircle },
                { label: 'Calendar', href: '/calendar', icon: Calendar },
                { label: 'Inbox', href: '/inbox', icon: Mail },
                { label: 'Customers', href: '/customers', icon: Users },
                { label: 'Finance', href: '/finance', icon: DollarSign },
                { label: 'Reports', href: '/reports', icon: FileText },
                { label: 'Settings', href: '/settings', icon: Settings },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
