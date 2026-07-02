'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Wallet,
  IndianRupee,
  TrendingUp,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { KpiCard } from '@/components/kpi-card';
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

type Payment = {
  id: string;
  invoice_id: string | null;
  customer_id: string | null;
  amount: number;
  method: string;
  status: string;
  reference: string | null;
  payment_date: string;
  notes: string | null;
  created_at: string;
};

type Invoice = { id: string; invoice_number: string; customer_name: string; total: number; status: string };
type Customer = { id: string; name: string };

const methodLabels: Record<string, string> = {
  cash: 'Cash', upi: 'UPI', bank_transfer: 'Bank Transfer', cheque: 'Cheque', card: 'Card', razorpay: 'Razorpay', other: 'Other',
};

const statusConfig: Record<string, { label: string; class: string }> = {
  completed: { label: 'Completed', class: 'bg-success/10 text-success border-success/20' },
  pending: { label: 'Pending', class: 'bg-warning/10 text-warning border-warning/20' },
  failed: { label: 'Failed', class: 'bg-destructive/10 text-destructive border-destructive/20' },
  refunded: { label: 'Refunded', class: 'bg-muted text-muted-foreground border-border' },
};

const emptyForm = {
  invoice_id: '',
  customer_id: '',
  amount: 0,
  method: 'upi',
  status: 'completed',
  reference: '',
  payment_date: new Date().toISOString().slice(0, 10),
  notes: '',
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    let query = supabase.from('payments').select('*').order('payment_date', { ascending: false });
    if (methodFilter !== 'all') query = query.eq('method', methodFilter);
    const { data, error: err } = await query;
    if (err) setError(err.message);
    else setPayments(data || []);
    setLoading(false);
  }, [methodFilter]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  useEffect(() => {
    supabase.from('invoices').select('id, invoice_number, customer_name, total, status').order('created_at', { ascending: false }).then(({ data }) => { if (data) setInvoices(data); });
    supabase.from('customers').select('id, name').then(({ data }) => { if (data) setCustomers(data); });
  }, []);

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    return (p.reference || '').toLowerCase().includes(q) || String(p.amount).includes(q);
  });

  const totalReceived = payments.filter((p) => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0);
  const pendingAmount = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0);
  const completedCount = payments.filter((p) => p.status === 'completed').length;

  const openAdd = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };

  const selectInvoice = (id: string) => {
    const inv = invoices.find((i) => i.id === id);
    setForm((prev) => ({ ...prev, invoice_id: id, amount: inv ? Number(inv.total) : 0 }));
  };

  const save = async () => {
    if (form.amount <= 0) { toast.error('Amount must be greater than 0'); return; }
    setSaving(true);
    try {
      const payload = {
        invoice_id: form.invoice_id || null,
        customer_id: form.customer_id || null,
        amount: Number(form.amount),
        method: form.method,
        status: form.status,
        reference: form.reference || null,
        payment_date: form.payment_date,
        notes: form.notes || null,
      };
      if (editing) {
        const { error: err } = await supabase.from('payments').update(payload).eq('id', editing.id);
        if (err) throw err;
        toast.success('Payment updated');
      } else {
        const { error: err } = await supabase.from('payments').insert(payload);
        if (err) throw err;
        if (form.invoice_id) {
          const inv = invoices.find((i) => i.id === form.invoice_id);
          if (inv && Number(form.amount) >= Number(inv.total)) {
            await supabase.from('invoices').update({ status: 'paid' }).eq('id', form.invoice_id);
          } else if (inv) {
            await supabase.from('invoices').update({ status: 'partial' }).eq('id', form.invoice_id);
          }
        }
        toast.success('Payment recorded');
      }
      setDialogOpen(false);
      loadPayments();
    } catch (e: any) { toast.error(e.message || 'Failed to save'); }
    setSaving(false);
  };

  const remove = async (p: Payment) => {
    if (!confirm('Delete this payment record?')) return;
    const { error: err } = await supabase.from('payments').delete().eq('id', p.id);
    if (err) toast.error(err.message);
    else { toast.success('Payment deleted'); loadPayments(); }
  };

  return (
    <AppShell>
      <PageHeader
        title="Payments"
        description="Track payments and revenue"
        action={<Button onClick={openAdd} className="gap-2 rounded-xl"><Plus className="h-4 w-4" />Record Payment</Button>}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Total Received" value={`₹${totalReceived.toLocaleString('en-IN')}`} icon={IndianRupee} gradient="bg-gradient-to-br from-success to-accent" delay={0} />
        <KpiCard title="Pending" value={`₹${pendingAmount.toLocaleString('en-IN')}`} icon={Clock} gradient="bg-gradient-to-br from-warning to-destructive" delay={0.05} />
        <KpiCard title="Completed" value={completedCount.toString()} icon={CheckCircle2} gradient="bg-gradient-to-br from-primary to-accent" delay={0.1} />
        <KpiCard title="Total Payments" value={payments.length.toString()} icon={Wallet} gradient="bg-gradient-to-br from-accent to-primary" delay={0.15} />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by reference or amount..." className="h-9 rounded-xl pl-9" />
        </div>
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="h-9 w-full rounded-xl sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="upi">UPI</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="cheque">Cheque</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="razorpay">Razorpay</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card overflow-hidden premium-shadow">
        {error ? (
          <div className="p-8 text-center"><p className="text-sm text-destructive">{error}</p><Button variant="outline" size="sm" className="mt-3" onClick={loadPayments}>Retry</Button></div>
        ) : loading ? (
          <div className="space-y-0">{[...Array(5)].map((_, i) => (<div key={i} className="flex items-center gap-4 border-b border-border/40 p-4"><div className="h-10 w-10 rounded-full shimmer" /><div className="flex-1 space-y-1.5"><div className="h-3.5 w-1/4 rounded shimmer" /><div className="h-3 w-1/3 rounded shimmer" /></div><div className="h-6 w-16 rounded-full shimmer" /></div>))}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"><Wallet className="h-7 w-7 text-muted-foreground" /></div>
            <p className="mt-4 text-sm font-medium">No payments found</p>
            <p className="mt-1 text-xs text-muted-foreground">{search || methodFilter !== 'all' ? 'Try adjusting filters' : 'Record your first payment'}</p>
            {!search && methodFilter === 'all' && <Button onClick={openAdd} className="mt-4 gap-2"><Plus className="h-4 w-4" />Record Payment</Button>}
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reference</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((p, i) => {
                    const sc = statusConfig[p.status] || statusConfig.completed;
                    return (
                      <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }} className="group border-b border-border/40 transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3"><p className="text-sm">{new Date(p.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></td>
                        <td className="px-4 py-3"><p className="text-sm font-medium">{p.reference || '—'}</p>{p.invoice_id && <p className="text-xs text-muted-foreground">Linked to invoice</p>}</td>
                        <td className="hidden px-4 py-3 md:table-cell"><Badge variant="outline" className="text-xs">{methodLabels[p.method] || p.method}</Badge></td>
                        <td className="px-4 py-3"><Badge variant="outline" className={cn('border', sc.class)}>{sc.label}</Badge></td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-success">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditing(p); setForm({ invoice_id: p.invoice_id || '', customer_id: p.customer_id || '', amount: Number(p.amount), method: p.method, status: p.status, reference: p.reference || '', payment_date: p.payment_date.slice(0, 10), notes: p.notes || '' }); setDialogOpen(true); }}><Pencil className="mr-2 h-3.5 w-3.5" />Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => remove(p)} className="text-destructive"><Trash2 className="mr-2 h-3.5 w-3.5" />Delete</DropdownMenuItem>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-thin sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit Payment' : 'Record Payment'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Link to Invoice (optional)</Label>
              <Select value={form.invoice_id} onValueChange={selectInvoice}>
                <SelectTrigger><SelectValue placeholder="Select invoice" /></SelectTrigger>
                <SelectContent>{invoices.map((inv) => (<SelectItem key={inv.id} value={inv.id}>{inv.invoice_number} — {inv.customer_name} (₹{Number(inv.total).toLocaleString('en-IN')})</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2"><Label>Customer (optional)</Label>
              <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>{customers.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Amount (₹) *</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></div>
              <div className="grid gap-2"><Label>Payment Date</Label><Input type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Method</Label>
                <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="upi">UPI</SelectItem><SelectItem value="bank_transfer">Bank Transfer</SelectItem><SelectItem value="cash">Cash</SelectItem><SelectItem value="cheque">Cheque</SelectItem><SelectItem value="card">Card</SelectItem><SelectItem value="razorpay">Razorpay</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="completed">Completed</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="failed">Failed</SelectItem><SelectItem value="refunded">Refunded</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2"><Label>Reference</Label><Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="UTR / Transaction ID" /></div>
            <div className="grid gap-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={save} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Record'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
