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
  FileBarChart,
  Calendar,
  Wallet,
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

type Expense = {
  id: string;
  category: string;
  description: string | null;
  amount: number;
  payment_method: string;
  vendor: string | null;
  expense_date: string;
  status: string;
  created_at: string;
};

const categories = ['Rent', 'Utilities', 'Salaries', 'Marketing', 'Software', 'Hardware', 'Travel', 'Office Supplies', 'Professional Services', 'Taxes', 'Other'];

const methodLabels: Record<string, string> = {
  cash: 'Cash',
  upi: 'UPI',
  bank_transfer: 'Bank Transfer',
  cheque: 'Cheque',
  card: 'Card',
  other: 'Other',
};

const statusConfig: Record<string, { label: string; class: string }> = {
  recorded: { label: 'Recorded', class: 'bg-accent/10 text-accent border-accent/20' },
  reimbursed: { label: 'Reimbursed', class: 'bg-success/10 text-success border-success/20' },
  pending: { label: 'Pending', class: 'bg-warning/10 text-warning border-warning/20' },
};

const emptyForm = {
  category: 'Other',
  description: '',
  amount: 0,
  payment_method: 'bank_transfer',
  vendor: '',
  expense_date: new Date().toISOString().slice(0, 10),
  status: 'recorded',
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('expenses').select('*').order('expense_date', { ascending: false });
    if (categoryFilter !== 'all') query = query.eq('category', categoryFilter);
    const { data, error } = await query;
    if (!error) setExpenses(data || []);
    setLoading(false);
  }, [categoryFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = expenses.filter((e) => {
    const q = search.toLowerCase();
    return (
      (e.description || '').toLowerCase().includes(q) ||
      (e.vendor || '').toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q)
    );
  });

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (e: Expense) => {
    setEditing(e);
    setForm({
      category: e.category,
      description: e.description || '',
      amount: Number(e.amount),
      payment_method: e.payment_method,
      vendor: e.vendor || '',
      expense_date: e.expense_date,
      status: e.status,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.amount || form.amount <= 0) { toast.error('Amount is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editing) {
        const { error } = await supabase.from('expenses').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Expense updated');
      } else {
        const { error } = await supabase.from('expenses').insert(payload);
        if (error) throw error;
        toast.success('Expense recorded');
      }
      setDialogOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    }
    setSaving(false);
  };

  const remove = async (e: Expense) => {
    if (!confirm('Delete this expense?')) return;
    const { error } = await supabase.from('expenses').delete().eq('id', e.id);
    if (error) toast.error(error.message);
    else { toast.success('Deleted'); load(); }
  };

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const thisMonth = expenses.filter((e) => {
    const d = new Date(e.expense_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, e) => s + Number(e.amount), 0);

  const categoryCount = (cat: string) => expenses.filter((e) => e.category === cat).length;

  return (
    <AppShell>
      <PageHeader
        title="Expenses"
        description="Track and categorize business expenses"
        action={
          <Button onClick={openAdd} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        }
      />

      {/* Summary */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Total Expenses</p>
          <p className="mt-1 font-display text-xl font-bold text-destructive">
            ₹{totalExpenses.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">This Month</p>
          <p className="mt-1 font-display text-xl font-bold text-warning">
            ₹{thisMonth.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Total Records</p>
          <p className="mt-1 font-display text-xl font-bold">{expenses.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Categories</p>
          <p className="mt-1 font-display text-xl font-bold">{new Set(expenses.map((e) => e.category)).size}</p>
        </div>
      </div>

      {/* Category filters */}
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
          All ({expenses.length})
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
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search expenses..." className="h-9 rounded-xl pl-9" />
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
              <FileBarChart className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium">No expenses found</p>
            <Button onClick={openAdd} className="mt-4 gap-2"><Plus className="h-4 w-4" />Add Expense</Button>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((e, i) => {
                    const sc = statusConfig[e.status] || statusConfig.recorded;
                    return (
                      <motion.tr
                        key={e.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="group border-b border-border/40 transition-colors hover:bg-muted/30"
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium">{e.description || e.category}</p>
                          {e.vendor && <p className="text-xs text-muted-foreground">{e.vendor}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">{e.category}</Badge>
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          <p className="text-xs text-muted-foreground">
                            {new Date(e.expense_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={cn('border', sc.class)}>{sc.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-destructive">
                          ₹{Number(e.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(e)}><Pencil className="mr-2 h-3.5 w-3.5" />Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => remove(e)} className="text-destructive"><Trash2 className="mr-2 h-3.5 w-3.5" />Delete</DropdownMenuItem>
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What was this expense for?" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Amount *</Label>
                <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} placeholder="0" />
              </div>
              <div className="grid gap-2">
                <Label>Date</Label>
                <Input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Payment Method</Label>
                <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(methodLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recorded">Recorded</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reimbursed">Reimbursed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Vendor</Label>
              <Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} placeholder="Vendor or merchant name" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
