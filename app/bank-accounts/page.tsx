'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Building2,
  Pencil,
  Trash2,
  MoreHorizontal,
  IndianRupee,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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

type BankAccount = {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string | null;
  ifsc_code: string | null;
  balance: number;
  account_type: string;
  status: string;
  created_at: string;
};

const accountTypes = ['savings', 'current', 'od', 'cc'];
const accountTypeLabels: Record<string, string> = {
  savings: 'Savings',
  current: 'Current',
  od: 'Overdraft (OD)',
  cc: 'Cash Credit (CC)',
};

const statusConfig: Record<string, { label: string; class: string }> = {
  active: { label: 'Active', class: 'bg-success/10 text-success border-success/20' },
  inactive: { label: 'Inactive', class: 'bg-muted text-muted-foreground border-border' },
};

const emptyForm = {
  bank_name: '',
  account_name: '',
  account_number: '',
  ifsc_code: '',
  balance: 0,
  account_type: 'current',
  status: 'active',
};

export default function BankAccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BankAccount | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('bank_accounts').select('*').is('deleted_at', null).order('created_at', { ascending: false });
    if (!error) setAccounts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (a: BankAccount) => {
    setEditing(a);
    setForm({
      bank_name: a.bank_name,
      account_name: a.account_name,
      account_number: a.account_number || '',
      ifsc_code: a.ifsc_code || '',
      balance: Number(a.balance),
      account_type: a.account_type,
      status: a.status,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.bank_name.trim()) { toast.error('Bank name is required'); return; }
    if (!form.account_name.trim()) { toast.error('Account name is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, balance: Number(form.balance) };
      if (editing) {
        const { error } = await supabase.from('bank_accounts').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Account updated');
      } else {
        const { error } = await supabase.from('bank_accounts').insert(payload);
        if (error) throw error;
        toast.success('Account added');
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    }
    setSaving(false);
  };

  const remove = async (a: BankAccount) => {
    if (!confirm(`Delete ${a.bank_name} account?`)) return;
    const { error } = await supabase.from('bank_accounts').update({ deleted_at: new Date().toISOString() }).eq('id', a.id);
    if (error) toast.error(error.message);
    else { toast.success('Deleted'); load(); }
  };

  const totalBalance = accounts.filter((a) => a.status === 'active').reduce((s, a) => s + Number(a.balance), 0);

  return (
    <AppShell>
      <PageHeader
        title="Bank Accounts"
        description="Manage company bank accounts and balances"
        action={
          <Button onClick={openAdd} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
        }
      />

      {/* Summary */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Total Balance</p>
          <p className="mt-1 font-display text-xl font-bold text-success">
            ₹{totalBalance.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Active Accounts</p>
          <p className="mt-1 font-display text-xl font-bold">{accounts.filter((a) => a.status === 'active').length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Total Accounts</p>
          <p className="mt-1 font-display text-xl font-bold">{accounts.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Banks</p>
          <p className="mt-1 font-display text-xl font-bold">{new Set(accounts.map((a) => a.bank_name)).size}</p>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl shimmer" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Building2 className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium">No bank accounts</p>
          <p className="mt-1 text-xs text-muted-foreground">Add your company bank accounts</p>
          <Button onClick={openAdd} className="mt-4 gap-2"><Plus className="h-4 w-4" />Add Account</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {accounts.map((a, i) => {
              const sc = statusConfig[a.status] || statusConfig.active;
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="group glass-card p-5 premium-shadow transition-shadow hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{a.bank_name}</p>
                        <p className="text-xs text-muted-foreground">{a.account_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => openEdit(a)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive hover:text-destructive" onClick={() => remove(a)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="flex items-center gap-1 text-2xl font-bold">
                      <IndianRupee className="h-5 w-5 text-muted-foreground" />
                      {Number(a.balance).toLocaleString('en-IN')}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Current Balance</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <Badge variant="outline" className={cn('border', sc.class)}>{sc.label}</Badge>
                    <span className="text-xs text-muted-foreground">{accountTypeLabels[a.account_type] || a.account_type}</span>
                  </div>
                  {a.account_number && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      A/C: {a.account_number.slice(0, 4)}xxxx{a.account_number.slice(-4)}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Account' : 'Add Bank Account'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Bank Name *</Label>
              <Input value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} placeholder="HDFC Bank" />
            </div>
            <div className="grid gap-2">
              <Label>Account Name *</Label>
              <Input value={form.account_name} onChange={(e) => setForm({ ...form, account_name: e.target.value })} placeholder="WebHoster Solutions Pvt Ltd" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Account Number</Label>
                <Input value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} placeholder="1234567890" />
              </div>
              <div className="grid gap-2">
                <Label>IFSC Code</Label>
                <Input value={form.ifsc_code} onChange={(e) => setForm({ ...form, ifsc_code: e.target.value })} placeholder="HDFC0001234" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Current Balance</Label>
                <Input type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: Number(e.target.value) })} placeholder="0" />
              </div>
              <div className="grid gap-2">
                <Label>Account Type</Label>
                <Select value={form.account_type} onValueChange={(v) => setForm({ ...form, account_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((t) => (
                      <SelectItem key={t} value={t}>{accountTypeLabels[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
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
