'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Package,
  MoreHorizontal,
  Pencil,
  Trash2,
  IndianRupee,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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

type Service = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  gst_slab_id: string | null;
  gst_rate: number;
  hsn_code: string | null;
  unit: string;
  status: string;
  created_at: string;
};

type GstSlab = { id: string; name: string; rate: number };

const categories = ['Web Hosting', 'Domain', 'SSL', 'Cloud', 'Development', 'Design', 'Consulting', 'Maintenance', 'Marketing', 'Other'];

const emptyForm = {
  name: '',
  description: '',
  category: 'Other',
  price: 0,
  gst_rate: 18,
  hsn_code: '',
  unit: 'each',
  status: 'active',
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [gstSlabs, setGstSlabs] = useState<GstSlab[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('services').select('*').is('deleted_at', null).order('name');
    if (categoryFilter !== 'all') query = query.eq('category', categoryFilter);
    const { data, error } = await query;
    if (!error) setServices(data || []);
    setLoading(false);
  }, [categoryFilter]);

  useEffect(() => {
    load();
    supabase.from('gst_slabs').select('*').is('deleted_at', null).then(({ data }) => {
      if (data) setGstSlabs(data);
    });
  }, [load]);

  const filtered = services.filter((s) => {
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q) || (s.hsn_code || '').toLowerCase().includes(q);
  });

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({
      name: s.name,
      description: s.description || '',
      category: s.category || 'Other',
      price: Number(s.price),
      gst_rate: Number(s.gst_rate),
      hsn_code: s.hsn_code || '',
      unit: s.unit,
      status: s.status,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        gst_rate: Number(form.gst_rate),
      };
      if (editing) {
        const { error } = await supabase.from('services').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Service updated');
      } else {
        const { error } = await supabase.from('services').insert(payload);
        if (error) throw error;
        toast.success('Service created');
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    }
    setSaving(false);
  };

  const remove = async (s: Service) => {
    if (!confirm(`Delete ${s.name}?`)) return;
    const { error } = await supabase.from('services').update({ deleted_at: new Date().toISOString() }).eq('id', s.id);
    if (error) toast.error(error.message);
    else { toast.success('Deleted'); load(); }
  };

  const categoryCount = (cat: string) => services.filter((s) => s.category === cat).length;
  const statusConfig = (status: string) =>
    status === 'active'
      ? { label: 'Active', class: 'bg-success/10 text-success border-success/20' }
      : { label: 'Inactive', class: 'bg-muted text-muted-foreground border-border' };

  return (
    <AppShell>
      <PageHeader
        title="Services"
        description="Manage your service catalog and pricing"
        action={
          <Button onClick={openAdd} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        }
      />

      {/* Category pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter('all')}
          className={cn(
            'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
            categoryFilter === 'all'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted'
          )}
        >
          All ({services.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat === categoryFilter ? 'all' : cat)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              categoryFilter === cat
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted'
            )}
          >
            {cat} ({categoryCount(cat)})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..." className="h-9 rounded-xl pl-9" />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Package className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium">No services found</p>
          <Button onClick={openAdd} className="mt-4 gap-2"><Plus className="h-4 w-4" />Add Service</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map((s, i) => {
              const sc = statusConfig(s.status);
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  className="group glass-card cursor-pointer p-4 premium-shadow transition-shadow hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Badge className={cn('shrink-0 text-[10px]', sc.class)}>{sc.label}</Badge>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => openEdit(s)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive hover:text-destructive" onClick={() => remove(s)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="mt-3 font-display text-sm font-semibold leading-snug">{s.name}</h3>
                  {s.description && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{s.description}</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="flex items-center gap-1 text-lg font-bold">
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        {Number(s.price).toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-muted-foreground">per {s.unit}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">{s.category || 'Other'}</Badge>
                      <p className="mt-1 text-[10px] text-muted-foreground">GST: {s.gst_rate}%</p>
                    </div>
                  </div>
                  {s.hsn_code && (
                    <p className="mt-2 text-[10px] text-muted-foreground">HSN: {s.hsn_code}</p>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-thin sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Service' : 'Add Service'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Service name" />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Brief description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Price *</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="0" />
              </div>
              <div className="grid gap-2">
                <Label>Unit</Label>
                <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="each">Each</SelectItem>
                    <SelectItem value="hour">Hour</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>HSN/SAC Code</Label>
                <Input value={form.hsn_code} onChange={(e) => setForm({ ...form, hsn_code: e.target.value })} placeholder="9982" />
              </div>
              <div className="grid gap-2">
                <Label>GST Rate</Label>
                <Select value={String(form.gst_rate)} onValueChange={(v) => setForm({ ...form, gst_rate: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="12">12%</SelectItem>
                    <SelectItem value="18">18%</SelectItem>
                    <SelectItem value="28">28%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
