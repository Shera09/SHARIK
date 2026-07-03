'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Key,
  Settings,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Users,
  Globe,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: string;
  current_plan: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  subdomain: string;
  custom_domain: string;
  created_at: string;
  trial_ends_at: string;
  subscription_ends_at: string;
};

type Plan = {
  id: string;
  name: string;
  slug: string;
  plan_type: string;
  monthly_price: number;
};

const statusConfig: Record<string, { label: string; class: string }> = {
  trial: { label: 'Trial', class: 'bg-orange-500/10 text-orange-500' },
  active: { label: 'Active', class: 'bg-success/10 text-success' },
  suspended: { label: 'Suspended', class: 'bg-red-500/10 text-red-500' },
  cancelled: { label: 'Cancelled', class: 'bg-muted text-muted-foreground' },
  churned: { label: 'Churned', class: 'bg-red-600/10 text-red-600' },
};

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  city: '',
  country: 'India',
  subdomain: '',
  current_plan: 'free',
};

export default function TenantsManagementPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    const [tenantsRes, plansRes] = await Promise.all([
      supabase.from('tenants').select('*').order('created_at', { ascending: false }),
      supabase.from('subscription_plans').select('*').eq('is_active', true).order('sort_order'),
    ]);

    if (tenantsRes.data) setTenants(tenantsRes.data);
    if (plansRes.data) setPlans(plansRes.data);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = tenants.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch = t.name.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.subdomain?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPlan = planFilter === 'all' || t.current_plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const stats = {
    total: tenants.length,
    active: tenants.filter(t => t.status === 'active').length,
    trial: tenants.filter(t => t.status === 'trial').length,
    suspended: tenants.filter(t => t.status === 'suspended').length,
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);
    try {
      const slug = form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const subdomain = form.subdomain || slug;

      if (editing) {
        const { error } = await supabase
          .from('tenants')
          .update({
            name: form.name,
            email: form.email,
            phone: form.phone,
            city: form.city,
            country: form.country,
            current_plan: form.current_plan,
          })
          .eq('id', editing.id);
        if (error) throw error;
        toast.success('Tenant updated');
      } else {
        const { error } = await supabase.from('tenants').insert({
          name: form.name,
          slug,
          subdomain,
          email: form.email,
          phone: form.phone,
          city: form.city,
          country: form.country,
          current_plan: form.current_plan,
          status: 'trial',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        });
        if (error) throw error;
        toast.success('Tenant created');
      }

      setDialogOpen(false);
      setForm(emptyForm);
      setEditing(null);
      loadData();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    }
    setSaving(false);
  };

  const updateStatus = async (tenant: Tenant, status: string) => {
    const { error } = await supabase
      .from('tenants')
      .update({ status: status === 'suspended' ? 'suspended' : status, suspended_at: status === 'suspended' ? new Date().toISOString() : null })
      .eq('id', tenant.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Tenant ${status === 'suspended' ? 'suspended' : 'reactivated'}`);
      loadData();
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this tenant? This action cannot be undone.')) return;

    const { error } = await supabase.from('tenants').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Tenant deleted');
      loadData();
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Tenant Management"
        description="Manage all businesses on the platform"
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setForm(emptyForm);
              setDialogOpen(true);
            }}
            className="gap-2 rounded-xl"
          >
            <Plus className="h-4 w-4" />
            Add Tenant
          </Button>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Tenants', value: stats.total, icon: Building2, color: 'text-blue-500' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-success' },
          { label: 'On Trial', value: stats.trial, icon: Clock, color: 'text-orange-500' },
          { label: 'Suspended', value: stats.suspended, icon: XCircle, color: 'text-red-500' },
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
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tenants..."
            className="pl-9 rounded-xl"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-success" />
                Active
              </div>
            </SelectItem>
            <SelectItem value="trial">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-orange-500" />
                Trial
              </div>
            </SelectItem>
            <SelectItem value="suspended">
              <div className="flex items-center gap-2">
                <XCircle className="h-3 w-3 text-red-500" />
                Suspended
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-[140px] rounded-xl">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            {plans.map((plan) => (
              <SelectItem key={plan.id} value={plan.plan_type}>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3 w-3" />
                  {plan.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tenants Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No tenants found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden premium-shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tenant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Domain</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Created</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((tenant, i) => {
                    const status = statusConfig[tenant.status] || { label: tenant.status, class: 'bg-muted' };
                    const plan = plans.find(p => p.plan_type === tenant.current_plan);
                    const trialDaysLeft = tenant.trial_ends_at
                      ? Math.max(0, Math.ceil((new Date(tenant.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                      : 0;

                    return (
                      <motion.tr
                        key={tenant.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{tenant.name}</p>
                              <p className="text-xs text-muted-foreground">{tenant.email || 'No email'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={cn('text-[10px]', status.class)}>
                            {status.label}
                            {tenant.status === 'trial' && trialDaysLeft > 0 && ` (${trialDaysLeft}d)`}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {tenant.current_plan}
                            </Badge>
                            {plan && (
                              <span className="text-xs text-muted-foreground">
                                ₹{plan.monthly_price}/mo
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs">
                            {tenant.custom_domain ? (
                              <div className="flex items-center gap-1 text-primary">
                                <Globe className="h-3 w-3" />
                                {tenant.custom_domain}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Globe className="h-3 w-3" />
                                {tenant.subdomain}.webhoster.ai
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {tenant.city || 'N/A'}, {tenant.country || 'India'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-muted-foreground">
                            {new Date(tenant.created_at).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => window.open(`https://${tenant.subdomain}.webhoster.ai`, '_blank')}>
                                <Eye className="mr-2 h-3.5 w-3.5" />
                                View Tenant
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setEditing(tenant); setForm({ ...emptyForm, name: tenant.name, email: tenant.email || '', phone: tenant.phone || '', city: tenant.city || '', country: tenant.country || 'India', subdomain: tenant.subdomain || '', current_plan: tenant.current_plan || 'free' }); setDialogOpen(true); }}>
                                <Edit className="mr-2 h-3.5 w-3.5" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {tenant.status === 'suspended' ? (
                                <DropdownMenuItem onClick={() => updateStatus(tenant, 'active')}>
                                  <CheckCircle className="mr-2 h-3.5 w-3.5 text-success" />
                                  Reactivate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => updateStatus(tenant, 'suspended')}>
                                  <AlertTriangle className="mr-2 h-3.5 w-3.5 text-orange-500" />
                                  Suspend
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => remove(tenant.id)} className="text-destructive">
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Tenant' : 'Add New Tenant'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Business Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Acme Industries"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contact@acme.com"
                />
              </div>
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>City</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Mumbai"
                />
              </div>
              <div className="grid gap-2">
                <Label>Country</Label>
                <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="USA">USA</SelectItem>
                    <SelectItem value="UK">UK</SelectItem>
                    <SelectItem value="UAE">UAE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Subdomain</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={form.subdomain}
                  onChange={(e) => setForm({ ...form, subdomain: e.target.value })}
                  placeholder="acme"
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">.webhoster.ai</span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Plan</Label>
              <Select value={form.current_plan} onValueChange={(v) => setForm({ ...form, current_plan: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.plan_type}>
                      <div className="flex items-center gap-2">
                        <span>{plan.name}</span>
                        <span className="text-muted-foreground">- ₹{plan.monthly_price}/mo</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); setForm(emptyForm); setEditing(null); }}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving} className="gap-2 rounded-xl">
              {saving ? 'Saving...' : editing ? 'Update' : 'Create Tenant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
