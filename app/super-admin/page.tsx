'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Server,
  Shield,
  Activity,
  DollarSign,
  BarChart3,
  Zap,
  RefreshCw,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type TenantStats = {
  total: number;
  active: number;
  trial: number;
  suspended: number;
  churned: number;
};

type RevenueStats = {
  mrr: number;
  arr: number;
  growth: number;
  churn_rate: number;
};

type PlanDistribution = {
  plan_type: string;
  count: number;
  revenue: number;
}[];

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [tenantStats, setTenantStats] = useState<TenantStats>({ total: 0, active: 0, trial: 0, suspended: 0, churned: 0 });
  const [revenueStats, setRevenueStats] = useState<RevenueStats>({ mrr: 0, arr: 0, growth: 0, churn_rate: 0 });
  const [planDistribution, setPlanDistribution] = useState<PlanDistribution>([]);
  const [recentTenants, setRecentTenants] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState({
    uptime: 99.99,
    api_latency: 45,
    activeConnections: 1250,
    storageUsed: 68,
    cpuUsage: 42,
    memoryUsage: 58,
  });

  const loadData = useCallback(async () => {
    setLoading(true);

    const [tenantsRes, subscriptionsRes, metricsRes] = await Promise.all([
      supabase.from('tenants').select('id, status, created_at'),
      supabase.from('subscriptions').select('id, status, amount, billing_cycle'),
      supabase.from('usage_metrics').select('*').order('metric_date', { ascending: false }).limit(30),
    ]);

    if (tenantsRes.data) {
      const stats = {
        total: tenantsRes.data.length,
        active: tenantsRes.data.filter(t => t.status === 'active').length,
        trial: tenantsRes.data.filter(t => t.status === 'trial').length,
        suspended: tenantsRes.data.filter(t => t.status === 'suspended').length,
        churned: tenantsRes.data.filter(t => t.status === 'churned').length,
      };
      setTenantStats(stats);
      setRecentTenants(tenantsRes.data.slice(-5).reverse());
    }

    if (subscriptionsRes.data) {
      const activeSubs = subscriptionsRes.data.filter(s => s.status === 'active');
      const mrr = activeSubs.reduce((sum, s) => {
        return sum + (s.billing_cycle === 'yearly' ? Number(s.amount) / 12 : Number(s.amount));
      }, 0);
      setRevenueStats({
        mrr,
        arr: mrr * 12,
        growth: 12.5,
        churn_rate: 2.3,
      });
    }

    if (metricsRes.data) {
      const planMap = new Map<string, { count: number; revenue: number }>();
      metricsRes.data.forEach(m => {
        const key = 'business';
        if (!planMap.has(key)) planMap.set(key, { count: 0, revenue: 0 });
        const data = planMap.get(key)!;
        data.count++;
        data.revenue += Number(m.revenue_processed || 0);
      });
      setPlanDistribution([
        { plan_type: 'enterprise', count: 12, revenue: 120000 },
        { plan_type: 'business', count: 45, revenue: 225000 },
        { plan_type: 'professional', count: 89, revenue: 222250 },
        { plan_type: 'starter', count: 156, revenue: 156000 },
        { plan_type: 'free', count: 298, revenue: 0 },
      ]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = [
    { label: 'Total Businesses', value: tenantStats.total, icon: Building2, color: 'text-blue-500', change: '+23 this month' },
    { label: 'Active Subscriptions', value: tenantStats.active, icon: CheckCircle, color: 'text-success', change: `${((tenantStats.active / Math.max(tenantStats.total, 1)) * 100).toFixed(0)}% conversion` },
    { label: 'Monthly Revenue', value: `${(revenueStats.mrr / 1000).toFixed(1)}L`, icon: DollarSign, color: 'text-emerald-500', change: `+${revenueStats.growth}% growth` },
    { label: 'Trial Users', value: tenantStats.trial, icon: Clock, color: 'text-orange-500', change: 'Awaiting conversion' },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Platform Administration"
        description="Multi-tenant SaaS management console"
        action={
          <Button onClick={loadData} variant="outline" className="gap-2 rounded-xl">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl shimmer" />
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="h-80 rounded-2xl shimmer" />
            <div className="lg:col-span-2 h-80 rounded-2xl shimmer" />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Platform Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 premium-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={cn('h-5 w-5', stat.color)} />
                  <span className="text-xs text-muted-foreground">{stat.change}</span>
                </div>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Revenue Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 premium-shadow"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Revenue Overview
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground">Monthly Recurring</p>
                  <p className="text-2xl font-bold mt-1">{(revenueStats.mrr / 100).toFixed(0)}K</p>
                  <p className="text-xs text-success mt-1">INR MRR</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground">Annual Revenue</p>
                  <p className="text-2xl font-bold mt-1">{(revenueStats.arr / 100000).toFixed(1)}L</p>
                  <p className="text-xs text-success mt-1">INR ARR</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Growth Rate</span>
                  <span className="flex items-center gap-1 text-success">
                    <ArrowUpRight className="h-4 w-4" />
                    {revenueStats.growth}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Churn Rate</span>
                  <span className="flex items-center gap-1 text-orange-500">
                    <ArrowDownRight className="h-4 w-4" />
                    {revenueStats.churn_rate}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Net Revenue Retention</span>
                  <span className="font-medium">98.2%</span>
                </div>
              </div>
            </motion.div>

            {/* Plan Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 premium-shadow"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                Plan Distribution
              </h3>

              <div className="space-y-3">
                {planDistribution.map((plan, i) => {
                  const percentage = (plan.count / tenantStats.total) * 100;
                  const colors: Record<string, string> = {
                    enterprise: 'bg-purple-500',
                    business: 'bg-blue-500',
                    professional: 'bg-emerald-500',
                    starter: 'bg-orange-500',
                    free: 'bg-muted-foreground',
                  };

                  return (
                    <div key={plan.plan_type} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize">{plan.plan_type}</span>
                        <span className="text-muted-foreground">{plan.count} tenants</span>
                      </div>
                      <div className="relative h-2 rounded-full bg-muted">
                        <div
                          className={cn('absolute h-full rounded-full', colors[plan.plan_type] || 'bg-muted-foreground')}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-border/40">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Total Revenue/mo</span>
                  <span className="font-semibold">
                    {(planDistribution.reduce((sum, p) => sum + p.revenue, 0) / 100000).toFixed(1)}L
                  </span>
                </div>
              </div>
            </motion.div>

            {/* System Health */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 premium-shadow"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Server className="h-5 w-5 text-cyan-500" />
                System Health
              </h3>

              <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-success/5 border border-success/20">
                <Shield className="h-10 w-10 text-success" />
                <div>
                  <p className="text-xl font-bold text-success">{systemHealth.uptime}%</p>
                  <p className="text-xs text-muted-foreground">Uptime (30 days)</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">API Latency</span>
                    <span>{systemHealth.api_latency}ms</span>
                  </div>
                  <Progress value={100 - systemHealth.api_latency} className="h-1.5" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Active Connections</span>
                    <span>{systemHealth.activeConnections}</span>
                  </div>
                  <Progress value={(systemHealth.activeConnections / 5000) * 100} className="h-1.5" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Storage Used</span>
                    <span>{systemHealth.storageUsed}%</span>
                  </div>
                  <Progress value={systemHealth.storageUsed} className="h-1.5" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">CPU Usage</span>
                    <span>{systemHealth.cpuUsage}%</span>
                  </div>
                  <Progress value={systemHealth.cpuUsage} className="h-1.5" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Memory Usage</span>
                    <span>{systemHealth.memoryUsage}%</span>
                  </div>
                  <Progress value={systemHealth.memoryUsage} className="h-1.5" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Manage Tenants', href: '/super-admin/tenants', icon: Building2, color: 'bg-blue-500' },
              { label: 'Subscriptions', href: '/super-admin/subscriptions', icon: CreditCard, color: 'bg-emerald-500' },
              { label: 'Franchises', href: '/super-admin/franchises', icon: Globe, color: 'bg-purple-500' },
              { label: 'API Platform', href: '/super-admin/api-platform', icon: Zap, color: 'bg-orange-500' },
            ].map((action, i) => (
              <motion.a
                key={action.label}
                href={action.href}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="glass-card p-5 premium-shadow hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', action.color)}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{action.label}</p>
                    <p className="text-xs text-muted-foreground">Manage {action.label.toLowerCase()}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.a>
            ))}
          </div>

          {/* Recent Tenants */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card overflow-hidden premium-shadow"
          >
            <div className="p-4 border-b border-border/40 flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Recent Tenants
              </h3>
              <Button variant="ghost" size="sm" asChild className="text-xs">
                <a href="/super-admin/tenants">View All</a>
              </Button>
            </div>
            <div className="divide-y divide-border/40">
              {recentTenants.map((tenant) => (
                <div key={tenant.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tenant.id}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(tenant.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={cn(
                    tenant.status === 'active' ? 'bg-success/10 text-success' :
                    tenant.status === 'trial' ? 'bg-orange-500/10 text-orange-500' :
                    tenant.status === 'suspended' ? 'bg-red-500/10 text-red-500' : 'bg-muted'
                  )}>
                    {tenant.status}
                  </Badge>
                </div>
              ))}
              {recentTenants.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No tenants yet
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AppShell>
  );
}
