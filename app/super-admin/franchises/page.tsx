'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Building2,
  MapPin,
  Phone,
  Mail,
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  TreePine,
  TrendingUp,
  BarChart3,
  MoreHorizontal,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type Branch = {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  branch_type: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  whatsapp_number: string;
  is_active: boolean;
  created_at: string;
};

type Tenant = {
  id: string;
  name: string;
};

const branchTypeConfig: Record<string, { label: string; color: string }> = {
  headquarters: { label: 'Headquarters', color: 'bg-purple-500/10 text-purple-500' },
  franchise: { label: 'Franchise', color: 'bg-blue-500/10 text-blue-500' },
  branch: { label: 'Branch', color: 'bg-emerald-500/10 text-emerald-500' },
  store: { label: 'Store', color: 'bg-orange-500/10 text-orange-500' },
  warehouse: { label: 'Warehouse', color: 'bg-cyan-500/10 text-cyan-500' },
};

const emptyForm = {
  name: '',
  code: '',
  branch_type: 'branch',
  city: '',
  state: '',
  phone: '',
  email: '',
  whatsapp_number: '',
};

export default function FranchisesPage() {
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    const [branchesRes, tenantsRes] = await Promise.all([
      supabase.from('branches').select('*').order('created_at', { ascending: false }),
      supabase.from('tenants').select('id, name'),
    ]);

    if (branchesRes.data) setBranches(branchesRes.data);
    if (tenantsRes.data) setTenants(tenantsRes.data);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = branches.filter((b) => {
    const q = search.toLowerCase();
    const matchesSearch = b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q);
    const matchesType = typeFilter === 'all' || b.branch_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: branches.length,
    headquarters: branches.filter(b => b.branch_type === 'headquarters').length,
    franchises: branches.filter(b => b.branch_type === 'franchise').length,
    branches: branches.filter(b => b.branch_type === 'branch').length,
    active: branches.filter(b => b.is_active).length,
  };

  const save = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast.error('Name and Code are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        code: form.code.toUpperCase(),
        branch_type: form.branch_type,
        city: form.city,
        state: form.state,
        phone: form.phone,
        email: form.email,
        whatsapp_number: form.whatsapp_number,
        is_active: true,
      };

      if (editing) {
        const { error } = await supabase.from('branches').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Branch updated');
      } else {
        const { error } = await supabase.from('branches').insert(payload);
        if (error) throw error;
        toast.success('Branch created');
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

  const toggleActive = async (branch: Branch) => {
    const { error } = await supabase
      .from('branches')
      .update({ is_active: !branch.is_active })
      .eq('id', branch.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(branch.is_active ? 'Branch deactivated' : 'Branch activated');
      loadData();
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this branch?')) return;
    const { error } = await supabase.from('branches').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Branch deleted');
      loadData();
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Franchise & Branch Management"
        description="Manage headquarters, franchises, and branch locations"
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
            Add Branch
          </Button>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Total Locations', value: stats.total, icon: Globe, color: 'text-blue-500' },
          { label: 'Headquarters', value: stats.headquarters, icon: Building2, color: 'text-purple-500' },
          { label: 'Franchises', value: stats.franchises, icon: TreePine, color: 'text-emerald-500' },
          { label: 'Branches', value: stats.branches, icon: MapPin, color: 'text-orange-500' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-success' },
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
            placeholder="Search branches..."
            className="pl-9 rounded-xl"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px] rounded-xl">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="headquarters">Headquarters</SelectItem>
            <SelectItem value="franchise">Franchise</SelectItem>
            <SelectItem value="branch">Branch</SelectItem>
            <SelectItem value="store">Store</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Branches Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No branches found</p>
          <p className="text-sm text-muted-foreground mt-1">Create your first branch location</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((branch, i) => {
              const type = branchTypeConfig[branch.branch_type] || branchTypeConfig.branch;

              return (
                <motion.div
                  key={branch.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass-card overflow-hidden premium-shadow group"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Badge className={cn('text-[10px]', type.color)}>
                        {type.label}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">{branch.code}</Badge>
                    </div>

                    <h3 className="font-semibold mb-2">{branch.name}</h3>

                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{branch.city || 'N/A'}, {branch.state || 'N/A'}</span>
                      </div>
                      {branch.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{branch.phone}</span>
                        </div>
                      )}
                      {branch.whatsapp_number && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-3.5 w-3.5 text-emerald-500" />
                          <span>{branch.whatsapp_number}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <Badge className={branch.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}>
                        {branch.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleActive(branch)}>
                            {branch.is_active ? (
                              <><XCircle className="mr-2 h-3.5 w-3.5" />Deactivate</>
                            ) : (
                              <><CheckCircle className="mr-2 h-3.5 w-3.5 text-success" />Activate</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setEditing(branch); setForm({ ...emptyForm, name: branch.name, code: branch.code, branch_type: branch.branch_type, city: branch.city || '', state: branch.state || '', phone: branch.phone || '', email: branch.email || '', whatsapp_number: branch.whatsapp_number || '' }); setDialogOpen(true); }}>
                            <Edit className="mr-2 h-3.5 w-3.5" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => remove(branch.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Branch Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Mumbai Branch"
                />
              </div>
              <div className="grid gap-2">
                <Label>Branch Code *</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="MUM"
                  maxLength={6}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Branch Type</Label>
              <Select value={form.branch_type} onValueChange={(v) => setForm({ ...form, branch_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="headquarters">Headquarters</SelectItem>
                  <SelectItem value="franchise">Franchise</SelectItem>
                  <SelectItem value="branch">Branch</SelectItem>
                  <SelectItem value="store">Store</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Mumbai" />
              </div>
              <div className="grid gap-2">
                <Label>State</Label>
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="Maharashtra" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
              </div>
              <div className="grid gap-2">
                <Label>WhatsApp Number</Label>
                <Input value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} placeholder="+91 98765 43210" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); setForm(emptyForm); setEditing(null); }}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="rounded-xl">
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
