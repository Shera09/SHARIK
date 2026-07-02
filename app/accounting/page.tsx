'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  FileSpreadsheet,
  MoreHorizontal,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  Scale,
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

type Account = {
  id: string;
  code: string;
  name: string;
  account_type: string;
  sub_type: string | null;
  description: string | null;
  opening_balance: number;
  current_balance: number;
  currency: string;
  is_active: boolean;
  parent_account_id: string | null;
  created_at: string;
};

const accountTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'];

const typeLabels: Record<string, string> = {
  asset: 'Asset',
  liability: 'Liability',
  equity: 'Equity',
  revenue: 'Revenue',
  expense: 'Expense',
};

const typeBadge: Record<string, string> = {
  asset: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  liability: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  equity: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  revenue: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  expense: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
};

const subTypeOptions: Record<string, string[]> = {
  asset: ['Current Asset', 'Fixed Asset', 'Cash', 'Bank', 'Accounts Receivable', 'Inventory', 'Prepaid'],
  liability: ['Current Liability', 'Long-term Liability', 'Accounts Payable', 'Tax Payable', 'Loans'],
  equity: ['Owner Equity', 'Retained Earnings', 'Capital', 'Drawings'],
  revenue: ['Sales Revenue', 'Service Revenue', 'Interest Income', 'Other Income'],
  expense: ['Operating Expense', 'Cost of Goods Sold', 'Administrative', 'Payroll', 'Utilities', 'Marketing'],
};

