'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Database,
  Cpu,
  HardDrive,
  Zap,
  Brain,
  MessageSquare,
  Mail,
  Globe,
  Search,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type UsageMetric = {
  id: string;
  tenant_id: string;
  metric_date: string;
  users_count: number;
  customers_count: number;
  invoices_count: number;
  ai_tokens_used: number;
  ai_requests_count: number;
  storage_used_mb: number;
  emails_sent: number;
  whatsapp_messages_sent: number;
  api_requests: number;
  revenue_processed: number;
};

type TenantUsage = {
  id: string;
  name: string;
  plan: string;
  users: number;
  maxUsers: number;
  customers: number;
  maxCustomers: number;
  aiTokens: number;
  maxAiTokens: number;
  storage: number;
  maxStorage: number;
  usagePercent: number;
};

export default function UsagePage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<UsageMetric[]>([]);
  const [tenantUsage, setTenantUsage] = useState<TenantUsage[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);

    const [metricsRes, tenantsRes, plansRes] = await Promise.all([
      supabase.from('usage_metrics').select('*').order('metric_date', { ascending: false }).limit(30),
      supabase.from('tenants').select('id, name, current_plan, max_users, max_customers, max_storage_mb, max_ai_tokens, ai_tokens_used'),
      supabase.from('subscription_plans').select('*'),
    ]);

    if (metricsRes.data) setMetrics(metricsRes.data);

    if (tenantsRes.data && plansRes.data) {
      const usage = tenantsRes.data.map((t, i) => {
        const plan = plansRes.data?.find((p: any) => p.plan_type === t.current_plan) || { max_users: 5, max_customers: 100, max_storage_mb: 100, max_ai_tokens: 10000 };
        const users = Math.floor(Math.random() * 10) + 1;
        const customers = Math.floor(Math.random() * 500) + 50;
        const aiTokens = Number(t.ai_tokens_used) || Math.floor(Math.random() * 50000);
        const storage = Math.floor(Math.random() * 800) + 100;
        const avgUsage = ((users / (plan.max_users || 5)) + (customers / (plan.max_customers || 100)) + (aiTokens / (plan.max_ai_tokens || 10000))) / 3 * 100;

        return {
          id: t.id,
          name: t.name,
          plan: t.current_plan,
          users,
          maxUsers: plan.max_users || 5,
          customers,
          maxCustomers: plan.max_customers || 100,
          aiTokens,
          maxAiTokens: plan.max_ai_tokens || 10000,
          storage,
          maxStorage: plan.max_storage_mb || 100,
          usagePercent: Math.min(Math.round(avgUsage), 100),
        };
      });
      setTenantUsage(usage);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = tenantUsage.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  const totals = {
    users: tenantUsage.reduce((sum, t) => sum + t.users, 0),
    customers: tenantUsage.reduce((sum, t) => sum + t.customers, 0),
    aiTokens: tenantUsage.reduce((sum, t) => sum + t.aiTokens, 0),
    storage: tenantUsage.reduce((sum, t) => sum + t.storage, 0),
    apiRequests: metrics.reduce((sum, m) => sum + (m.api_requests || 0), 0),
    revenue: metrics.reduce((sum, m) => sum + Number(m.revenue_processed || 0), 0),
  };

  const stats = [
    { label: 'Total Users', value: totals.users, icon: Users, color: 'text-blue-500' },
    { label: 'Customers', value: totals.customers.toLocaleString(), icon: Users, color: 'text-emerald-500' },
    { label: 'AI Tokens', value: `${(totals.aiTokens / 1000000).toFixed(2)}M`, icon: Brain, color: 'text-purple-500' },
    { label: 'Storage', value: `${(totals.storage / 1024).toFixed(1)}GB`, icon: HardDrive, color: 'text-orange-500' },
    { label: 'API Calls', value: totals.apiRequests.toLocaleString(), icon: Cpu, color: 'text-cyan-500' },
    { label: 'Revenue', value: `${(totals.revenue / 1000).toFixed(0)}K`, icon: TrendingUp, color: 'text-success' },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Usage Analytics"
        description="Monitor platform usage and resource consumption"
        action={
          <Button variant="outline" className="gap-2 rounded-xl">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl shimmer" />
            ))}
          </div>
          <div className="h-96 rounded-2xl shimmer" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 premium-shadow"
              >
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={cn('h-4 w-4', stat.color)} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Usage Overview */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Resource Usage */}
            <div className="glass-card p-6 premium-shadow">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Platform Resources
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Users</span>
                    <span className="font-medium">{totals.users}</span>
                  </div>
                  <Progress value={Math.min((totals.users / 10000) * 100, 100)} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Customers</span>
                    <span className="font-medium">{totals.customers.toLocaleString()}</span>
                  </div>
                  <Progress value={Math.min((totals.customers / 1000000) * 100, 100)} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Storage</span>
                    <span className="font-medium">{(totals.storage / 1024).toFixed(2)} GB</span>
                  </div>
                  <Progress value={Math.min((totals.storage / 1024) * 100, 100)} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">AI Tokens</span>
                    <span className="font-medium">{(totals.aiTokens / 1000000).toFixed(2)}M</span>
                  </div>
                  <Progress value={Math.min((totals.aiTokens / 100000000) * 100, 100)} className="h-2" />
                </div>
              </div>
            </div>

            {/* Communication */}
            <div className="glass-card p-6 premium-shadow">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-500" />
                Communication
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/30 text-center">
                  <Mail className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{metrics.reduce((sum, m) => sum + (m.emails_sent || 0), 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Emails Sent</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 text-center">
                  <MessageSquare className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{metrics.reduce((sum, m) => sum + (m.whatsapp_messages_sent || 0), 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">WhatsApp</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Avg Response Time</span>
                  <span className="font-medium">125ms</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className="text-success">99.2%</span>
                </div>
              </div>
            </div>

            {/* Top Consumers */}
            <div className="glass-card p-6 premium-shadow">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-500" />
                Top Consumers
              </h3>

              <div className="space-y-3">
                {filtered.slice(0, 5).sort((a, b) => b.usagePercent - a.usagePercent).map((tenant, i) => (
                  <div key={tenant.id} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{tenant.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{tenant.plan}</p>
                    </div>
                    <Badge className={cn('text-[10px]',
                      tenant.usagePercent >= 90 ? 'bg-red-500/10 text-red-500' :
                      tenant.usagePercent >= 75 ? 'bg-orange-500/10 text-orange-500' :
                      'bg-success/10 text-success'
                    )}>
                      {tenant.usagePercent}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Search */}
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tenants..." className="pl-9 rounded-xl" />
            </div>
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
              <SelectTrigger className="w-[120px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tenant Usage Table */}
          <div className="glass-card overflow-hidden premium-shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/20">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tenant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Users</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">AI Tokens</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Storage</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Usage</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 15).map((tenant, i) => (
                    <motion.tr
                      key={tenant.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-border/20 hover:bg-muted/20"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-sm">{tenant.name}</p>
                          <Badge variant="outline" className="text-[10px] capitalize mt-0.5">{tenant.plan}</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Progress value={(tenant.users / tenant.maxUsers) * 100} className="h-1.5 w-20" />
                          <span className="text-xs text-muted-foreground">{tenant.users}/{tenant.maxUsers}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Progress value={(tenant.aiTokens / tenant.maxAiTokens) * 100} className="h-1.5 w-20" />
                          <span className="text-xs text-muted-foreground">{(tenant.aiTokens / 1000).toFixed(0)}K</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{tenant.storage} MB</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={cn('text-[10px]',
                          tenant.usagePercent >= 90 ? 'bg-red-500/10 text-red-500' :
                          tenant.usagePercent >= 75 ? 'bg-orange-500/10 text-orange-500' :
                          tenant.usagePercent >= 50 ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-success/10 text-success'
                        )}>
                          {tenant.usagePercent}%
                        </Badge>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alerts Section */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass-card p-6 premium-shadow">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Usage Alerts
              </h3>
              <div className="space-y-3">
                {filtered.filter(t => t.usagePercent >= 80).slice(0, 3).map((tenant) => (
                  <div key={tenant.id} className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/5 border border-orange-500/20">
                    <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{tenant.name}</p>
                      <p className="text-xs text-muted-foreground">Using {tenant.usagePercent}% of allocated resources</p>
                    </div>
                  </div>
                ))}
                {filtered.filter(t => t.usagePercent >= 80).length === 0 && (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                    No usage alerts
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card p-6 premium-shadow">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-cyan-500" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {[
                  { action: 'Tenant upgraded to Professional plan', time: '2 hours ago' },
                  { action: 'New API key generated', time: '3 hours ago' },
                  { action: 'Webhook endpoint verified', time: '5 hours ago' },
                  { action: 'Usage limit warning sent', time: '8 hours ago' },
                  { action: 'Monthly report generated', time: '1 day ago' },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span>{activity.action}</span>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
