'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Search,
  Filter,
  User,
  FileText,
  Pencil,
  Trash2,
  Plus,
  ArrowRightLeft,
  LogIn,
  LogOut,
  RefreshCw,
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
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type AuditLog = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  user_id: string | null;
  user_name: string | null;
  details: string | null;
  ip_address: string | null;
  created_at: string;
};

const actionConfig: Record<string, { label: string; class: string; icon: typeof Plus }> = {
  create: { label: 'Created', class: 'bg-success/10 text-success', icon: Plus },
  update: { label: 'Updated', class: 'bg-accent/10 text-accent', icon: Pencil },
  delete: { label: 'Deleted', class: 'bg-destructive/10 text-destructive', icon: Trash2 },
  login: { label: 'Login', class: 'bg-primary/10 text-primary', icon: LogIn },
  logout: { label: 'Logout', class: 'bg-muted text-muted-foreground', icon: LogOut },
  view: { label: 'Viewed', class: 'bg-muted text-muted-foreground', icon: FileText },
  export: { label: 'Exported', class: 'bg-warning/10 text-warning', icon: ArrowRightLeft },
};

const entityTypeLabels: Record<string, string> = {
  customer: 'Customer',
  lead: 'Lead',
  invoice: 'Invoice',
  payment: 'Payment',
  employee: 'Employee',
  task: 'Task',
  quotation: 'Quotation',
  expense: 'Expense',
  service: 'Service',
  user: 'User',
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (actionFilter !== 'all') query = query.eq('action', actionFilter);
    if (entityFilter !== 'all') query = query.eq('entity_type', entityFilter);
    const { data, error } = await query.limit(100);
    if (!error) setLogs(data || []);
    setLoading(false);
  }, [actionFilter, entityFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = logs.filter((log) => {
    const q = search.toLowerCase();
    return (
      (log.entity_name || '').toLowerCase().includes(q) ||
      (log.user_name || '').toLowerCase().includes(q) ||
      (log.details || '').toLowerCase().includes(q) ||
      log.entity_type.toLowerCase().includes(q)
    );
  });

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const seedSampleLogs = async () => {
    const samples: Omit<AuditLog, 'id' | 'created_at'>[] = [
      { action: 'create', entity_type: 'customer', entity_id: null, entity_name: 'Rahul Sharma', user_id: null, user_name: 'Admin', details: 'Created new customer record', ip_address: '192.168.1.1' },
      { action: 'create', entity_type: 'lead', entity_id: null, entity_name: 'Priya Patel', user_id: null, user_name: 'Admin', details: 'New lead from website', ip_address: '192.168.1.1' },
      { action: 'update', entity_type: 'invoice', entity_id: null, entity_name: 'INV-2024-001', user_id: null, user_name: 'Admin', details: 'Status changed to paid', ip_address: '192.168.1.1' },
      { action: 'create', entity_type: 'payment', entity_id: null, entity_name: '₹25,000', user_id: null, user_name: 'Admin', details: 'Payment received via UPI', ip_address: '192.168.1.1' },
      { action: 'login', entity_type: 'user', entity_id: null, entity_name: 'Admin', user_id: null, user_name: 'Admin', details: 'Successful login', ip_address: '192.168.1.1' },
    ];
    const { error } = await supabase.from('audit_logs').insert(samples);
    if (error) toast.error(error.message);
    else { toast.success('Sample logs added'); load(); }
  };

  const stats = {
    total: logs.length,
    creates: logs.filter((l) => l.action === 'create').length,
    updates: logs.filter((l) => l.action === 'update').length,
    deletes: logs.filter((l) => l.action === 'delete').length,
    today: logs.filter((l) => new Date(l.created_at).toDateString() === new Date().toDateString()).length,
  };

  return (
    <AppShell>
      <PageHeader
        title="Audit Log"
        description="Complete activity and change history"
        action={
          logs.length === 0 && (
            <Button variant="outline" onClick={seedSampleLogs} className="gap-2 rounded-xl">
              <RefreshCw className="h-4 w-4" />
              Add Sample Logs
            </Button>
          )
        }
      />

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: 'Total Events', value: stats.total, icon: Shield },
          { label: 'Creates', value: stats.creates, icon: Plus },
          { label: 'Updates', value: stats.updates, icon: Pencil },
          { label: 'Deletes', value: stats.deletes, icon: Trash2 },
          { label: 'Today', value: stats.today, icon: LogIn },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card flex items-center gap-3 p-4 premium-shadow"
          >
            <s.icon className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="font-display text-lg font-bold">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search logs..." className="h-9 rounded-xl pl-9" />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="h-9 w-full rounded-xl sm:w-36">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="logout">Logout</SelectItem>
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="h-9 w-full rounded-xl sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="invoice">Invoice</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
            <SelectItem value="task">Task</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Log list */}
      <div className="glass-card overflow-hidden premium-shadow">
        {loading ? (
          <div className="space-y-0">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-border/40 p-4">
                <div className="h-10 w-10 rounded-full shimmer" />
                <div className="flex-1 space-y-1.5"><div className="h-3.5 w-1/4 rounded shimmer" /><div className="h-3 w-1/3 rounded shimmer" /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Shield className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium">No audit logs found</p>
            <p className="mt-1 text-xs text-muted-foreground">Activity will be recorded here automatically</p>
          </div>
        ) : (
          <div>
            <AnimatePresence>
              {filtered.map((log, i) => {
                const ac = actionConfig[log.action] || actionConfig.view;
                const Icon = ac.icon;
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="group flex items-start gap-4 border-b border-border/40 p-4 transition-colors hover:bg-muted/30"
                  >
                    <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', ac.class)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] capitalize">{log.entity_type}</Badge>
                        <span className={cn('text-xs font-medium', ac.class)}>{ac.label}</span>
                      </div>
                      {log.entity_name && <p className="mt-0.5 text-sm font-medium">{log.entity_name}</p>}
                      {log.details && <p className="mt-0.5 text-xs text-muted-foreground">{log.details}</p>}
                      <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{log.user_name || 'System'}</span>
                        {log.ip_address && <span>IP: {log.ip_address}</span>}
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatTime(log.created_at)}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppShell>
  );
}