const emptyForm = {
  code: '',
  name: '',
  account_type: 'asset',
  sub_type: '',
  description: '',
  opening_balance: 0,
};

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('accounts').select('*').order('code', { ascending: true });
    if (typeFilter !== 'all') query = query.eq('account_type', typeFilter);
    const { data, error } = await query;
    if (error) toast.error(error.message);
    else setAccounts(data || []);
    setLoading(false);
  }, [typeFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = accounts.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.code.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      (a.sub_type || '').toLowerCase().includes(q)
    );
  });

  const grouped = accountTypes
    .map((type) => ({
      type,
      label: typeLabels[type],
      items: filtered.filter((a) => a.account_type === type),
    }))
    .filter((g) => g.items.length > 0);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, sub_type: subTypeOptions.asset[0] });
    setDialogOpen(true);
  };

  const openEdit = (a: Account) => {
    setEditing(a);
    setForm({
      code: a.code,
      name: a.name,
      account_type: a.account_type,
      sub_type: a.sub_type || '',
      description: a.description || '',
      opening_balance: Number(a.opening_balance),
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.code.trim()) { toast.error('Account code is required'); return; }
    if (!form.name.trim()) { toast.error('Account name is required'); return; }
    setSaving(true);
    try {
      const payload = {
        code: form.code.trim(),
        name: form.name.trim(),
        account_type: form.account_type,
        sub_type: form.sub_type || null,
        description: form.description || null,
        opening_balance: Number(form.opening_balance) || 0,
      };
      if (editing) {
        const { error } = await supabase.from('accounts').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Account updated');
      } else {
        const { error } = await supabase.from('accounts').insert(payload);
        if (error) throw error;
        toast.success('Account created');
      }
      setDialogOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    }
    setSaving(false);
  };

  const remove = async (a: Account) => {
    if (!confirm(`Delete account ${a.code} — ${a.name}?`)) return;
    const { error } = await supabase.from('accounts').delete().eq('id', a.id);
    if (error) toast.error(error.message);
    else { toast.success('Account deleted'); load(); }
  };

  const totalAssets = accounts.filter((a) => a.account_type === 'asset').reduce((s, a) => s + Number(a.current_balance), 0);
  const totalLiabilities = accounts.filter((a) => a.account_type === 'liability').reduce((s, a) => s + Number(a.current_balance), 0);
  const totalEquity = accounts.filter((a) => a.account_type === 'equity').reduce((s, a) => s + Number(a.current_balance), 0);
  const totalRevenue = accounts.filter((a) => a.account_type === 'revenue').reduce((s, a) => s + Number(a.current_balance), 0);

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <AppShell>
      <PageHeader
        title="Chart of Accounts"
        description="Manage your ledger accounts grouped by type"
        action={
          <Button onClick={openAdd} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
        }
      />

      {/* KPI cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xs text-muted-foreground">Total Assets</p>
          </div>
          <p className="mt-2 font-display text-xl font-bold text-blue-600 dark:text-blue-400">
            {fmt(totalAssets)}
          </p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-xs text-muted-foreground">Total Liabilities</p>
          </div>
          <p className="mt-2 font-display text-xl font-bold text-red-600 dark:text-red-400">
            {fmt(totalLiabilities)}
          </p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
              <Scale className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-xs text-muted-foreground">Total Equity</p>
          </div>
          <p className="mt-2 font-display text-xl font-bold text-purple-600 dark:text-purple-400">
            {fmt(totalEquity)}
          </p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </div>
          <p className="mt-2 font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {fmt(totalRevenue)}
          </p>
        </div>
      </div>

      {/* Type filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setTypeFilter('all')}
          className={cn(
            'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
            typeFilter === 'all'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted'
          )}
        >
          All ({accounts.length})
        </button>
        {accountTypes.map((type) => {
          const count = accounts.filter((a) => a.account_type === type).length;
          return (
            <button
              key={type}
              onClick={() => setTypeFilter(type === typeFilter ? 'all' : type)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                typeFilter === type
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted'
              )}
            >
              {typeLabels[type]} ({count})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by code, name, or sub-type..." className="h-9 rounded-xl pl-9" />
      </div>

      {/* Table grouped by type */}
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
              <FileSpreadsheet className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium">No accounts found</p>
            <p className="mt-1 text-xs text-muted-foreground">Create your first ledger account to get started</p>
            <Button onClick={openAdd} className="mt-4 gap-2"><Plus className="h-4 w-4" />Add Account</Button>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Sub-type</th>
                  <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">Opening Balance</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Balance</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {grouped.map((group) => (
                    <GroupRows
                      key={group.type}
                      group={group}
                      onEdit={openEdit}
                      onRemove={remove}
                      typeBadge={typeBadge}
                      fmt={fmt}
                    />
                  ))}
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
            <DialogTitle>{editing ? 'Edit Account' : 'Add Account'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Code *</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="1000" />
              </div>
              <div className="grid gap-2">
                <Label>Account Type</Label>
                <Select
                  value={form.account_type}
                  onValueChange={(v) => setForm({ ...form, account_type: v, sub_type: subTypeOptions[v]?.[0] || '' })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((t) => <SelectItem key={t} value={t}>{typeLabels[t]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Cash Account" />
            </div>
            <div className="grid gap-2">
              <Label>Sub-type</Label>
              <Select value={form.sub_type} onValueChange={(v) => setForm({ ...form, sub_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(subTypeOptions[form.account_type] || []).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Opening Balance</Label>
              <Input type="number" value={form.opening_balance} onChange={(e) => setForm({ ...form, opening_balance: Number(e.target.value) })} placeholder="0" />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" rows={2} />
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

function GroupRows({
  group,
  onEdit,
  onRemove,
  typeBadge,
  fmt,
}: {
  group: { type: string; label: string; items: Account[] };
  onEdit: (a: Account) => void;
  onRemove: (a: Account) => void;
  typeBadge: Record<string, string>;
  fmt: (n: number) => string;
}) {
  const groupTotal = group.items.reduce((s, a) => s + Number(a.current_balance), 0);
  return (
    <>
      {group.items.map((a, i) => (
        <motion.tr
          key={a.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: i * 0.03 }}
          className="group border-b border-border/40 transition-colors hover:bg-muted/30"
        >
          <td className="px-4 py-3">
            <p className="text-sm font-mono font-medium">{a.code}</p>
          </td>
          <td className="px-4 py-3">
            <p className="text-sm font-medium">{a.name}</p>
            {a.description && <p className="text-xs text-muted-foreground line-clamp-1">{a.description}</p>}
          </td>
          <td className="px-4 py-3">
            <Badge variant="outline" className={cn('border', typeBadge[a.account_type])}>
              {group.label}
            </Badge>
          </td>
          <td className="hidden px-4 py-3 md:table-cell">
            <p className="text-xs text-muted-foreground">{a.sub_type || '—'}</p>
          </td>
          <td className="hidden px-4 py-3 text-right sm:table-cell">
            <p className="text-xs text-muted-foreground">{fmt(Number(a.opening_balance))}</p>
          </td>
          <td className="px-4 py-3 text-right text-sm font-semibold">
            {fmt(Number(a.current_balance))}
          </td>
          <td className="hidden px-4 py-3 lg:table-cell">
            <Badge variant="outline" className={cn('border', a.is_active ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground border-border')}>
              {a.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </td>
          <td className="px-4 py-3 text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(a)}><Pencil className="mr-2 h-3.5 w-3.5" />Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRemove(a)} className="text-destructive"><Trash2 className="mr-2 h-3.5 w-3.5" />Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        </motion.tr>
      ))}
      {/* Group subtotal row */}
      <tr className="border-b border-border/60 bg-muted/20">
        <td colSpan={4} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {group.label} Subtotal
        </td>
        <td className="hidden px-4 py-2 text-right text-xs font-semibold text-muted-foreground sm:table-cell" />
        <td className="px-4 py-2 text-right text-sm font-bold">
          {fmt(groupTotal)}
        </td>
        <td className="hidden px-4 py-2 lg:table-cell" />
        <td className="px-4 py-2" />
      </tr>
    </>
  );
}
