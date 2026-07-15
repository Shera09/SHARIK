'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, CreditCard, Pencil, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type GstSlab = {
  id: string;
  name: string;
  rate: number;
  description: string | null;
  created_at: string;
};

const emptyForm = { name: '', rate: 0, description: '' };

export default function GstSlabsPage() {
  const [slabs, setSlabs] = useState<GstSlab[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GstSlab | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('gst_slabs').select('*').order('rate');
    if (!error) setSlabs(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (s: GstSlab) => {
    setEditing(s);
    setForm({ name: s.name, rate: Number(s.rate), description: s.description || '' });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, rate: Number(form.rate) };
      if (editing) {
        const { error } = await supabase.from('gst_slabs').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('GST slab updated');
      } else {
        const { error } = await supabase.from('gst_slabs').insert(payload);
        if (error) throw error;
        toast.success('GST slab created');
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    }
    setSaving(false);
  };

  const remove = async (s: GstSlab) => {
    if (!confirm(`Delete ${s.name}?`)) return;
    const { error } = await supabase.from('gst_slabs').delete().eq('id', s.id);
    if (error) toast.error(error.message);
    else { toast.success('Deleted'); load(); }
  };

  const defaultSlabs = [
    { name: 'Nil', rate: 0, description: 'Exempt / Nil rated goods' },
    { name: '5%', rate: 5, description: 'Essential items' },
    { name: '12%', rate: 12, description: 'Standard goods' },
    { name: '18%', rate: 18, description: 'Standard goods and services' },
    { name: '28%', rate: 28, description: 'Luxury items' },
  ];

  const seedDefaults = async () => {
    const { error } = await supabase.from('gst_slabs').insert(defaultSlabs);
    if (error) toast.error(error.message);
    else { toast.success('Default GST slabs added'); load(); }
  };

  return (
    <AppShell>
      <PageHeader
        title="GST Slabs"
        description="Configure GST rate slabs for invoices"
        action={
          <div className="flex gap-2">
            {slabs.length === 0 && (
              <Button variant="outline" onClick={seedDefaults} className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Add Defaults
              </Button>
            )}
            <Button onClick={openAdd} className="gap-2 rounded-xl">
              <Plus className="h-4 w-4" />
              Add Slab
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl shimmer" />
          ))}
        </div>
      ) : slabs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <CreditCard className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium">No GST slabs configured</p>
          <p className="mt-1 text-xs text-muted-foreground">Add the standard GST rates or create custom ones</p>
          <Button onClick={seedDefaults} className="mt-4 gap-2"><Plus className="h-4 w-4" />Add Default Slabs</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slabs.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group glass-card p-4 premium-shadow transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold">{s.name}</p>
                  {s.description && <p className="mt-0.5 text-xs text-muted-foreground">{s.description}</p>}
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => openEdit(s)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive hover:text-destructive" onClick={() => remove(s)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <p className="font-display text-3xl font-bold">
                  {Number(s.rate) === 0 ? 'Nil' : `${s.rate}%`}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit GST Slab' : 'Add GST Slab'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., 18%" />
            </div>
            <div className="grid gap-2">
              <Label>Rate (%) *</Label>
              <Input type="number" step="0.01" value={form.rate} onChange={(e) => setForm({ ...form, rate: Number(e.target.value) })} placeholder="18" />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Standard goods and services" />
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
