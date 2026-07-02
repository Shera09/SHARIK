'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
  FileText,
  Printer,
  X,
  Trash,
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

type LineItem = {
  description: string;
  hsn: string;
  quantity: number;
  rate: number;
  amount: number;
  gst_rate: number;
  gst_amount: number;
};

type Invoice = {
  id: string;
  invoice_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  customer_gst: string | null;
  billing_address: string | null;
  issue_date: string;
  due_date: string | null;
  line_items: LineItem[];
  subtotal: number;
  gst_rate: number;
  gst_amount: number;
  total: number;
  status: string;
  notes: string | null;
  created_at: string;
};

type Customer = { id: string; name: string; company: string | null; email: string | null; phone: string | null; gst_number: string | null; address: string | null; city: string | null; state: string | null };

const statusConfig: Record<string, { label: string; class: string }> = {
  draft: { label: 'Draft', class: 'bg-muted text-muted-foreground border-border' },
  sent: { label: 'Sent', class: 'bg-accent/10 text-accent border-accent/20' },
  paid: { label: 'Paid', class: 'bg-success/10 text-success border-success/20' },
  partial: { label: 'Partial', class: 'bg-warning/10 text-warning border-warning/20' },
  overdue: { label: 'Overdue', class: 'bg-destructive/10 text-destructive border-destructive/20' },
  cancelled: { label: 'Cancelled', class: 'bg-muted text-muted-foreground border-border' },
};

