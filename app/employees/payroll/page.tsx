'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  CheckCircle2,
  Hourglass,
  IndianRupee,
  Plus,
  Search,
  Calendar,
  MoreHorizontal,
  Check,
  Sparkles,
  Receipt,
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
  salary: number;
  status: string;
};

type Payroll = {
  id: string;
  employee_id: string;
  period_year: number;
  period_month: number;
  gross_salary: number;
  basic_pay: number;
  hra: number;
  allowances: number;
  deductions: number;
  tax_deduction: number;
  pf_deduction: number;
  net_salary: number;
  status: string;
  payment_date: string | null;
  payslip_url: string | null;
  notes: string | null;
  created_at: string;
};

const payrollStatusConfig: Record<string, { label: string; class: string; dot: string }> = {
  pending: { label: 'Pending', class: 'bg-warning/10 text-warning border-warning/20', dot: 'bg-warning' },
  processed: { label: 'Processed', class: 'bg-primary/10 text-primary border-primary/20', dot: 'bg-primary' },
  paid: { label: 'Paid', class: 'bg-success/10 text-success border-success/20', dot: 'bg-success' },
  failed: { label: 'Failed', class: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive' },
};

const months = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
  { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
  { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

function inr(amount: number) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

/**
 * Build payroll components from a gross salary using a standard Indian payslip split:
 * basic = 50% of gross, HRA = 40% of basic, allowances = remainder,
 * PF = 12% of basic, tax = 10% of gross (simplified), deductions = PF + tax.
 */
function computePayroll(gross: number) {
  const basicPay = Math.round(gross * 0.5);
  const hra = Math.round(basicPay * 0.4);
  const allowances = Math.max(0, gross - basicPay - hra);
  const pfDeduction = Math.round(basicPay * 0.12);
  const taxDeduction = Math.round(gross * 0.1);
  const deductions = pfDeduction + taxDeduction;
  const netSalary = gross - deductions;
  return { basic_pay: basicPay, hra, allowances, deductions, tax_deduction: taxDeduction, pf_deduction: pfDeduction, net_salary: netSalary };
}

export default function PayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const now = new Date();
  const [periodMonth, setPeriodMonth] = useState(now.getMonth() + 1);
  const [periodYear, setPeriodYear] = useState(now.getFullYear());
  const [processing, setProcessing] = useState(false);
  const [marking, setMarking] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [empRes, payRes] = await Promise.all([
        supabase.from('employees').select('id, name, role, department, salary, status').order('name', { ascending: true }),
        supabase.from('payroll').select('*').eq('period_year', periodYear).eq('period_month', periodMonth),
      ]);
      if (empRes.error) throw empRes.error;
      if (payRes.error) throw payRes.error;
      setEmployees(empRes.data || []);
      setPayroll(payRes.data || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load payroll');
    }
    setLoading(false);
  }, [periodYear, periodMonth]);

  useEffect(() => { load(); }, [load]);

  const empMap = new Map(employees.map((e) => [e.id, e]));
  const payrollByEmployee = new Map(payroll.map((p) => [p.employee_id, p]));

  const filtered = employees.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return e.name.toLowerCase().includes(q) || (e.role || '').toLowerCase().includes(q) || (e.department || '').toLowerCase().includes(q);
  });

  const kpis = {
    totalGross: payroll.reduce((s, p) => s + Number(p.gross_salary), 0),
    processed: payroll.filter((p) => p.status === 'processed' || p.status === 'paid').length,
    pending: payroll.filter((p) => p.status === 'pending').length,
    totalNet: payroll.reduce((s, p) => s + Number(p.net_salary), 0),
  };

  const processPayroll = async () => {
    const active = employees.filter((e) => e.status === 'active');
    if (active.length === 0) { toast.error('No active employees to process'); return; }
    setProcessing(true);
    try {
      const toInsert = active
        .filter((e) => !payrollByEmployee.get(e.id))
        .map((e) => {
          const gross = Number(e.salary) || 0;
          return {
            employee_id: e.id,
            period_year: periodYear,
            period_month: periodMonth,
            gross_salary: gross,
            status: 'pending',
            ...computePayroll(gross),
          };
        });
      if (toInsert.length === 0) {
        toast.info('Payroll already generated for all active employees');
        setProcessing(false);
        return;
      }
      const { error: err } = await supabase.from('payroll').insert(toInsert);
      if (err) throw err;
      toast.success(`Payroll generated for ${toInsert.length} employee${toInsert.length > 1 ? 's' : ''}`);
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to process payroll');
    }
    setProcessing(false);
  };

  const markPaid = async (p: Payroll) => {
    setMarking(p.id);
    try {
      const { error: err } = await supabase
        .from('payroll')
        .update({ status: 'paid', payment_date: new Date().toISOString() })
        .eq('id', p.id);
      if (err) throw err;
      toast.success('Marked as paid');
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update');
    }
    setMarking(null);
  };

  const monthLabel = months.find((m) => m.value === periodMonth)?.label;

  return (
    <AppShell>
      <PageHeader
        title="Payroll"
        description="Generate and manage monthly payroll"
        action={
          <Button onClick={processPayroll} disabled={processing || loading} className="gap-2 rounded-xl">
            <Sparkles className="h-4 w-4" />
            {processing ? 'Processing...' : 'Process Payroll'}
          </Button>
        }
      />

      {/* KPI cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Total Payroll</p>
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-1 font-display text-xl font-bold text-primary">{inr(kpis.totalGross)}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Processed</p>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </div>
          <p className="mt-1 font-display text-xl font-bold text-success">{kpis.processed}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Pending</p>
            <Hourglass className="h-4 w-4 text-warning" />
          </div>
          <p className="mt-1 font-display text-xl font-bold text-warning">{kpis.pending}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Net Salary</p>
            <IndianRupee className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-1 font-display text-xl font-bold text-accent">{inr(kpis.totalNet)}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees..." className="h-9 rounded-xl pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={String(periodMonth)} onValueChange={(v) => setPeriodMonth(Number(v))}>
            <SelectTrigger className="h-9 w-[140px] rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              {months.map((m) => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={String(periodYear)} onValueChange={(v) => setPeriodYear(Number(v))}>
            <SelectTrigger className="h-9 w-[100px] rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[now.getFullYear(), now.getFullYear() - 1].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Receipt className="h-3.5 w-3.5" />
        {monthLabel} {periodYear} · {payroll.length} record{payroll.length !== 1 ? 's' : ''}
      </p>

      {/* Table */}
      <div className="glass-card overflow-hidden premium-shadow">
        {error ? (
          <div className="p-8 text-center"><p className="text-sm text-destructive">{error}</p><Button variant="outline" size="sm" className="mt-3" onClick={load}>Retry</Button></div>
        ) : loading ? (
          <div className="space-y-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-border/40 p-4">
                <div className="h-10 w-10 rounded-full shimmer" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-1/4 rounded shimmer" />
                  <div className="h-3 w-1/3 rounded shimmer" />
                </div>
                <div className="h-4 w-20 rounded shimmer" />
                <div className="h-4 w-20 rounded shimmer" />
                <div className="h-6 w-16 rounded-full shimmer" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"><Wallet className="h-7 w-7 text-muted-foreground" /></div>
            <p className="mt-4 text-sm font-medium">No payroll records</p>
            <p className="mt-1 text-xs text-muted-foreground">{search ? 'Try adjusting your search' : `Process payroll for ${monthLabel} ${periodYear}`}</p>
            {!search && <Button onClick={processPayroll} className="mt-4 gap-2"><Sparkles className="h-4 w-4" />Process Payroll</Button>}
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Employee</th>
                  <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Gross</th>
                  <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">Deductions</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net Salary</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((e, i) => {
                    const p = payrollByEmployee.get(e.id);
                    const sc = p ? (payrollStatusConfig[p.status] || payrollStatusConfig.pending) : null;
                    return (
                      <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }} className="group border-b border-border/40 transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-sm font-semibold text-primary">{e.name.charAt(0).toUpperCase()}</div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{e.name}</p>
                              {e.department && <p className="truncate text-xs text-muted-foreground">{e.department}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 text-right text-sm md:table-cell">
                          {p ? <span className="font-medium">{inr(p.gross_salary)}</span> : <span className="text-muted-foreground/50">—</span>}
                        </td>
                        <td className="hidden px-4 py-3 text-right text-sm lg:table-cell">
                          {p ? <span className="text-destructive">-{inr(p.deductions)}</span> : <span className="text-muted-foreground/50">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold">
                          {p ? <span className="text-success">{inr(p.net_salary)}</span> : <span className="text-muted-foreground/50">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {sc ? (
                            <Badge variant="outline" className={cn('border text-xs', sc.class)}><span className={cn('mr-1 h-1.5 w-1.5 rounded-full', sc.dot)} />{sc.label}</Badge>
                          ) : (
                            <Badge variant="outline" className="border-border text-muted-foreground">Not Generated</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {p ? (
                            p.status === 'paid' ? (
                              <span className="text-xs text-muted-foreground">{p.payment_date ? new Date(p.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}</span>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => markPaid(p)} disabled={marking === p.id} className="gap-1 h-8 rounded-lg border-success/20 text-success hover:bg-success/10">
                                <Check className="h-3.5 w-3.5" />{marking === p.id ? '...' : 'Mark Paid'}
                              </Button>
                            )
                          ) : (
                            <Button size="sm" variant="ghost" onClick={processPayroll} disabled={processing} className="gap-1 h-8 rounded-lg text-xs">
                              <Plus className="h-3.5 w-3.5" />Generate
                            </Button>
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
    </AppShell>
  );
}
