'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  CalendarDays,
  Hourglass,
  CheckCircle2,
  XCircle,
  Plane,
  Check,
  X,
  MoreHorizontal,
  Pencil,
  Trash2,
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

type Employee = {
  id: string;
  name: string;
  department: string | null;
};

type Leave = {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string | null;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
};

const leaveTypeConfig: Record<string, { label: string; class: string }> = {
  casual: { label: 'Casual', class: 'bg-primary/10 text-primary border-primary/20' },
  sick: { label: 'Sick', class: 'bg-destructive/10 text-destructive border-destructive/20' },
  earned: { label: 'Earned', class: 'bg-success/10 text-success border-success/20' },
  unpaid: { label: 'Unpaid', class: 'bg-muted text-muted-foreground border-border' },
  maternity: { label: 'Maternity', class: 'bg-accent/10 text-accent border-accent/20' },
  paternity: { label: 'Paternity', class: 'bg-accent/10 text-accent border-accent/20' },
  sabbatical: { label: 'Sabbatical', class: 'bg-warning/10 text-warning border-warning/20' },
  other: { label: 'Other', class: 'bg-muted text-muted-foreground border-border' },
};

const leaveStatusConfig: Record<string, { label: string; class: string; dot: string }> = {
  pending: { label: 'Pending', class: 'bg-warning/10 text-warning border-warning/20', dot: 'bg-warning' },
  approved: { label: 'Approved', class: 'bg-success/10 text-success border-success/20', dot: 'bg-success' },
  rejected: { label: 'Rejected', class: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive' },
  cancelled: { label: 'Cancelled', class: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground' },
};

const leaveTypes = ['casual', 'sick', 'earned', 'unpaid', 'maternity', 'paternity', 'sabbatical', 'other'];
const statusTabs = ['all', 'pending', 'approved', 'rejected'] as const;

const emptyForm = {
  employee_id: '',
  leave_type: 'casual',
  start_date: '',
  end_date: '',
  reason: '',
};

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(start: string, end: string) {
  if (!start || !end) return 0;
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  return Math.max(0, Math.round((e.getTime() - s.getTime()) / 86400000) + 1);
}

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function LeavesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<typeof statusTabs[number]>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Leave | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [empRes, leaveRes] = await Promise.all([
        supabase.from('employees').select('id, name, department').order('name', { ascending: true }),
        supabase.from('leaves').select('*').order('created_at', { ascending: false }),
      ]);
      if (empRes.error) throw empRes.error;
      if (leaveRes.error) throw leaveRes.error;
      setEmployees(empRes.data || []);
      setLeaves(leaveRes.data || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load leaves');
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const empMap = new Map(employees.map((e) => [e.id, e]));

  const filtered = leaves.filter((l) => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const emp = empMap.get(l.employee_id);
      return (emp?.name || '').toLowerCase().includes(q) || (l.reason || '').toLowerCase().includes(q) || l.leave_type.toLowerCase().includes(q);
    }
    return true;
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const today = todayISO();

  const kpis = {
    pending: leaves.filter((l) => l.status === 'pending').length,
    approvedMonth: leaves.filter((l) => l.status === 'approved' && l.approved_at && new Date(l.approved_at) >= monthStart).length,
    rejectedMonth: leaves.filter((l) => l.status === 'rejected' && l.approved_at && new Date(l.approved_at) >= monthStart).length,
    onLeaveToday: leaves.filter((l) => l.status === 'approved' && today >= l.start_date && today <= l.end_date).length,
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = (l: Leave) => {
    setEditing(l);
    setForm({ employee_id: l.employee_id, leave_type: l.leave_type, start_date: l.start_date, end_date: l.end_date, reason: l.reason || '' });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.employee_id) { toast.error('Select an employee'); return; }
    if (!form.start_date || !form.end_date) { toast.error('Start and end dates are required'); return; }
    if (form.end_date < form.start_date) { toast.error('End date cannot be before start date'); return; }
    setSaving(true);
    try {
      const days = daysBetween(form.start_date, form.end_date);
      const payload = { ...form, days };
      if (editing) {
        const { error: err } = await supabase.from('leaves').update(payload).eq('id', editing.id);
        if (err) throw err;
        toast.success('Leave updated');
      } else {
        const { error: err } = await supabase.from('leaves').insert({ ...payload, status: 'pending' });
        if (err) throw err;
        toast.success('Leave request created');
      }
      setDialogOpen(false);
      load();
    } catch (e: any) { toast.error(e.message || 'Failed to save'); }
    setSaving(false);
  };

  const approve = async (l: Leave) => {
    setActing(l.id);
    try {
      const { error: err } = await supabase
        .from('leaves')
        .update({ status: 'approved', approved_by: 'Admin', approved_at: new Date().toISOString() })
        .eq('id', l.id);
      if (err) throw err;
      toast.success('Leave approved');
      load();
    } catch (e: any) { toast.error(e.message || 'Failed to approve'); }
    setActing(null);
  };

  const reject = async (l: Leave) => {
    setActing(l.id);
    try {
      const { error: err } = await supabase
        .from('leaves')
        .update({ status: 'rejected', approved_by: 'Admin', approved_at: new Date().toISOString() })
        .eq('id', l.id);
      if (err) throw err;
      toast.success('Leave rejected');
      load();
    } catch (e: any) { toast.error(e.message || 'Failed to reject'); }
    setActing(null);
  };

  const remove = async (l: Leave) => {
    if (!confirm('Delete this leave request?')) return;
    const { error: err } = await supabase.from('leaves').delete().eq('id', l.id);
    if (err) toast.error(err.message);
    else { toast.success('Leave deleted'); load(); }
  };

  const formDays = daysBetween(form.start_date, form.end_date);

  return (
    <AppShell>
      <PageHeader
        title="Leaves"
        description="Review and approve leave requests"
        action={<Button onClick={openAdd} className="gap-2 rounded-xl" disabled={employees.length === 0}><Plus className="h-4 w-4" />New Request</Button>}
      />

      {/* KPI cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Pending Requests</p>
            <Hourglass className="h-4 w-4 text-warning" />
          </div>
          <p className="mt-1 font-display text-xl font-bold text-warning">{kpis.pending}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Approved This Month</p>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </div>
          <p className="mt-1 font-display text-xl font-bold text-success">{kpis.approvedMonth}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Rejected This Month</p>
            <XCircle className="h-4 w-4 text-destructive" />
          </div>
          <p className="mt-1 font-display text-xl font-bold text-destructive">{kpis.rejectedMonth}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">On Leave Today</p>
            <Plane className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-1 font-display text-xl font-bold text-accent">{kpis.onLeaveToday}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leaves..." className="h-9 rounded-xl pl-9" />
        </div>
        <div className="flex rounded-xl border border-border bg-muted/30 p-1">
          {statusTabs.map((tab) => (
            <Button
              key={tab}
              variant={statusFilter === tab ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(tab)}
              className="gap-1.5 capitalize"
            >
              {tab === 'all' ? 'All' : leaveStatusConfig[tab]?.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden premium-shadow">
        {error ? (
          <div className="p-8 text-center"><p className="text-sm text-destructive">{error}</p><Button variant="outline" size="sm" className="mt-3" onClick={load}>Retry</Button></div>
        ) : loading ? (
          <div className="space-y-0">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-border/40 p-4">
                <div className="h-10 w-10 rounded-full shimmer" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-1/4 rounded shimmer" />
                  <div className="h-3 w-1/3 rounded shimmer" />
                </div>
                <div className="h-6 w-16 rounded-full shimmer" />
                <div className="h-8 w-20 rounded-lg shimmer" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"><CalendarDays className="h-7 w-7 text-muted-foreground" /></div>
            <p className="mt-4 text-sm font-medium">No leave requests</p>
            <p className="mt-1 text-xs text-muted-foreground">{search || statusFilter !== 'all' ? 'Try adjusting filters' : 'Create your first leave request'}</p>
            {!search && statusFilter === 'all' && <Button onClick={openAdd} className="mt-4 gap-2"><Plus className="h-4 w-4" />New Request</Button>}
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Dates</th>
                  <th className="hidden px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">Days</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((l, i) => {
                    const emp = empMap.get(l.employee_id);
                    const tc = leaveTypeConfig[l.leave_type] || leaveTypeConfig.other;
                    const sc = leaveStatusConfig[l.status] || leaveStatusConfig.pending;
                    return (
                      <motion.tr key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }} className="group border-b border-border/40 transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-xs font-semibold text-primary">{(emp?.name || '?').charAt(0).toUpperCase()}</div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{emp?.name || 'Unknown'}</p>
                              {emp?.department && <p className="truncate text-xs text-muted-foreground">{emp.department}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><Badge variant="outline" className={cn('border text-xs', tc.class)}>{tc.label}</Badge></td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="h-3 w-3" />{fmtDate(l.start_date)}</p>
                          <p className="ml-[18px] text-xs text-muted-foreground">→ {fmtDate(l.end_date)}</p>
                        </td>
                        <td className="hidden px-4 py-3 text-center text-sm font-medium sm:table-cell">{l.days}</td>
                        <td className="hidden px-4 py-3 lg:table-cell"><p className="max-w-[200px] truncate text-xs text-muted-foreground">{l.reason || '—'}</p></td>
                        <td className="px-4 py-3"><Badge variant="outline" className={cn('border text-xs', sc.class)}><span className={cn('mr-1 h-1.5 w-1.5 rounded-full', sc.dot)} />{sc.label}</Badge></td>
                        <td className="px-4 py-3 text-right">
                          {l.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button size="sm" variant="outline" onClick={() => approve(l)} disabled={acting === l.id} className="gap-1 h-8 rounded-lg border-success/20 text-success hover:bg-success/10">
                                <Check className="h-3.5 w-3.5" />Approve
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => reject(l)} disabled={acting === l.id} className="gap-1 h-8 rounded-lg border-destructive/20 text-destructive hover:bg-destructive/10">
                                <X className="h-3.5 w-3.5" />Reject
                              </Button>
                            </div>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEdit(l)}><Pencil className="mr-2 h-3.5 w-3.5" />Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => remove(l)} className="text-destructive"><Trash2 className="mr-2 h-3.5 w-3.5" />Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
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

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-thin sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit Leave Request' : 'New Leave Request'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Employee *</Label>
              <Select value={form.employee_id} onValueChange={(v) => setForm({ ...form, employee_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Leave Type</Label>
              <Select value={form.leave_type} onValueChange={(v) => setForm({ ...form, leave_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((t) => <SelectItem key={t} value={t}>{leaveTypeConfig[t].label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Start Date *</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
              <div className="grid gap-2"><Label>End Date *</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
            </div>
            {formDays > 0 && <p className="text-xs text-muted-foreground">{formDays} day{formDays > 1 ? 's' : ''}</p>}
            <div className="grid gap-2"><Label>Reason</Label><Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={3} placeholder="Reason for leave..." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={save} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Submit'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