const emptyItem = (): LineItem => ({
  description: '',
  hsn: '9982',
  quantity: 1,
  rate: 0,
  amount: 0,
  gst_rate: 18,
  gst_amount: 0,
});

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewing, setViewing] = useState<Invoice | null>(null);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customer_id: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_gst: '',
    billing_address: '',
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: '',
    gst_rate: 18,
    notes: '',
    line_items: [emptyItem()],
  });

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    let query = supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);
    const { data, error: err } = await query;
    if (err) setError(err.message);
    else setInvoices(data || []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  useEffect(() => {
    supabase.from('customers').select('id, name, company, email, phone, gst_number, address, city, state').then(({ data }) => {
      if (data) setCustomers(data);
    });
  }, []);

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    return (
      inv.invoice_number.toLowerCase().includes(q) ||
      inv.customer_name.toLowerCase().includes(q)
    );
  });

  const calcItem = (item: LineItem): LineItem => ({
    ...item,
    amount: item.quantity * item.rate,
    gst_amount: item.quantity * item.rate * (item.gst_rate / 100),
  });

  const updateItem = (index: number, field: keyof LineItem, value: any) => {
    setForm((prev) => {
      const items = [...prev.line_items];
      items[index] = { ...items[index], [field]: value };
      items[index] = calcItem(items[index]);
      return { ...prev, line_items: items };
    });
  };

  const addItem = () => setForm((prev) => ({ ...prev, line_items: [...prev.line_items, emptyItem()] }));
  const removeItem = (i: number) => setForm((prev) => ({ ...prev, line_items: prev.line_items.filter((_, idx) => idx !== i) }));

  const totals = form.line_items.reduce(
    (acc, item) => {
      acc.subtotal += item.amount;
      acc.gst_amount += item.gst_amount;
      acc.total += item.amount + item.gst_amount;
      return acc;
    },
    { subtotal: 0, gst_amount: 0, total: 0 }
  );

  const openAdd = () => {
    setEditing(null);
    setForm({
      customer_id: '',
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      customer_gst: '',
      billing_address: '',
      issue_date: new Date().toISOString().slice(0, 10),
      due_date: '',
      gst_rate: 18,
      notes: '',
      line_items: [emptyItem()],
    });
    setDialogOpen(true);
  };

  const selectCustomer = (id: string) => {
    const c = customers.find((c) => c.id === id);
    if (c) {
      setForm((prev) => ({
        ...prev,
        customer_id: c.id,
        customer_name: c.name,
        customer_email: c.email || '',
        customer_phone: c.phone || '',
        customer_gst: c.gst_number || '',
        billing_address: [c.address, c.city, c.state].filter(Boolean).join(', '),
      }));
    }
  };

  const save = async () => {
    if (!form.customer_name.trim()) {
      toast.error('Customer is required');
      return;
    }
    if (form.line_items.length === 0 || form.line_items.every((i) => !i.description.trim())) {
      toast.error('Add at least one line item');
      return;
    }
    setSaving(true);
    try {
      const invoice_number = editing
        ? editing.invoice_number
        : `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;
      const payload = {
        invoice_number,
        customer_id: form.customer_id || null,
        customer_name: form.customer_name,
        customer_email: form.customer_email || null,
        customer_phone: form.customer_phone || null,
        customer_gst: form.customer_gst || null,
        billing_address: form.billing_address || null,
        issue_date: form.issue_date,
        due_date: form.due_date || null,
        line_items: form.line_items.filter((i) => i.description.trim()),
        subtotal: totals.subtotal,
        gst_rate: form.gst_rate,
        gst_amount: totals.gst_amount,
        total: totals.total,
        notes: form.notes || null,
        status: editing ? editing.status : 'draft',
      };
      if (editing) {
        const { error: err } = await supabase.from('invoices').update(payload).eq('id', editing.id);
        if (err) throw err;
        toast.success('Invoice updated');
      } else {
        const { error: err } = await supabase.from('invoices').insert(payload);
        if (err) throw err;
        toast.success('Invoice created');
      }
      setDialogOpen(false);
      loadInvoices();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    }
    setSaving(false);
  };

  const remove = async (inv: Invoice) => {
    if (!confirm(`Delete invoice ${inv.invoice_number}?`)) return;
    const { error: err } = await supabase.from('invoices').delete().eq('id', inv.id);
    if (err) toast.error(err.message);
    else {
      toast.success('Invoice deleted');
      loadInvoices();
    }
  };

  const printInvoice = () => {
    window.print();
  };

  return (
    <AppShell>
      <PageHeader
        title="Invoices"
        description="GST invoices and billing"
        action={
          <Button onClick={openAdd} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        }
      />

      {/* Summary */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Total Invoiced</p>
          <p className="mt-1 font-display text-xl font-bold">
            ₹{invoices.reduce((s, i) => s + Number(i.total), 0).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Paid</p>
          <p className="mt-1 font-display text-xl font-bold text-success">
            ₹{invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="mt-1 font-display text-xl font-bold text-warning">
            ₹{invoices.filter((i) => i.status === 'sent' || i.status === 'partial').reduce((s, i) => s + Number(i.total), 0).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Overdue</p>
          <p className="mt-1 font-display text-xl font-bold text-destructive">
            ₹{invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + Number(i.total), 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoices..."
            className="h-9 rounded-xl pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-full rounded-xl sm:w-40">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden premium-shadow">
        {error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={loadInvoices}>Retry</Button>
          </div>
        ) : loading ? (
          <div className="space-y-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-border/40 p-4">
                <div className="h-10 w-10 rounded-full shimmer" />
                <div className="flex-1 space-y-1.5"><div className="h-3.5 w-1/4 rounded shimmer" /><div className="h-3 w-1/3 rounded shimmer" /></div>
                <div className="h-6 w-16 rounded-full shimmer" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <FileText className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium">No invoices found</p>
            <p className="mt-1 text-xs text-muted-foreground">{search || statusFilter !== 'all' ? 'Try adjusting filters' : 'Create your first invoice'}</p>
            {!search && statusFilter === 'all' && <Button onClick={openAdd} className="mt-4 gap-2"><Plus className="h-4 w-4" />Create Invoice</Button>}
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Invoice #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((inv, i) => {
                    const sc = statusConfig[inv.status] || statusConfig.draft;
                    return (
                      <motion.tr
                        key={inv.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="group cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/30"
                        onClick={() => setViewing(inv)}
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium">{inv.invoice_number}</p>
                          <p className="text-xs text-muted-foreground">{inv.line_items?.length || 0} items</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium">{inv.customer_name}</p>
                          {inv.customer_gst && <p className="text-xs text-muted-foreground">GST: {inv.customer_gst}</p>}
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          <p className="text-xs text-muted-foreground">{new Date(inv.issue_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          {inv.due_date && <p className="text-[10px] text-muted-foreground/70">Due: {new Date(inv.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={cn('border', sc.class)}>{sc.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold">
                          ₹{Number(inv.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewing(inv)}><FileText className="mr-2 h-3.5 w-3.5" />View</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setEditing(inv); setForm({ customer_id: inv.customer_id || '', customer_name: inv.customer_name, customer_email: inv.customer_email || '', customer_phone: inv.customer_phone || '', customer_gst: inv.customer_gst || '', billing_address: inv.billing_address || '', issue_date: inv.issue_date, due_date: inv.due_date || '', gst_rate: inv.gst_rate, notes: inv.notes || '', line_items: inv.line_items || [emptyItem()] }); setDialogOpen(true); }}>
                                <Pencil className="mr-2 h-3.5 w-3.5" />Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => remove(inv)} className="text-destructive"><Trash2 className="mr-2 h-3.5 w-3.5" />Delete</DropdownMenuItem>
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-thin sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Customer *</Label>
              <Select value={form.customer_id} onValueChange={selectCustomer}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ''}</SelectItem>))}
                </SelectContent>
              </Select>
              {!form.customer_id && (
                <Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="Or type customer name" className="mt-1" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Issue Date</Label><Input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
            </div>

            {/* Line items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Line Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1"><Plus className="h-3.5 w-3.5" />Add Item</Button>
              </div>
              {form.line_items.map((item, i) => (
                <div key={i} className="rounded-xl border border-border p-3">
                  <div className="flex items-start gap-2">
                    <Input placeholder="Description" value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} className="flex-1" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} className="shrink-0 text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></Button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <Input placeholder="HSN" value={item.hsn} onChange={(e) => updateItem(i, 'hsn', e.target.value)} className="text-xs" />
                    <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} className="text-xs" />
                    <Input type="number" placeholder="Rate" value={item.rate} onChange={(e) => updateItem(i, 'rate', Number(e.target.value))} className="text-xs" />
                    <Select value={String(item.gst_rate)} onValueChange={(v) => updateItem(i, 'gst_rate', Number(v))}>
                      <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="0">0%</SelectItem><SelectItem value="5">5%</SelectItem><SelectItem value="12">12%</SelectItem><SelectItem value="18">18%</SelectItem><SelectItem value="28">28%</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>Amount: ₹{item.amount.toLocaleString('en-IN')}</span>
                    <span>GST: ₹{item.gst_amount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="rounded-xl bg-muted/40 p-4">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₹{totals.subtotal.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">GST</span><span>₹{totals.gst_amount.toFixed(2)}</span></div>
              <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-bold"><span>Total</span><span>₹{totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
            </div>

            <div className="grid gap-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Payment terms, notes..." rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-thin sm:max-w-2xl">
          {viewing && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="font-display text-xl">Invoice {viewing.invoice_number}</DialogTitle>
                  <Button variant="outline" size="icon" onClick={printInvoice}><Printer className="h-4 w-4" /></Button>
                </div>
              </DialogHeader>
              <div className="py-4">
                <div className="flex justify-between border-b border-border pb-4">
                  <div>
                    <p className="font-display text-lg font-bold gradient-text">WebHoster AI Business OS</p>
                    <p className="text-xs text-muted-foreground">GST: 27AABCW1234D1Z5</p>
                    <p className="text-xs text-muted-foreground">Mumbai, Maharashtra</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={cn('border', (statusConfig[viewing.status] || statusConfig.draft).class)}>{(statusConfig[viewing.status] || statusConfig.draft).label}</Badge>
                    <p className="mt-2 text-xs text-muted-foreground">Issue: {new Date(viewing.issue_date).toLocaleDateString('en-IN')}</p>
                    {viewing.due_date && <p className="text-xs text-muted-foreground">Due: {new Date(viewing.due_date).toLocaleDateString('en-IN')}</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Bill To</p>
                  <p className="mt-1 text-sm font-medium">{viewing.customer_name}</p>
                  {viewing.customer_email && <p className="text-xs text-muted-foreground">{viewing.customer_email}</p>}
                  {viewing.customer_phone && <p className="text-xs text-muted-foreground">{viewing.customer_phone}</p>}
                  {viewing.customer_gst && <p className="text-xs text-muted-foreground">GST: {viewing.customer_gst}</p>}
                  {viewing.billing_address && <p className="text-xs text-muted-foreground">{viewing.billing_address}</p>}
                </div>
                <table className="mt-4 w-full">
                  <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="pb-2">Description</th><th className="pb-2 text-right">Qty</th><th className="pb-2 text-right">Rate</th><th className="pb-2 text-right">GST</th><th className="pb-2 text-right">Amount</th></tr></thead>
                  <tbody>
                    {viewing.line_items?.map((item, i) => (
                      <tr key={i} className="border-b border-border/40 text-sm">
                        <td className="py-2"><p>{item.description}</p><p className="text-[10px] text-muted-foreground">HSN: {item.hsn}</p></td>
                        <td className="py-2 text-right">{item.quantity}</td>
                        <td className="py-2 text-right">₹{item.rate.toLocaleString('en-IN')}</td>
                        <td className="py-2 text-right">{item.gst_rate}%</td>
                        <td className="py-2 text-right font-medium">₹{(item.amount + item.gst_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 ml-auto w-full max-w-xs space-y-1">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₹{Number(viewing.subtotal).toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">GST ({viewing.gst_rate}%)</span><span>₹{Number(viewing.gst_amount).toFixed(2)}</span></div>
                  <div className="flex justify-between border-t border-border pt-2 text-base font-bold"><span>Total</span><span>₹{Number(viewing.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                </div>
                {viewing.notes && <p className="mt-4 text-xs text-muted-foreground"><span className="font-semibold">Notes:</span> {viewing.notes}</p>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
