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
  Mail,
  Phone,
  UsersRound,
  Briefcase,
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

type Employee = {
  id: string;
  name: string;
  role: string | null;
  department: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  salary: number;
  hire_date: string | null;
  created_at: string;
};

const statusConfig: Record<string, { label: string; class: string }> = {
  active: { label: 'Active', class: 'bg-success/10 text-success border-success/20' },
  on_leave: { label: 'On Leave', class: 'bg-warning/10 text-warning border-warning/20' },
  inactive: { label: 'Inactive', class: 'bg-muted text-muted-foreground border-border' },
};

const emptyForm = {
  name: '',
  role: '',
  department: '',
  email: '',
  phone: '',
  status: 'active',
  salary: 0,
  hire_date: '',
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    let query = supabase.from('employees').select('*').is('deleted_at', null).order('created_at', { ascending: false });
    if (deptFilter !== 'all') query = query.eq('department', deptFilter);
    const { data, error: err } = await query;
    if (err) setError(err.message);
    else setEmployees(data || []);
    setLoading(false);
  }, [deptFilter]);

  useEffect(() => { loadEmployees(); }, [loadEmployees]);

  const departments = Array.from(new Set(employees.map((e) => e.department).filter(Boolean))) as string[];

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return e.name.toLowerCase().includes(q) || (e.role || '').toLowerCase().includes(q) || (e.email || '').toLowerCase().includes(q);
  });

  const openAdd = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = (e: Employee) => {
    setEditing(e);
    setForm({ name: e.name, role: e.role || '', department: e.department || '', email: e.email || '', phone: e.phone || '', status: e.status, salary: Number(e.salary), hire_date: e.hire_date || '' });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, salary: Number(form.salary), hire_date: form.hire_date || null };
      if (editing) {
        const { error: err } = await supabase.from('employees').update(payload).eq('id', editing.id);
        if (err) throw err;
        toast.success('Employee updated');
      } else {
        const { error: err } = await supabase.from('employees').insert(payload);
        if (err) throw err;
        toast.success('Employee added');
      }
      setDialogOpen(false);
      loadEmployees();
    } catch (e: any) { toast.error(e.message || 'Failed to save'); }
    setSaving(false);
  };

  const remove = async (e: Employee) => {
    if (!confirm(`Remove ${e.name}?`)) return;
    const { error: err } = await supabase.from('employees').update({ deleted_at: new Date().toISOString() }).eq('id', e.id);
    if (err) toast.error(err.message);
    else { toast.success('Employee removed'); loadEmployees(); }
  };

  const totalPayroll = employees.filter((e) => e.status === 'active').reduce((s, e) => s + Number(e.salary), 0);

  return (
    <AppShell>
      <PageHeader
        title="Employees"
        description="Manage your team and departments"
        action={<Button onClick={openAdd} className="gap-2 rounded-xl"><Plus className="h-4 w-4" />Add Employee</Button>}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="glass-card p-4"><p className="text-xs text-muted-foreground">Total</p><p className="mt-1 font-display text-xl font-bold">{employees.length}</p></div>
        <div className="glass-card p-4"><p className="text-xs text-muted-foreground">Active</p><p className="mt-1 font-display text-xl font-bold text-success">{employees.filter((e) => e.status === 'active').length}</p></div>
        <div className="glass-card p-4"><p className="text-xs text-muted-foreground">On Leave</p><p className="mt-1 font-display text-xl font-bold text-warning">{employees.filter((e) => e.status === 'on_leave').length}</p></div>
        <div className="glass-card p-4"><p className="text-xs text-muted-foreground">Monthly Payroll</p><p className="mt-1 font-display text-xl font-bold">₹{totalPayroll.toLocaleString('en-IN')}</p></div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees..." className="h-9 rounded-xl pl-9" />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="h-9 w-full rounded-xl sm:w-40"><Filter className="mr-2 h-4 w-4 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card overflow-hidden premium-shadow">
        {error ? (
          <div className="p-8 text-center"><p className="text-sm text-destructive">{error}</p><Button variant="outline" size="sm" className="mt-3" onClick={loadEmployees}>Retry</Button></div>
        ) : loading ? (
          <div className="space-y-0">{[...Array(4)].map((_, i) => (<div key={i} className="flex items-center gap-4 border-b border-border/40 p-4"><div className="h-10 w-10 rounded-full shimmer" /><div className="flex-1 space-y-1.5"><div className="h-3.5 w-1/4 rounded shimmer" /><div className="h-3 w-1/3 rounded shimmer" /></div><div className="h-6 w-16 rounded-full shimmer" /></div>))}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"><UsersRound className="h-7 w-7 text-muted-foreground" /></div>
            <p className="mt-4 text-sm font-medium">No employees found</p>
            <p className="mt-1 text-xs text-muted-foreground">{search || deptFilter !== 'all' ? 'Try adjusting filters' : 'Add your first employee'}</p>
            {!search && deptFilter === 'all' && <Button onClick={openAdd} className="mt-4 gap-2"><Plus className="h-4 w-4" />Add Employee</Button>}
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Employee</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Contact</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">Salary</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((e, i) => {
                    const sc = statusConfig[e.status] || statusConfig.active;
                    return (
                      <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }} className="group border-b border-border/40 transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-sm font-semibold text-primary">{e.name.charAt(0).toUpperCase()}</div>
                            <div className="min-w-0"><p className="truncate text-sm font-medium">{e.name}</p>{e.role && <p className="flex items-center gap-1 truncate text-xs text-muted-foreground"><Briefcase className="h-3 w-3" />{e.role}</p>}</div>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          <div className="space-y-0.5">
                            {e.email && <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{e.email}</p>}
                            {e.phone && <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{e.phone}</p>}
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 lg:table-cell">{e.department && <Badge variant="outline" className="text-xs">{e.department}</Badge>}</td>
                        <td className="px-4 py-3"><Badge variant="outline" className={cn('border', sc.class)}>{sc.label}</Badge></td>
                        <td className="hidden px-4 py-3 text-right text-sm font-medium sm:table-cell">₹{Number(e.salary).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(e)}><Pencil className="mr-2 h-3.5 w-3.5" />Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => remove(e)} className="text-destructive"><Trash2 className="mr-2 h-3.5 w-3.5" />Remove</DropdownMenuItem>
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
          <DialogHeader><DialogTitle>{editing ? 'Edit Employee' : 'Add Employee'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Employee name" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Role</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Account Manager" /></div>
              <div className="grid gap-2"><Label>Department</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Sales" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" /></div>
              <div className="grid gap-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Salary (₹/month)</Label><Input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })} /></div>
              <div className="grid gap-2"><Label>Hire Date</Label><Input type="date" value={form.hire_date} onChange={(e) => setForm({ ...form, hire_date: e.target.value })} /></div>
            </div>
            <div className="grid gap-2"><Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="on_leave">On Leave</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={save} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
