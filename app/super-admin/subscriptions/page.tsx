'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Download,
  Search,
  Plus,
  RefreshCw,
  Percent,
  Tag,
  Users,
  IndianRupee,
  ArrowUpRight,
  FileText,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type Subscription = {
  id: string;
  tenant_id: string;
  tenant_name?: string;
  plan_name?: string;
  status: string;
  amount: number;
  total_amount: number;
  billing_cycle: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
};

type Plan = {
  id: string;
  name: string;
  slug: string;
  plan_type: string;
  monthly_price: number;
  yearly_price: number;
  max_users: number;
  max_customers: number;
  max_ai_tokens: number;
  is_popular: boolean;
};

type Invoice = {
  id: string;
  invoice_number: string;
  tenant_name?: string;
  total: number;
  status: string;
  due_at: string;
  paid_at: string;
  created_at: string;
};

const subStatusConfig: Record<string, { label: string; class: string; icon: typeof CheckCircle }> = {
  active: { label: 'Active', class: 'bg-success/10 text-success', icon: CheckCircle },
  trialing: { label: 'Trial', class: 'bg-orange-500/10 text-orange-500', icon: Clock },
  past_due: { label: 'Past Due', class: 'bg-red-500/10 text-red-500', icon: AlertTriangle },
  cancelled: { label: 'Cancelled', class: 'bg-muted text-muted-foreground', icon: XCircle },
  expired: { label: 'Expired', class: 'bg-red-600/10 text-red-600', icon: XCircle },
};

