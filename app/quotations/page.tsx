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
  Send,
  Copy,
  X,
  CheckCircle,
  Clock,
  FileCheck,
  Receipt,
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

type Quotation = {
  id: string;
  quotation_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  customer_gst: string | null;
  line_items: LineItem[];
  subtotal: number;
  gst_rate: number;
  gst_amount: number;
  total: number;
  status: string;
  valid_until: string | null;
  notes: string | null;
  created_at: string;
};

type Customer = { id: string; name: string; company: string | null; email: string | null; phone: string | null; gst_number: string | null };

const statusConfig: Record<string, { label: string; class: string; icon: typeof Clock }> = {
  draft: { label: 'Draft', class: 'bg-muted text-muted-foreground border-border', icon: FileText },
  sent: { label: 'Sent', class: 'bg-accent/10 text-accent border-accent/20', icon: Send },
  accepted: { label: 'Accepted', class: 'bg-success/10 text-success border-success/20', icon: CheckCircle },
  rejected: { label: 'Rejected', class: 'bg-destructive/10 text-destructive border-destructive/20', icon: X },
  expired: { label: 'Expired', class: 'bg-warning/10 text-warning border-warning/20', icon: Clock },
  converted: { label: 'Converted', class: 'bg-primary/10 text-primary border-primary/20', icon: FileCheck },
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

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewing, setViewing] = useState<Quotation | null>(null);
  const [editing, setEditing] = useState<Quotation | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customer_id: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_gst: '',
    valid_until: '',
    gst_rate: 18,
    notes: '',
    line_items: [emptyItem()],
  });

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('quotations').select('*').is('deleted_at', null).order('created_at', { ascending: false });
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);
    const { data, error } = await query;
    if (!error) setQuotations(data || []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    supabase.from('customers').select('id, name, company, email, phone, gst_number').is('deleted_at', null).then(({ data }) => {
      if (data) setCustomers(data);
    });
  }, []);

  const filtered = quotations.filter((q) => {
    const txt = search.toLowerCase();
    return q.quotation_number.toLowerCase().includes(txt) || q.customer_name.toLowerCase().includes(txt);
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
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
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
      }));
    }
  };

  const save = async () => {
    if (!form.customer_name.trim()) { toast.error('Customer is required'); return; }
    if (form.line_items.every((i) => !i.description.trim())) { toast.error('Add at least one item'); return; }
    setSaving(true);
    try {
      const quotation_number = editing
        ? editing.quotation_number
        : `QT-${new Date().getFullYear()}-${String(quotations.length + 1).padStart(3, '0')}`;
      const payload = {
        quotation_number,
        customer_id: form.customer_id || null,
        customer_name: form.customer_name,
        customer_email: form.customer_email || null,
        customer_phone: form.customer_phone || null,
        customer_gst: form.customer_gst || null,
        line_items: form.line_items.filter((i) => i.description.trim()),
        subtotal: totals.subtotal,
        gst_rate: form.gst_rate,
        gst_amount: totals.gst_amount,
        total: totals.total,
        valid_until: form.valid_until || null,
        notes: form.notes || null,
        status: editing ? editing.status : 'draft',
      };
      if (editing) {
        const { error } = await supabase.from('quotations').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Quotation updated');
      } else {
        const { error } = await supabase.from('quotations').insert(payload);
        if (error) throw error;
        toast.success('Quotation created');
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    }
    setSaving(false);
  };

  const convertToInvoice = async (q: Quotation) => {
    if (!confirm('Convert this quotation to an invoice?')) return;
    try {
      const invoice_number = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
      const { error } = await supabase.from('invoices').insert({
        invoice_number,
        customer_id: q.customer_id,
        customer_name: q.customer_name,
        customer_email: q.customer_email,
        customer_phone: q.customer_phone,
        customer_gst: q.customer_gst,
        line_items: q.line_items,
        subtotal: q.subtotal,
        gst_rate: q.gst_rate,
        gst_amount: q.gst_amount,
        total: q.total,
        status: 'draft',
      });
      if (error) throw error;
      await supabase.from('quotations').update({ status: 'converted' }).eq('id', q.id);
      toast.success('Converted to invoice');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const updateStatus = async (q: Quotation, status: string) => {
    const { error } = await supabase.from('quotations').update({ status }).eq('id', q.id);
    if (error) toast.error(error.message);
    else { toast.success('Status updated'); load(); }
  };

  const remove = async (q: Quotation) => {
    if (!confirm(`Delete ${q.quotation_number}?`)) return;
    const { error } = await supabase.from('quotations').update({ deleted_at: new Date().toISOString() }).eq('id', q.id);
    if (error) toast.error(error.message);
    else { toast.success('Deleted'); load(); }
  };

  return (
    <AppShell>
      <PageHeader
        title="Quotations"
        description="Create and manage price quotations"
        action={
          <Button onClick={openAdd} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            New Quotation
          </Button>
        }
      />

      {/* Summary */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Total Quotations</p>
          <p className="mt-1 font-display text-xl font-bold">{quotations.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="mt-1 font-display text-xl font-bold text-accent">
            {quotations.filter((q) => q.status === 'sent').length}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Accepted</p>
          <p className="mt-1 font-display text-xl font-bold text-success">
            {quotations.filter((q) => q.status === 'accepted').length}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Converted</p>
          <p className="mt-1 font-display text-xl font-bold text-primary">
            {quotations.filter((q) => q.status === 'converted').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search quotations..." className="h-9 rounded-xl pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-full rounded-xl sm:w-40">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusConfig).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              <Receipt className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium">No quotations found</p>
            <Button onClick={openAdd} className="mt-4 gap-2"><Plus className="h-4 w-4" />Create Quotation</Button>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quotation #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Valid Until</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((q, i) => {
                    const sc = statusConfig[q.status] || statusConfig.draft;
                    return (
                      <motion.tr
                        key={q.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="group cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/30"
                        onClick={() => setViewing(q)}
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium">{q.quotation_number}</p>
                          <p className="text-xs text-muted-foreground">{q.line_items?.length || 0} items</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium">{q.customer_name}</p>
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          {q.valid_until && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(q.valid_until).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={cn('border', sc.class)}>{sc.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold">
                          ₹{Number(q.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewing(q)}><FileText className="mr-2 h-3.5 w-3.5" />View</DropdownMenuItem>
                              {q.status === 'sent' && (
                                <>
                                  <DropdownMenuItem onClick={() => updateStatus(q, 'accepted')}><CheckCircle className="mr-2 h-3.5 w-3.5 text-success" />Mark Accepted</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => convertToInvoice(q)}><Copy className="mr-2 h-3.5 w-3.5" />Convert to Invoice</DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem onClick={() => remove(q)} className="text-destructive"><Trash2 className="mr-2 h-3.5 w-3.5" />Delete</DropdownMenuItem>
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
            <DialogTitle>{editing ? 'Edit Quotation' : 'New Quotation'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Customer *</Label>
              <Select value={form.customer_id} onValueChange={selectCustomer}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!form.customer_id && (
                <Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="Or type customer name" className="mt-1" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Valid Until</Label><Input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Default GST</Label>
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

            <div className="grid gap-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-thin sm:max-w-2xl">
          {viewing && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="font-display text-xl">{viewing.quotation_number}</DialogTitle>
                  <Badge variant="outline" className={cn('border', (statusConfig[viewing.status] || statusConfig.draft).class)}>
                    {(statusConfig[viewing.status] || statusConfig.draft).label}
                  </Badge>
                </div>
              </DialogHeader>
              <div className="py-4">
                <div className="flex justify-between border-b border-border pb-4">
                  <div>
                    <p className="font-display text-lg font-bold gradient-text">WebHoster AI Business OS</p>
                    <p className="text-xs text-muted-foreground">Mumbai, Maharashtra</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Created: {new Date(viewing.created_at).toLocaleDateString('en-IN')}</p>
                    {viewing.valid_until && <p className="text-xs text-muted-foreground">Valid Until: {new Date(viewing.valid_until).toLocaleDateString('en-IN')}</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Quote For</p>
                  <p className="mt-1 text-sm font-medium">{viewing.customer_name}</p>
                  {viewing.customer_email && <p className="text-xs text-muted-foreground">{viewing.customer_email}</p>}
                </div>
                <table className="mt-4 w-full">
                  <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="pb-2">Description</th><th className="pb-2 text-right">Qty</th><th className="pb-2 text-right">Rate</th><th className="pb-2 text-right">GST</th><th className="pb-2 text-right">Amount</th></tr></thead>
                  <tbody>
                    {viewing.line_items?.map((item, i) => (
                      <tr key={i} className="border-b border-border/40 text-sm">
                        <td className="py-2">{item.description}</td>
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
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">GST</span><span>₹{Number(viewing.gst_amount).toFixed(2)}</span></div>
                  <div className="flex justify-between border-t border-border pt-2 text-base font-bold"><span>Total</span><span>₹{Number(viewing.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                </div>
                {viewing.status === 'sent' && (
                  <div className="mt-4 flex gap-2">
                    <Button onClick={() => { updateStatus(viewing, 'accepted'); setViewing(null); }} className="gap-2"><CheckCircle className="h-4 w-4" />Accept</Button>
                    <Button variant="outline" onClick={() => { convertToInvoice(viewing); setViewing(null); }} className="gap-2"><Copy className="h-4 w-4" />Convert to Invoice</Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
