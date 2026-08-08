'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Receipt,
  MoreHorizontal,
  Trash2,
  ArrowDownCircle,
  ArrowUpCircle,
  MinusCircle,
  Calendar,
  Filter,
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

type Account = {
  id: string;
  code: string;
  name: string;
  account_type: string;
};

type Transaction = {
  id: string;
  account_id: string | null;
  invoice_id: string | null;
  payment_id: string | null;
  transaction_number: string;
  transaction_type: string;
  amount: number;
  description: string | null;
  transaction_date: string;
  reference: string | null;
  status: string;
  created_at: string;
};

const typeLabels: Record<string, string> = {
  debit: 'Debit',
  credit: 'Credit',
  transfer: 'Transfer',
  sale: 'Sale',
  purchase: 'Purchase',
  expense: 'Expense',
  payment_received: 'Payment Received',
  payment_made: 'Payment Made',
  adjustment: 'Adjustment',
  opening_balance: 'Opening Balance',
};

// Inflow types increase cash/asset; outflow types decrease it
const inflowTypes = ['credit', 'sale', 'payment_received', 'opening_balance'];
const outflowTypes = ['debit', 'purchase', 'expense', 'payment_made'];

const typeBadgeClass = (type: string) => {
  if (inflowTypes.includes(type)) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  if (outflowTypes.includes(type)) return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
  return 'bg-muted text-muted-foreground border-border';
};

const statusConfig: Record<string, { label: string; class: string }> = {
  draft: { label: 'Draft', class: 'bg-muted text-muted-foreground border-border' },
  posted: { label: 'Posted', class: 'bg-success/10 text-success border-success/20' },
  reversed: { label: 'Reversed', class: 'bg-destructive/10 text-destructive border-destructive/20' },
  pending: { label: 'Pending', class: 'bg-warning/10 text-warning border-warning/20' },
};

const typeFilters = ['all', 'debit', 'credit', 'sale', 'purchase', 'expense', 'payment_received', 'payment_made'];