export default function SubscriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);

    const [subsRes, plansRes, invoicesRes] = await Promise.all([
      supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
      supabase.from('subscription_plans').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('platform_invoices').select('*').order('created_at', { ascending: false }).limit(20),
    ]);

    if (subsRes.data) setSubscriptions(subsRes.data);
    if (plansRes.data) setPlans(plansRes.data);
    if (invoicesRes.data) setInvoices(invoicesRes.data);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = {
    mrr: subscriptions.filter(s => s.status === 'active').reduce((sum, s) => {
      return sum + (s.billing_cycle === 'yearly' ? Number(s.amount) / 12 : Number(s.amount));
    }, 0),
    arr: subscriptions.filter(s => s.status === 'active').reduce((sum, s) => {
      return sum + (s.billing_cycle === 'yearly' ? Number(s.amount) : Number(s.amount) * 12);
    }, 0),
    active: subscriptions.filter(s => s.status === 'active').length,
    trialing: subscriptions.filter(s => s.status === 'trialing').length,
    pastDue: subscriptions.filter(s => s.status === 'past_due').length,
    churnRisk: subscriptions.filter(s => s.status === 'cancelled' || s.status === 'past_due').length,
  };

  const planDistribution = plans.map(plan => {
    const count = subscriptions.filter(s => s.plan_name === plan.name).length;
    const revenue = subscriptions
      .filter(s => s.plan_name === plan.name && s.status === 'active')
      .reduce((sum, s) => sum + Number(s.amount), 0);
    return { ...plan, count, revenue };
  });

  return (
    <AppShell>
      <PageHeader
        title="Subscriptions & Billing"
        description="Manage platform subscriptions, invoices, and revenue"
      />

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl shimmer" />
            ))}
          </div>
          <div className="h-96 rounded-2xl shimmer" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Revenue Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: 'MRR', value: `${(stats.mrr / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-success', prefix: '₹' },
              { label: 'ARR', value: `${(stats.arr / 100000).toFixed(1)}L`, icon: TrendingUp, color: 'text-blue-500', prefix: '₹' },
              { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-emerald-500' },
              { label: 'Trialing', value: stats.trialing, icon: Clock, color: 'text-orange-500' },
              { label: 'Past Due', value: stats.pastDue, icon: AlertTriangle, color: 'text-red-500' },
              { label: 'Churn Risk', value: stats.churnRisk, icon: XCircle, color: 'text-purple-500' },
            ].map((stat, i) => (
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
                <p className="text-2xl font-bold">
                  {stat.prefix}{stat.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="glass-card p-1 h-auto mb-4">
              <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
              <TabsTrigger value="subscriptions" className="rounded-lg">Subscriptions</TabsTrigger>
              <TabsTrigger value="invoices" className="rounded-lg">Invoices</TabsTrigger>
              <TabsTrigger value="plans" className="rounded-lg">Plans</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0 space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Plan Distribution */}
                <div className="glass-card p-6 premium-shadow">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" />
                    Revenue by Plan
                  </h3>
                  <div className="space-y-4">
                    {planDistribution.map((plan, i) => (
                      <div key={plan.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{plan.name}</span>
                            {plan.is_popular && (
                              <Badge className="bg-primary/10 text-primary text-[9px]">Popular</Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold">₹{(plan.revenue / 1000).toFixed(0)}K</span>
                            <span className="text-xs text-muted-foreground ml-2">({plan.count})</span>
                          </div>
                        </div>
                        <div className="relative h-2 rounded-full bg-muted">
                          <div
                            className="absolute h-full rounded-full bg-primary"
                            style={{ width: `${(plan.revenue / Math.max(stats.mrr, 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Invoices */}
                <div className="glass-card overflow-hidden premium-shadow">
                  <div className="p-4 border-b border-border/40 flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-500" />
                      Recent Invoices
                    </h3>
                  </div>
                  <div className="divide-y divide-border/40 max-h-[300px] overflow-y-auto">
                    {invoices.slice(0, 6).map((invoice) => (
                      <div key={invoice.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{invoice.invoice_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(invoice.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">₹{Number(invoice.total).toLocaleString()}</p>
                          <Badge variant="outline" className={cn('text-[10px]',
                            invoice.status === 'paid' ? 'text-success' :
                            invoice.status === 'overdue' ? 'text-red-500' : 'text-orange-500'
                          )}>
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {invoices.length === 0 && (
                      <div className="p-8 text-center text-sm text-muted-foreground">
                        No invoices yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Subscriptions Tab */}
            <TabsContent value="subscriptions" className="mt-0">
              <div className="glass-card overflow-hidden premium-shadow">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/40 bg-muted/20">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tenant</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Plan</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Billing</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Period End</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.slice(0, 15).map((sub, i) => {
                        const status = subStatusConfig[sub.status] || subStatusConfig.active;
                        return (
                          <motion.tr
                            key={sub.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className="border-b border-border/20 hover:bg-muted/20 cursor-pointer"
                            onClick={() => setSelectedSub(sub)}
                          >
                            <td className="px-4 py-3">
                              <span className="font-medium text-sm">{sub.tenant_name || sub.tenant_id}</span>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="text-xs capitalize">
                                {sub.plan_name || 'Standard'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-medium">₹{Number(sub.total_amount || sub.amount).toLocaleString()}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
                              {sub.billing_cycle}
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={cn('text-[10px]', status.class)}>
                                {status.label}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {new Date(sub.current_period_end).toLocaleDateString()}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Invoices Tab */}
            <TabsContent value="invoices" className="mt-0">
              <div className="glass-card overflow-hidden premium-shadow">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/40 bg-muted/20">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Invoice #</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tenant</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Due Date</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice, i) => (
                        <motion.tr
                          key={invoice.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className="border-b border-border/20 hover:bg-muted/20"
                        >
                          <td className="px-4 py-3 font-medium text-sm">{invoice.invoice_number}</td>
                          <td className="px-4 py-3 text-sm">{invoice.tenant_name || 'N/A'}</td>
                          <td className="px-4 py-3 font-medium">₹{Number(invoice.total).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <Badge className={cn('text-[10px]',
                              invoice.status === 'paid' ? 'bg-success/10 text-success' :
                              invoice.status === 'overdue' ? 'bg-red-500/10 text-red-500' :
                              'bg-orange-500/10 text-orange-500'
                            )}>
                              {invoice.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {invoice.due_at ? new Date(invoice.due_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button size="sm" variant="ghost" className="gap-1 text-xs">
                              <Download className="h-3 w-3" />
                              PDF
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Plans Tab */}
            <TabsContent value="plans" className="mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan, i) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      'glass-card p-6 premium-shadow',
                      plan.is_popular && 'ring-2 ring-primary'
                    )}
                  >
                    {plan.is_popular && (
                      <Badge className="bg-primary text-primary-foreground text-[10px] absolute -top-2 left-4">
                        Most Popular
                      </Badge>
                    )}
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{plan.plan_type}</p>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">₹{plan.monthly_price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Yearly: ₹{plan.yearly_price}/year (save {Math.round((1 - plan.yearly_price / (plan.monthly_price * 12)) * 100)}%)
                      </p>
                      <div className="space-y-2 pt-4 border-t border-border/40">
                        <div className="flex items-center gap-2 text-xs">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Up to {plan.max_users} users</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Up to {plan.max_customers} customers</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{(plan.max_ai_tokens / 1000)}K AI tokens</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Subscription Detail Dialog */}
      <Dialog open={!!selectedSub} onOpenChange={() => setSelectedSub(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
          </DialogHeader>
          {selectedSub && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="text-lg font-bold">₹{Number(selectedSub.total_amount || selectedSub.amount).toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground">Billing</p>
                  <p className="text-lg font-bold capitalize">{selectedSub.billing_cycle}</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1">Current Period</p>
                <p className="text-sm">
                  {new Date(selectedSub.current_period_start).toLocaleDateString()} - {new Date(selectedSub.current_period_end).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
