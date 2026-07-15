'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Plus,
  Search,
  Play,
  Pause,
  MoreHorizontal,
  Trash2,
  Pencil,
  GitBranch,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

type BusinessRule = {
  id: string;
  name: string;
  description: string;
  condition: Record<string, any>;
  actions: Record<string, any>[];
  priority: number;
  is_active: boolean;
  trigger_events: string[];
  execution_count: number;
  last_triggered_at: string;
  created_at: string;
};

const triggerEvents = [
  'lead_created', 'lead_updated', 'invoice_created', 'invoice_paid',
  'payment_received', 'customer_created', 'task_created', 'quotation_created',
];

const conditionFields = [
  { value: 'estimated_value', label: 'Lead Value' },
  { value: 'invoice_amount', label: 'Invoice Amount' },
  { value: 'payment_amount', label: 'Payment Amount' },
  { value: 'days_overdue', label: 'Days Overdue' },
  { value: 'customer_type', label: 'Customer Type' },
  { value: 'service_category', label: 'Service Category' },
];

const operators = [
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
];

const actionTypes = [
  { value: 'assign_employee', label: 'Assign Employee' },
  { value: 'send_email', label: 'Send Email' },
  { value: 'send_whatsapp', label: 'Send WhatsApp' },
  { value: 'create_task', label: 'Create Task' },
  { value: 'notify_admin', label: 'Notify Admin' },
  { value: 'update_field', label: 'Update Field' },
];

const emptyForm = {
  name: '',
  description: '',
  condition_field: 'estimated_value',
  condition_operator: 'greater_than',
  condition_value: '50000',
  actions: [{ type: 'assign_employee', config: {} }],
  priority: 0,
  trigger_events: [] as string[],
};

export default function BusinessRulesPage() {
  const [rules, setRules] = useState<BusinessRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BusinessRule | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('business_rules')
      .select('*')
      .order('priority', { ascending: false });
    if (!error) setRules(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = rules.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: rules.length,
    active: rules.filter((r) => r.is_active).length,
    executions: rules.reduce((sum, r) => sum + r.execution_count, 0),
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const condition = {
        field: form.condition_field,
        operator: form.condition_operator,
        value: Number(form.condition_value) || form.condition_value,
      };
      const payload = {
        name: form.name,
        description: form.description,
        condition,
        actions: form.actions,
        priority: form.priority,
        trigger_events: form.trigger_events,
        is_active: true,
      };
      if (editing) {
        const { error } = await supabase.from('business_rules').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Rule updated');
      } else {
        const { error } = await supabase.from('business_rules').insert(payload);
        if (error) throw error;
        toast.success('Rule created');
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    }
    setSaving(false);
  };

  const toggleActive = async (rule: BusinessRule) => {
    const { error } = await supabase
      .from('business_rules')
      .update({ is_active: !rule.is_active })
      .eq('id', rule.id);
    if (error) toast.error(error.message);
    else {
      toast.success(rule.is_active ? 'Rule paused' : 'Rule activated');
      load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this rule?')) return;
    const { error } = await supabase.from('business_rules').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Deleted');
      load();
    }
  };

  const addAction = () => {
    setForm({
      ...form,
      actions: [...form.actions, { type: 'notify_admin', config: {} }],
    });
  };

  const removeAction = (index: number) => {
    setForm({
      ...form,
      actions: form.actions.filter((_, i) => i !== index),
    });
  };

  return (
    <AppShell>
      <PageHeader
        title="Business Rules"
        description="Create smart automation rules for your business"
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setForm(emptyForm);
              setDialogOpen(true);
            }}
            className="gap-2 rounded-xl"
          >
            <Plus className="h-4 w-4" />
            New Rule
          </Button>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Total Rules', value: stats.total, icon: Zap, color: 'text-primary' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-success' },
          { label: 'Executions', value: stats.executions.toLocaleString(), icon: Play, color: 'text-purple-500' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4 premium-shadow"
          >
            <div className="flex items-center gap-2">
              <s.icon className={cn('h-4 w-4', s.color)} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="mt-2 font-display text-2xl font-bold">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search rules..." className="h-9 rounded-xl pl-9" />
      </div>

      {/* Rules List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mx-auto">
            <Zap className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium">No business rules yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Create smart automation rules</p>
          <Button onClick={() => setDialogOpen(true)} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            New Rule
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((rule, i) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    rule.is_active ? 'bg-success/10' : 'bg-muted'
                  )}>
                    <Zap className={cn('h-5 w-5', rule.is_active ? 'text-success' : 'text-muted-foreground')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{rule.name}</p>
                      <Badge variant="outline" className="text-[10px]">Priority {rule.priority}</Badge>
                      {!rule.is_active && (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">Paused</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {rule.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        IF {(rule.condition as any).field || 'condition'}
                      </span>
                      <span className="flex items-center gap-1">
                        {rule.actions?.length || 0} actions
                      </span>
                      {rule.execution_count > 0 && (
                        <span className="flex items-center gap-1">
                          <Play className="h-3 w-3" />
                          {rule.execution_count} executions
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn('h-8 w-8', rule.is_active && 'text-success')}
                      onClick={() => toggleActive(rule)}
                    >
                      {rule.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => remove(rule.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Rule' : 'New Business Rule'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Rule Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="High Value Lead Routing" />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="What this rule does..." />
            </div>

            {/* Condition */}
            <div className="p-4 rounded-xl bg-muted/30 space-y-3">
              <p className="text-sm font-semibold flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                IF Condition
              </p>
              <div className="grid grid-cols-3 gap-2">
                <Select value={form.condition_field} onValueChange={(v) => setForm({ ...form, condition_field: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {conditionFields.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={form.condition_operator} onValueChange={(v) => setForm({ ...form, condition_operator: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {operators.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input value={form.condition_value} onChange={(e) => setForm({ ...form, condition_value: e.target.value })} placeholder="Value" />
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 rounded-xl bg-muted/30 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  THEN Actions
                </p>
                <Button variant="ghost" size="sm" onClick={addAction} className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              {form.actions.map((action, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Select
                    value={(action as any).type}
                    onValueChange={(v) => {
                      const newActions = [...form.actions];
                      newActions[idx] = { ...newActions[idx], type: v };
                      setForm({ ...form, actions: newActions });
                    }}
                  >
                    <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {actionTypes.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {form.actions.length > 1 && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeAction(idx)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="gap-2">
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
