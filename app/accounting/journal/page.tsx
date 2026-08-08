'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  BookOpen,
  MoreHorizontal,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Calendar,
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

type JournalEntry = {
  id: string;
  entry_number: string;
  account_id: string;
  entry_date: string;
  debit_amount: number;
  credit_amount: number;
  description: string | null;
  reference_type: string | null;
  reference_id: string | null;
  status: string;
  created_at: string;
};

const statusConfig: Record<string, { label: string; class: string }> = {
  draft: { label: 'Draft', class: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  posted: { label: 'Posted', class: 'bg-success/10 text-success border-success/20' },
  reversed: { label: 'Reversed', class: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const statusFilters = ['all', 'draft', 'posted', 'reversed'];

const emptyForm = {
  account_id: '',
  entry_date: new Date().toISOString().slice(0, 10),
  entry_side: 'debit' as 'debit' | 'credit',
  amount: 0,
  description: '',
  status: 'posted',
};

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountMap, setAccountMap] = useState<Record<string, Account>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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

    // Fetch journal entries with filtering
    let query = supabase.from('journal_entries').select('*').is('deleted_at', null).order('entry_date', { ascending: false }).order('created_at', { ascending: false });
    if (dateFrom) query = query.gte('entry_date', dateFrom);
    if (dateTo) query = query.lte('entry_date', dateTo);
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);
    const { data, error } = await query;
    if (error) toast.error(error.message);
    else setEntries(data || []);
    setLoading(false);
  }, [statusFilter, dateFrom, dateTo]);

  useEffect(() => { load(); }, [load]);

  const filtered = entries.filter((e) => {
    const q = search.toLowerCase();
    const acc = accountMap[e.account_id];
    const accName = acc ? `${acc.code} ${acc.name}`.toLowerCase() : '';
    return (
      (e.entry_number || '').toLowerCase().includes(q) ||
      (e.description || '').toLowerCase().includes(q) ||
      accName.includes(q)
    );
  });

  const openAdd = () => {
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.account_id) { toast.error('Account is required'); return; }
    if (!form.amount || form.amount <= 0) { toast.error('Amount must be greater than zero'); return; }
    setSaving(true);
    try {
      const entry_number = `JE-${new Date().getFullYear()}-${String(entries.length + 1).padStart(4, '0')}`;
      const payload = {
        entry_number,
        account_id: form.account_id,
        entry_date: form.entry_date,
        debit_amount: form.entry_side === 'debit' ? Number(form.amount) : 0,
        credit_amount: form.entry_side === 'credit' ? Number(form.amount) : 0,
        description: form.description || null,
        status: form.status,
      };
      const { error } = await supabase.from('journal_entries').insert(payload);
      if (error) throw error;
      toast.success('Journal entry posted');
      setDialogOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    }
    setSaving(false);
  };

  const remove = async (e: JournalEntry) => {
    if (!confirm('Delete this journal entry?')) return;
    const { error } = await supabase.from('journal_entries').update({ deleted_at: new Date().toISOString() }).eq('id', e.id);
    if (error) toast.error(error.message);
    else { toast.success('Journal entry deleted'); load(); }
  };

  const updateStatus = async (e: JournalEntry, status: string) => {
    const { error } = await supabase.from('journal_entries').update({ status }).eq('id', e.id);
    if (error) toast.error(error.message);
    else { toast.success(`Entry marked as ${status}`); load(); }
  };

  // KPIs — current month
  const now = new Date();
  const monthEntries = entries.filter((e) => {
    const d = new Date(e.entry_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalDebits = monthEntries.reduce((s, e) => s + Number(e.debit_amount), 0);
  const totalCredits = monthEntries.reduce((s, e) => s + Number(e.credit_amount), 0);
  const isBalanced = totalDebits === totalCredits;
  const balanceDiff = Math.abs(totalDebits - totalCredits);

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
        title="Journal Entries"
        description="Double-entry bookkeeping ledger"
        action={
          <Button onClick={openAdd} className="gap-2 rounded-xl" disabled={accounts.length === 0}>
            <Plus className="h-4 w-4" />
            Add Entry
          </Button>
        }
      />

      {/* KPI cards — current month */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xs text-muted-foreground">Total Debits</p>
          </div>
          <p className="mt-2 font-display text-xl font-bold text-blue-600 dark:text-blue-400">
            {fmt(totalDebits)}
          </p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
              <ArrowRight className="h-4 w-4 text-purple-600 dark:text-purple-400 rotate-180" />
            </div>
            <p className="text-xs text-muted-foreground">Total Credits</p>
          </div>
          <p className="mt-2 font-display text-xl font-bold text-purple-600 dark:text-purple-400">
            {fmt(totalCredits)}
          </p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2">
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', isBalanced ? 'bg-success/10' : 'bg-warning/10')}>
              {isBalanced ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <AlertCircle className="h-4 w-4 text-warning" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">Balance Check</p>
          </div>
          <p className={cn('mt-2 font-display text-xl font-bold', isBalanced ? 'text-success' : 'text-warning')}>
            {isBalanced ? 'Balanced' : fmt(balanceDiff)}
          </p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <BookOpen className="h-4 w-4 text-accent" />
            </div>
            <p className="text-xs text-muted-foreground">Entries</p>
          </div>
          <p className="mt-2 font-display text-xl font-bold">{monthEntries.length}</p>
        </div>
      </div>

      {/* Status filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors',
              statusFilter === s
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted'
            )}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {/* Date range + search */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 rounded-xl" />
          <span className="text-xs text-muted-foreground">to</span>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 rounded-xl" />
          <Button variant="outline" size="sm" onClick={setThisMonth} className="h-9 gap-1 rounded-xl">
            <Calendar className="h-3.5 w-3.5" />This Month
          </Button>
          {(dateFrom || dateTo) && (
            <Button variant="ghost" size="sm" onClick={clearDates} className="h-9 rounded-xl">Clear</Button>
          )}
        </div>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search journal entries..." className="h-9 rounded-xl pl-9" />
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
              <BookOpen className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium">No journal entries found</p>
            <p className="mt-1 text-xs text-muted-foreground">Create your first journal entry to get started</p>
            <Button onClick={openAdd} className="mt-4 gap-2" disabled={accounts.length === 0}><Plus className="h-4 w-4" />Add Entry</Button>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Entry #</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Account</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Debit</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Credit</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((e, i) => {
                    const acc = accountMap[e.account_id];
                    const sc = statusConfig[e.status] || statusConfig.posted;
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
                          <p className="text-sm font-medium">{e.entry_number.slice(0, 8)}</p>
                          {e.description && <p className="text-xs text-muted-foreground line-clamp-1">{e.description}</p>}
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
                        <td className="hidden px-4 py-3 sm:table-cell">
                          <p className="text-xs text-muted-foreground">
                            {new Date(e.entry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold">
                          {Number(e.debit_amount) > 0 ? (
                            <span className="text-blue-600 dark:text-blue-400">{fmt(Number(e.debit_amount))}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold">
                          {Number(e.credit_amount) > 0 ? (
                            <span className="text-purple-600 dark:text-purple-400">{fmt(Number(e.credit_amount))}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="hidden px-4 py-3 lg:table-cell">
                          <Badge variant="outline" className={cn('border', sc.class)}>{sc.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {e.status !== 'posted' && (
                                <DropdownMenuItem onClick={() => updateStatus(e, 'posted')}><CheckCircle2 className="mr-2 h-3.5 w-3.5" />Mark Posted</DropdownMenuItem>
                              )}
                              {e.status !== 'draft' && (
                                <DropdownMenuItem onClick={() => updateStatus(e, 'draft')}><AlertCircle className="mr-2 h-3.5 w-3.5" />Mark Draft</DropdownMenuItem>
                              )}
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

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Journal Entry</DialogTitle>
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
                <Label>Entry Side</Label>
                <Select value={form.entry_side} onValueChange={(v) => setForm({ ...form, entry_side: v as 'debit' | 'credit' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debit">Debit</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
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
                <Input type="date" value={form.entry_date} onChange={(e) => setForm({ ...form, entry_date: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="posted">Posted</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe this journal entry..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Add Entry'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
