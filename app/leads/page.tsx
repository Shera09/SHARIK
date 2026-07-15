'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  LayoutGrid,
  Table as TableIcon,
  Pencil,
  Trash2,
  MoreHorizontal,
  Calendar,
  TrendingUp,
  UserPlus,
  X,
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

type Lead = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  status: string;
  value: number;
  probability: number;
  assigned_to: string | null;
  notes: string | null;
  follow_up_date: string | null;
  created_at: string;
};

const stages = [
  { key: 'new', label: 'New', color: 'hsl(221 83% 53%)' },
  { key: 'contacted', label: 'Contacted', color: 'hsl(199 89% 48%)' },
  { key: 'qualified', label: 'Qualified', color: 'hsl(142 71% 45%)' },
  { key: 'proposal', label: 'Proposal', color: 'hsl(38 92% 50%)' },
  { key: 'won', label: 'Won', color: 'hsl(142 71% 40%)' },
  { key: 'lost', label: 'Lost', color: 'hsl(0 72% 51%)' },
];

const sourceLabels: Record<string, string> = {
  direct: 'Direct',
  referral: 'Referral',
  website: 'Website',
  social: 'Social',
  whatsapp: 'WhatsApp',
  cold_call: 'Cold Call',
  other: 'Other',
};

const emptyForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  source: 'direct',
  status: 'new',
  value: 0,
  probability: 0,
  assigned_to: '',
  notes: '',
  follow_up_date: '',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'board' | 'table'>('board');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) {
      setError(err.message);
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      (l.company || '').toLowerCase().includes(q) ||
      (l.email || '').toLowerCase().includes(q)
    );
  });

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (l: Lead) => {
    setEditing(l);
    setForm({
      name: l.name,
      company: l.company || '',
      email: l.email || '',
      phone: l.phone || '',
      source: l.source,
      status: l.status,
      value: l.value,
      probability: l.probability,
      assigned_to: l.assigned_to || '',
      notes: l.notes || '',
      follow_up_date: l.follow_up_date || '',
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        value: Number(form.value),
        probability: Number(form.probability),
        follow_up_date: form.follow_up_date || null,
      };
      if (editing) {
        const { error: err } = await supabase
          .from('leads')
          .update(payload)
          .eq('id', editing.id);
        if (err) throw err;
        toast.success('Lead updated');
      } else {
        const { error: err } = await supabase.from('leads').insert(payload);
        if (err) throw err;
        toast.success('Lead added');
      }
      setDialogOpen(false);
      loadLeads();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    }
    setSaving(false);
  };

  const moveStage = async (lead: Lead, newStatus: string) => {
    const updates: Partial<Lead> = { status: newStatus };
    if (newStatus === 'won') updates.probability = 100;
    if (newStatus === 'lost') updates.probability = 0;

    const { error: err } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', lead.id);
    if (err) {
      toast.error(err.message);
    } else {
      setLeads((prev) =>
        prev.map((l) => (l.id === lead.id ? { ...l, ...updates } as Lead : l))
      );
      toast.success(`Moved to ${stages.find((s) => s.key === newStatus)?.label}`);
    }
  };

  const remove = async (l: Lead) => {
    if (!confirm(`Delete lead ${l.name}?`)) return;
    const { error: err } = await supabase.from('leads').delete().eq('id', l.id);
    if (err) {
      toast.error(err.message);
    } else {
      toast.success('Lead deleted');
      loadLeads();
    }
  };

  const totalPipelineValue = filtered
    .filter((l) => l.status !== 'won' && l.status !== 'lost')
    .reduce((sum, l) => sum + Number(l.value), 0);

  const wonValue = filtered
    .filter((l) => l.status === 'won')
    .reduce((sum, l) => sum + Number(l.value), 0);

  return (
    <AppShell>
      <PageHeader
        title="Leads"
        description="Track and manage your sales pipeline"
        action={
          <Button onClick={openAdd} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        }
      />

      {/* Pipeline summary */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Pipeline Value</p>
          <p className="mt-1 font-display text-xl font-bold">
            ₹{totalPipelineValue.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Won Value</p>
          <p className="mt-1 font-display text-xl font-bold text-success">
            ₹{wonValue.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Total Leads</p>
          <p className="mt-1 font-display text-xl font-bold">{filtered.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="mt-1 font-display text-xl font-bold">
            {filtered.filter((l) => l.status !== 'won' && l.status !== 'lost').length}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="h-9 rounded-xl pl-9"
          />
        </div>
        <div className="flex rounded-xl border border-border bg-muted/30 p-1">
          <Button
            variant={view === 'board' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('board')}
            className="gap-1.5"
          >
            <LayoutGrid className="h-4 w-4" />
            Board
          </Button>
          <Button
            variant={view === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('table')}
            className="gap-1.5"
          >
            <TableIcon className="h-4 w-4" />
            Table
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="glass-card mb-4 p-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={loadLeads}>
            Retry
          </Button>
        </div>
      )}

      {/* Board View */}
      {view === 'board' && !error && (
        <div className="overflow-x-auto scrollbar-thin pb-4">
          {loading ? (
            <div className="grid grid-cols-6 gap-3 min-w-[1000px]">
              {stages.map((s) => (
                <div key={s.key} className="space-y-2">
                  <div className="h-6 w-20 rounded shimmer" />
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-24 rounded-xl shimmer" />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-3 min-w-[1000px]">
              {stages.map((stage) => {
                const stageLeads = filtered.filter((l) => l.status === stage.key);
                const stageValue = stageLeads.reduce(
                  (sum, l) => sum + Number(l.value),
                  0
                );
                return (
                  <div key={stage.key} className="flex flex-col">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: stage.color }}
                        />
                        <p className="text-xs font-semibold">{stage.label}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {stageLeads.length}
                      </span>
                    </div>
                    <p className="mb-2 text-[10px] text-muted-foreground">
                      ₹{stageValue.toLocaleString('en-IN')}
                    </p>
                    <div className="flex-1 space-y-2">
                      <AnimatePresence>
                        {stageLeads.map((l) => (
                          <motion.div
                            key={l.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            layout
                            className="group glass-card cursor-pointer p-3 transition-shadow hover:premium-shadow"
                          >
                            <div className="flex items-start justify-between">
                              <p className="text-sm font-medium leading-tight">{l.name}</p>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="opacity-0 group-hover:opacity-100">
                                    <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEdit(l)}>
                                    <Pencil className="mr-2 h-3.5 w-3.5" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => remove(l)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            {l.company && (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {l.company}
                              </p>
                            )}
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-xs font-semibold text-primary">
                                ₹{Number(l.value).toLocaleString('en-IN')}
                              </span>
                              <Badge variant="outline" className="text-[10px]">
                                {l.probability}%
                              </Badge>
                            </div>
                            {l.follow_up_date && (
                              <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(l.follow_up_date).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </p>
                            )}
                            {/* Quick stage mover */}
                            <div className="mt-2 flex flex-wrap gap-1">
                              {stages
                                .filter((s) => s.key !== l.status)
                                .slice(0, 3)
                                .map((s) => (
                                  <button
                                    key={s.key}
                                    onClick={() => moveStage(l, s.key)}
                                    className="rounded-md border border-border/60 px-1.5 py-0.5 text-[9px] text-muted-foreground transition-colors hover:bg-muted"
                                  >
                                    {s.label}
                                  </button>
                                ))}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {stageLeads.length === 0 && (
                        <div className="rounded-xl border border-dashed border-border/60 p-4 text-center">
                          <p className="text-[10px] text-muted-foreground">No leads</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {view === 'table' && !error && (
        <div className="glass-card overflow-hidden premium-shadow">
          {loading ? (
            <div className="space-y-0">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 border-b border-border/40 p-4">
                  <div className="h-10 w-10 rounded-full shimmer" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-1/4 rounded shimmer" />
                    <div className="h-3 w-1/3 rounded shimmer" />
                  </div>
                  <div className="h-6 w-16 rounded-full shimmer" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <UserPlus className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm font-medium">No leads found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {search ? 'Try adjusting your search' : 'Add your first lead'}
              </p>
              {!search && (
                <Button onClick={openAdd} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Add Lead
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Lead
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                      Source
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Value
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                      Follow-up
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l, i) => {
                    const stage = stages.find((s) => s.key === l.status);
                    return (
                      <motion.tr
                        key={l.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="group border-b border-border/40 transition-colors hover:bg-muted/30"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                              style={{
                                background: `${stage?.color}20`,
                                color: stage?.color,
                              }}
                            >
                              {l.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{l.name}</p>
                              {l.company && (
                                <p className="truncate text-xs text-muted-foreground">
                                  {l.company}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          <Badge variant="outline" className="text-xs">
                            {sourceLabels[l.source] || l.source}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Select
                            value={l.status}
                            onValueChange={(v) => moveStage(l, v)}
                          >
                            <SelectTrigger className="h-7 w-28 text-xs">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ background: stage?.color }}
                              />
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {stages.map((s) => (
                                <SelectItem key={s.key} value={s.key}>
                                  {s.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium">
                          ₹{Number(l.value).toLocaleString('en-IN')}
                        </td>
                        <td className="hidden px-4 py-3 lg:table-cell">
                          {l.follow_up_date ? (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(l.follow_up_date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/50">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(l)}>
                                <Pencil className="mr-2 h-3.5 w-3.5" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => remove(l)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-thin sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Lead' : 'Add Lead'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Lead name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Company</Label>
              <Input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Company name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Source</Label>
                <Select
                  value={form.source}
                  onValueChange={(v) => setForm({ ...form, source: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="cold_call">Cold Call</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((s) => (
                      <SelectItem key={s.key} value={s.key}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Value (₹)</Label>
                <Input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label>Probability (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.probability}
                  onChange={(e) =>
                    setForm({ ...form, probability: Number(e.target.value) })
                  }
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Assigned To</Label>
                <Input
                  value={form.assigned_to}
                  onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                  placeholder="Employee name"
                />
              </div>
              <div className="grid gap-2">
                <Label>Follow-up Date</Label>
                <Input
                  type="date"
                  value={form.follow_up_date}
                  onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update' : 'Add Lead'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
