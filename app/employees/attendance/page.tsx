'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  CheckCheck,
  CalendarX,
  Laptop,
  Plane,
  Clock,
  Users,
  Search,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  status: string;
};

type Attendance = {
  id: string;
  employee_id: string;
  attendance_date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  hours_worked: number | null;
  notes: string | null;
};

const statusConfig: Record<string, { label: string; class: string; dot: string }> = {
  present: { label: 'Present', class: 'bg-success/10 text-success border-success/20', dot: 'bg-success' },
  absent: { label: 'Absent', class: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive' },
  half_day: { label: 'Half Day', class: 'bg-warning/10 text-warning border-warning/20', dot: 'bg-warning' },
  remote: { label: 'Remote', class: 'bg-primary/10 text-primary border-primary/20', dot: 'bg-primary' },
  leave: { label: 'On Leave', class: 'bg-accent/10 text-accent border-accent/20', dot: 'bg-accent' },
  holiday: { label: 'Holiday', class: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground' },
};

const statusOptions = ['present', 'absent', 'half_day', 'remote', 'leave', 'holiday'] as const;

const kpiConfig: Record<string, { label: string; status: string; icon: typeof CheckCheck; iconClass: string; valueClass: string }> = {
  present: { label: 'Present Today', status: 'present', icon: CheckCheck, iconClass: 'text-success', valueClass: 'text-success' },
  absent: { label: 'Absent Today', status: 'absent', icon: CalendarX, iconClass: 'text-destructive', valueClass: 'text-destructive' },
  remote: { label: 'Remote Today', status: 'remote', icon: Laptop, iconClass: 'text-primary', valueClass: 'text-primary' },
  leave: { label: 'On Leave Today', status: 'leave', icon: Plane, iconClass: 'text-accent', valueClass: 'text-accent' },
};

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function prettyDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AttendancePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [saving, setSaving] = useState<string | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [empRes, attRes] = await Promise.all([
        supabase.from('employees').select('id, name, role, department, email, status').order('name', { ascending: true }),
        supabase.from('attendance').select('*').eq('attendance_date', selectedDate),
      ]);
      if (empRes.error) throw empRes.error;
      if (attRes.error) throw attRes.error;
      setEmployees(empRes.data || []);
      setAttendance(attRes.data || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load attendance');
    }
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => { load(); }, [load]);

  const attendanceByEmployee = new Map(attendance.map((a) => [a.employee_id, a]));

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return e.name.toLowerCase().includes(q) || (e.role || '').toLowerCase().includes(q) || (e.department || '').toLowerCase().includes(q);
  });

  const counts = statusOptions.reduce((acc, s) => {
    acc[s] = employees.filter((e) => attendanceByEmployee.get(e.id)?.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const updateStatus = async (employee: Employee, status: string) => {
    const existing = attendanceByEmployee.get(employee.id);
    setSaving(employee.id);
    try {
      if (existing) {
        const { error: err } = await supabase
          .from('attendance')
          .update({ status, hours_worked: status === 'present' ? 8 : status === 'half_day' ? 4 : 0 })
          .eq('id', existing.id);
        if (err) throw err;
      } else {
        const payload = {
          employee_id: employee.id,
          attendance_date: selectedDate,
          status,
          hours_worked: status === 'present' ? 8 : status === 'half_day' ? 4 : 0,
        };
        const { data, error: err } = await supabase.from('attendance').insert(payload).select().single();
        if (err) throw err;
        setAttendance((prev) => [...prev, data]);
      }
      // refresh local state
      await load();
      const sc = statusConfig[status];
      toast.success(`${employee.name} marked ${sc.label}`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to update attendance');
    }
    setSaving(null);
  };

  const markAllPresent = async () => {
    const toUpdate: Attendance[] = [];
    const toInsert: string[] = [];
    employees.forEach((e) => {
      const att = attendanceByEmployee.get(e.id);
      if (!att) toInsert.push(e.id);
      else if (att.status !== 'present') toUpdate.push(att);
    });
    if (toInsert.length === 0 && toUpdate.length === 0) { toast.info('All employees already marked present'); return; }
    setBulkSaving(true);
    try {
      if (toInsert.length > 0) {
        const rows = toInsert.map((id) => ({ employee_id: id, attendance_date: selectedDate, status: 'present', hours_worked: 8 }));
        const { error: err } = await supabase.from('attendance').insert(rows);
        if (err) throw err;
      }
      if (toUpdate.length > 0) {
        await Promise.all(toUpdate.map((a) => supabase.from('attendance').update({ status: 'present', hours_worked: 8 }).eq('id', a.id)));
      }
      toast.success(`${toInsert.length + toUpdate.length} employee${toInsert.length + toUpdate.length > 1 ? 's' : ''} marked present`);
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to mark all present');
    }
    setBulkSaving(false);
  };

  const clearAttendance = async (a: Attendance) => {
    const emp = employees.find((e) => e.id === a.employee_id);
    const { error: err } = await supabase.from('attendance').delete().eq('id', a.id);
    if (err) toast.error(err.message);
    else { toast.success(`Cleared attendance for ${emp?.name || 'employee'}`); load(); }
  };

  const isToday = selectedDate === todayISO();

  return (
    <AppShell>
      <PageHeader
        title="Attendance"
        description="Track daily attendance for your team"
        action={
          <Button onClick={markAllPresent} disabled={bulkSaving || loading || employees.length === 0} className="gap-2 rounded-xl">
            <CheckCheck className="h-4 w-4" />
            {bulkSaving ? 'Marking...' : 'Mark All Present'}
          </Button>
        }
      />

      {/* KPI cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(kpiConfig).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div key={key} className="glass-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{cfg.label}</p>
                <Icon className={cn('h-4 w-4', cfg.iconClass)} />
              </div>
              <p className={cn('mt-1 font-display text-xl font-bold', cfg.valueClass)}>{counts[key] || 0}</p>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees..." className="h-9 rounded-xl pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="h-9 w-auto rounded-xl" max={todayISO()} />
        </div>
      </div>

      <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        {isToday ? 'Today' : prettyDate(selectedDate)} · {filtered.length} employees
      </p>

      {/* Table */}
      <div className="glass-card overflow-hidden premium-shadow">
        {error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={load}>Retry</Button>
          </div>
        ) : loading ? (
          <div className="space-y-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-border/40 p-4">
                <div className="h-10 w-10 rounded-full shimmer" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-1/4 rounded shimmer" />
                  <div className="h-3 w-1/3 rounded shimmer" />
                </div>
                <div className="h-8 w-28 rounded-lg shimmer" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"><Users className="h-7 w-7 text-muted-foreground" /></div>
            <p className="mt-4 text-sm font-medium">No employees found</p>
            <p className="mt-1 text-xs text-muted-foreground">{search ? 'Try adjusting your search' : 'Add employees to track attendance'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Employee</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">Hours</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((e, i) => {
                    const att = attendanceByEmployee.get(e.id);
                    const sc = att ? (statusConfig[att.status] || statusConfig.present) : null;
                    const isSaving = saving === e.id;
                    return (
                      <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }} className="group border-b border-border/40 transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-sm font-semibold text-primary">{e.name.charAt(0).toUpperCase()}</div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{e.name}</p>
                              {e.role && <p className="truncate text-xs text-muted-foreground">{e.role}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">{e.department ? <Badge variant="outline" className="text-xs">{e.department}</Badge> : <span className="text-xs text-muted-foreground/50">—</span>}</td>
                        <td className="px-4 py-3">
                          {sc ? (
                            <Badge variant="outline" className={cn('border', sc.class)}><span className={cn('mr-1 h-1.5 w-1.5 rounded-full', sc.dot)} />{sc.label}</Badge>
                          ) : (
                            <Badge variant="outline" className="border-border text-muted-foreground">Not Marked</Badge>
                          )}
                        </td>
                        <td className="hidden px-4 py-3 text-right text-sm font-medium sm:table-cell">{att?.hours_worked != null ? `${att.hours_worked}h` : '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Select value={att?.status || ''} onValueChange={(v) => updateStatus(e, v)} disabled={isSaving}>
                              <SelectTrigger className="h-8 w-32 rounded-lg text-xs">
                                {isSaving ? 'Saving...' : <SelectValue placeholder="Mark" />}
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((s) => <SelectItem key={s} value={s}>{statusConfig[s].label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            {att && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => clearAttendance(att)} className="text-destructive"><X className="mr-2 h-3.5 w-3.5" />Clear</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
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
    </AppShell>
  );
}