const emptyForm = {
  account_id: '',
  transaction_type: 'sale',
  amount: 0,
  description: '',
  transaction_date: new Date().toISOString().slice(0, 10),
  reference: '',
  status: 'posted',
};

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountMap, setAccountMap] = useState<Record<string, Account>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    // Fetch accounts for the lookup map
    const { data: accData } = await supabase.from('accounts').select('id, code, name, account_type').is('deleted_at', null).order('code');
    const accList = accData || [];
    setAccounts(accList);
    const map: Record<string, Account> = {};
    accList.forEach((a) => { map[a.id] = a; });
    setAccountMap(map);

    // Fetch transactions with date filtering
    let query = supabase.from('transactions').select('*').is('deleted_at', null).order('transaction_date', { ascending: false }).order('created_at', { ascending: false });
    if (dateFrom) query = query.gte('transaction_date', dateFrom);
    if (dateTo) query = query.lte('transaction_date', dateTo);
    if (typeFilter !== 'all') query = query.eq('transaction_type', typeFilter);
    const { data, error } = await query;
    if (error) toast.error(error.message);
    else setTransactions(data || []);
    setLoading(false);
  }, [typeFilter, dateFrom, dateTo]);

  useEffect(() => { load(); }, [load]);

  const filtered = transactions.filter((t) => {
    const q = search.toLowerCase();
    const acc = t.account_id ? accountMap[t.account_id] : null;
    return (
      (t.description || '').toLowerCase().includes(q) ||
      (t.reference || '').toLowerCase().includes(q) ||
      (acc ? `${acc.code} ${acc.name}`.toLowerCase() : '').includes(q)
    );
  });

  const openAdd = () => {
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.amount || form.amount <= 0) { toast.error('Amount must be greater than zero'); return; }
    setSaving(true);
    try {
      const payload = {
        account_id: form.account_id || null,
        transaction_type: form.transaction_type,
        amount: Number(form.amount),
        transaction_date: form.transaction_date,
        reference: form.reference || null,
        description: form.description || null,
        status: form.status,
      };
      const { error } = await supabase.from('transactions').insert(payload);
      if (error) throw error;
      toast.success('Transaction recorded');
      setDialogOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    }
    setSaving(false);
  };

  const remove = async (t: Transaction) => {
    if (!confirm('Delete this transaction?')) return;
    const { error } = await supabase.from('transactions').update({ deleted_at: new Date().toISOString() }).eq('id', t.id);
    if (error) toast.error(error.message);
    else { toast.success('Transaction deleted'); load(); }
  };

  // KPIs — current month
  const now = new Date();
  const monthTransactions = transactions.filter((t) => {
    const d = new Date(t.transaction_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalInflow = monthTransactions.filter((t) => inflowTypes.includes(t.transaction_type)).reduce((s, t) => s + Number(t.amount), 0);
  const totalOutflow = monthTransactions.filter((t) => outflowTypes.includes(t.transaction_type)).reduce((s, t) => s + Number(t.amount), 0);
  const netFlow = totalInflow - totalOutflow;

  const setThisMonth = () => {
    const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    setDateFrom(first);
    setDateTo(last);
  };

  const clearDates = () => {
    setDateFrom('');
    setDateTo('');
  };

  return (
    <AppShell>
      <PageHeader
        title="Transactions"
        description="Record and track all financial transactions"
        action={
          <Button onClick={openAdd} className="gap-2 rounded-xl" disabled={accounts.length === 0}>
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        }
      />

      {/* KPI cards — current month */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <ArrowDownCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xs text-muted-foreground">Total Inflow</p>
          </div>
          <p className="mt-2 font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {fmt(totalInflow)}
          </p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
              <ArrowUpCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-xs text-muted-foreground">Total Outflow</p>
          </div>
          <p className="mt-2 font-display text-xl font-bold text-red-600 dark:text-red-400">
            {fmt(totalOutflow)}
          </p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <MinusCircle className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Net Flow</p>
          </div>
          <p className={cn('mt-2 font-display text-xl font-bold', netFlow >= 0 ? 'text-success' : 'text-destructive')}>
            {fmt(netFlow)}
          </p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Receipt className="h-4 w-4 text-accent" />
            </div>
            <p className="text-xs text-muted-foreground">Transactions</p>
          </div>
          <p className="mt-2 font-display text-xl font-bold">{monthTransactions.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTypeFilter('all')}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              typeFilter === 'all'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted'
            )}
          >
            All Types
          </button>
          {typeFilters.slice(1).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t === typeFilter ? 'all' : t)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                typeFilter === t
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted'
              )}
            >
              {typeLabels[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Date range + search */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 rounded-xl" />
          <span className="text-xs text-muted-foreground">to</span>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 rounded-xl" />
          <Button variant="outline" size="sm" onClick={setThisMonth} className="h-9 gap-1 rounded-xl">
            <Filter className="h-3.5 w-3.5" />This Month
          </Button>
          {(dateFrom || dateTo) && (
            <Button variant="ghost" size="sm" onClick={clearDates} className="h-9 rounded-xl">Clear</Button>
          )}
        </div>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search transactions..." className="h-9 rounded-xl pl-9" />
        </div>
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
            <p className="mt-4 text-sm font-medium">No transactions found</p>
            <p className="mt-1 text-xs text-muted-foreground">Record a transaction or adjust your filters</p>
            <Button onClick={openAdd} className="mt-4 gap-2" disabled={accounts.length === 0}><Plus className="h-4 w-4" />Add Transaction</Button>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Account</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">Date</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((t, i) => {
                    const acc = t.account_id ? accountMap[t.account_id] : null;
                    const isOutflow = outflowTypes.includes(t.transaction_type);
                    const isInflow = inflowTypes.includes(t.transaction_type);
                    const sc = statusConfig[t.status] || statusConfig.posted;
                    return (
                      <motion.tr
                        key={t.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="group border-b border-border/40 transition-colors hover:bg-muted/30"
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium">{t.description || typeLabels[t.transaction_type]}</p>
                          <p className="text-xs text-muted-foreground">{t.transaction_number.slice(0, 8)}</p>
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          {acc ? (
                            <div>
                              <p className="text-xs font-medium">{acc.name}</p>
                              <p className="text-xs text-muted-foreground">{acc.code}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={cn('border', typeBadgeClass(t.transaction_type))}>
                            {typeLabels[t.transaction_type] || t.transaction_type}
                          </Badge>
                        </td>
                        <td className="hidden px-4 py-3 sm:table-cell">
                          <p className="text-xs text-muted-foreground">
                            {new Date(t.transaction_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </td>
                        <td className="hidden px-4 py-3 lg:table-cell">
                          <Badge variant="outline" className={cn('border', sc.class)}>{sc.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold">
                          <span className={isInflow ? 'text-emerald-600 dark:text-emerald-400' : isOutflow ? 'text-red-600 dark:text-red-400' : ''}>
                            {isInflow ? '+' : isOutflow ? '−' : ''}{fmt(Number(t.amount))}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => remove(t)} className="text-destructive"><Trash2 className="mr-2 h-3.5 w-3.5" />Delete</DropdownMenuItem>
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

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Account *</Label>
              <Select value={form.account_id} onValueChange={(v) => setForm({ ...form, account_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.code} — {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={form.transaction_type} onValueChange={(v) => setForm({ ...form, transaction_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Amount *</Label>
                <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date</Label>
                <Input type="date" value={form.transaction_date} onChange={(e) => setForm({ ...form, transaction_date: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="posted">Posted</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this transaction for?" rows={2} />
            </div>
            <div className="grid gap-2">
              <Label>Reference</Label>
              <Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Invoice #, receipt #, etc." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
