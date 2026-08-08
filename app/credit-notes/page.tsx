'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  StickyNote,
  MoreHorizontal,
  Trash2,
  Eye,
  ArrowRightLeft,
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
import { cn as cx } from '@/lib/utils';

type CreditNote = {
  id: string;
  credit_note_number: string;
  invoice_id: string | null;
  customer_id: string | null;
  customer_name: string;
  amount: number;
  reason: string | null;
  status: string;
  created_at: string;
};

type Invoice = { id: string; invoice_number: string; customer_name: string; total: number; customer_id: string | null };

const statusConfig: Record<string, { label: string; class: string }> = {
  issued: { label: 'Issued', class: 'bg-warning/10 text-warning border-warning/20' },
  applied: { label: 'Applied', class: 'bg-success/10 text-success border-success/20' },
  cancelled: { label: 'Cancelled', class: 'bg-muted text-muted-foreground border-border' },
};

export default function CreditNotesPage() {
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewing, setViewing] = useState<CreditNote | null>(null);
  const [form, setForm] = useState({
    invoice_id: '',
    customer_name: '',
    amount: 0,
    reason: '',
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('credit_notes').select('*').is('deleted_at', null).order('created_at', { ascending: false });
    if (!error) setCreditNotes(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    supabase.from('invoices').select('id, invoice_number, customer_name, total, customer_id').eq('status', 'paid').is('deleted_at', null).then(({ data }) => {
      if (data) setInvoices(data);
    });
  }, [load]);

  const filtered = creditNotes.filter((cn) => {
    const q = search.toLowerCase();
    return cn.credit_note_number.toLowerCase().includes(q) || cn.customer_name.toLowerCase().includes(q);
  });

  const selectInvoice = (id: string) => {
    const inv = invoices.find((i) => i.id === id);
    if (inv) {
      setForm((f) => ({ ...f, invoice_id: inv.id, customer_name: inv.customer_name }));
    }
  };

  const save = async () => {
    if (!form.customer_name.trim()) { toast.error('Customer name is required'); return; }
    if (!form.amount || form.amount <= 0) { toast.error('Amount is required'); return; }
    setSaving(true);
    try {
      const credit_note_number = `CN-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
      const { error } = await supabase.from('credit_notes').insert({
        credit_note_number,
        invoice_id: form.invoice_id || null,
        customer_name: form.customer_name,
        amount: form.amount,
        reason: form.reason || null,
        status: 'issued',
      });
      if (error) throw error;
      toast.success('Credit note created');
      setDialogOpen(false);
      setForm({ invoice_id: '', customer_name: '', amount: 0, reason: '' });
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to create');
    }
    setSaving(false);
  };

  const updateStatus = async (cn: CreditNote, status: string) => {
    const { error } = await supabase.from('credit_notes').update({ status }).eq('id', cn.id);
    if (error) toast.error(error.message);
    else { toast.success('Status updated'); load(); }
  };

  const remove = async (cn: CreditNote) => {
    if (!confirm(`Delete ${cn.credit_note_number}?`)) return;
    const { error } = await supabase.from('credit_notes').update({ deleted_at: new Date().toISOString() }).eq('id', cn.id);
    if (error) toast.error(error.message);
    else { toast.success('Deleted'); load(); }
  };

  const totalIssued = creditNotes.filter((cn) => cn.status === 'issued').reduce((s, cn) => s + Number(cn.amount), 0);
  const totalApplied = creditNotes.filter((cn) => cn.status === 'applied').reduce((s, cn) => s + Number(cn.amount), 0);

  return (
    <AppShell>
      <PageHeader
        title="Credit Notes"
        description="Manage refunds and credit adjustments"
        action={
          <Button onClick={() => setDialogOpen(true)} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            Issue Credit Note
          </Button>
        }
      />

      {/* Summary */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Total Issued</p>
          <p className="mt-1 font-display text-xl font-bold text-warning">
            ₹{totalIssued.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Total Applied</p>
          <p className="mt-1 font-display text-xl font-bold text-success">
            ₹{totalApplied.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="mt-1 font-display text-xl font-bold">{creditNotes.filter((cn) => cn.status === 'issued').length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Total Notes</p>
          <p className="mt-1 font-display text-xl font-bold">{creditNotes.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search credit notes..." className="h-9 rounded-xl pl-9" />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden premium-shadow">
        {loading ? (
          <div className="space-y-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-border/40 p-4">
                <div className="h-10 w-10 rounded-full shimmer" />
                <div className="flex-1 space-y-1.5"><div className="h-3.5 w-1/4 rounded shimmer" /><div className="h-3 w-1/3 rounded shimmer" /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <StickyNote className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium">No credit notes</p>
            <Button onClick={() => setDialogOpen(true)} className="mt-4 gap-2"><Plus className="h-4 w-4" />Issue Credit Note</Button>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Credit Note #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((cn, i) => {
                    const sc = statusConfig[cn.status] || statusConfig.issued;
                    return (
                      <motion.tr
                        key={cn.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="group cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/30"
                        onClick={() => setViewing(cn)}
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium">{cn.credit_note_number}</p>
                          <p className="text-xs text-muted-foreground">{new Date(cn.created_at).toLocaleDateString('en-IN')}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm">{cn.customer_name}</p>
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          <p className="text-xs text-muted-foreground line-clamp-1">{cn.reason || '—'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={cx('border', sc.class)}>{sc.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-destructive">
                          -₹{Number(cn.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewing(cn)}><Eye className="mr-2 h-3.5 w-3.5" />View</DropdownMenuItem>
                              {cn.status === 'issued' && (
                                <DropdownMenuItem onClick={() => updateStatus(cn, 'applied')}><ArrowRightLeft className="mr-2 h-3.5 w-3.5" />Mark Applied</DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => remove(cn)} className="text-destructive"><Trash2 className="mr-2 h-3.5 w-3.5" />Delete</DropdownMenuItem>
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
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Issue Credit Note</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Link to Invoice (optional)</Label>
              <Select value={form.invoice_id} onValueChange={selectInvoice}>
                <SelectTrigger><SelectValue placeholder="Select invoice..." /></SelectTrigger>
                <SelectContent>
                  {invoices.map((inv) => (
                    <SelectItem key={inv.id} value={inv.id}>{inv.invoice_number} — {inv.customer_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Customer Name *</Label>
              <Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="Customer name" />
            </div>
            <div className="grid gap-2">
              <Label>Amount *</Label>
              <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} placeholder="0" />
            </div>
            <div className="grid gap-2">
              <Label>Reason</Label>
              <Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2} placeholder="Reason for credit..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Creating...' : 'Issue'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="sm:max-w-md">
          {viewing && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="font-display text-xl">{viewing.credit_note_number}</DialogTitle>
                  <Badge variant="outline" className={cx('border', (statusConfig[viewing.status] || statusConfig.issued).class)}>
                    {(statusConfig[viewing.status] || statusConfig.issued).label}
                  </Badge>
                </div>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="font-medium">{viewing.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold text-destructive">-₹{Number(viewing.amount).toLocaleString('en-IN')}</p>
                </div>
                {viewing.reason && (
                  <div>
                    <p className="text-xs text-muted-foreground">Reason</p>
                    <p className="text-sm">{viewing.reason}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Issued On</p>
                  <p className="text-sm">{new Date(viewing.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                {viewing.status === 'issued' && (
                  <Button onClick={() => { updateStatus(viewing, 'applied'); setViewing(null); }} className="gap-2 w-full">
                    <ArrowRightLeft className="h-4 w-4" />
                    Mark as Applied
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
