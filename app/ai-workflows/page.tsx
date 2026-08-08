'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Play,
  Pause,
  Plus,
  ArrowRight,
  Bot,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type Workflow = {
  id: string;
  name: string;
  trigger_event: string;
  description: string | null;
  steps: WorkflowStep[];
  active: boolean;
  execution_count: number;
  last_executed: string | null;
  created_at: string;
};

type WorkflowExecution = {
  id: string;
  workflow_id: string;
  status: string;
  current_step: number;
  steps_log: any[];
  started_at: string;
  completed_at: string | null;
};

type WorkflowStep = {
  id: string;
  agent: string;
  action: string;
  config?: Record<string, any>;
};

const triggerEvents = [
  { value: 'lead_created', label: 'Lead Created' },
  { value: 'invoice_created', label: 'Invoice Created' },
  { value: 'payment_received', label: 'Payment Received' },
  { value: 'customer_created', label: 'Customer Created' },
  { value: 'task_assigned', label: 'Task Assigned' },
  { value: 'quotation_sent', label: 'Quotation Sent' },
  { value: 'followup_due', label: 'Follow-up Due' },
  { value: 'manual', label: 'Manual Trigger' },
];

const agentActions: Record<string, string[]> = {
  ceo: ['analyze_business', 'generate_report', 'send_notification'],
  sales_manager: ['score_lead', 'assign_salesperson', 'draft_quotation', 'schedule_followup'],
  crm_manager: ['update_customer_health', 'check_engagement', 'create_activity'],
  accountant: ['verify_invoice', 'calculate_gst', 'schedule_reminder'],
  whatsapp_manager: ['send_message', 'send_template', 'create_conversation'],
  email_manager: ['send_email', 'draft_email', 'schedule_email'],
  notifications: ['create_notification', 'send_digest', 'escalate_alert'],
};

const emptyStep: WorkflowStep = {
  id: '',
  agent: '',
  action: '',
  config: {},
};

export default function AIWorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    trigger_event: 'manual',
    description: '',
    steps: [{ ...emptyStep, id: crypto.randomUUID() }] as WorkflowStep[],
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [wfRes, execRes] = await Promise.all([
      supabase.from('ai_workflows').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
      supabase.from('ai_workflow_executions').select('*').order('started_at', { ascending: false }).limit(10),
    ]);
    setWorkflows(wfRes.data || []);
    setExecutions(execRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addStep = () => {
    setForm((prev) => ({
      ...prev,
      steps: [...prev.steps, { ...emptyStep, id: crypto.randomUUID() }],
    }));
  };

  const removeStep = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== idx),
    }));
  };

  const updateStep = (idx: number, field: keyof WorkflowStep, val: any) => {
    setForm((prev) => {
      const steps = [...prev.steps];
      steps[idx] = { ...steps[idx], [field]: val };
      return { ...prev, steps };
    });
  };

  const saveWorkflow = async () => {
    if (!form.name.trim()) { toast.error('Workflow name is required'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('ai_workflows').insert({
        name: form.name.trim(),
        trigger_event: form.trigger_event,
        description: form.description || null,
        steps: form.steps,
        active: true,
        execution_count: 0,
      });
      if (error) throw error;
      toast.success('AI Workflow created');
      setDialogOpen(false);
      setForm({ name: '', trigger_event: 'manual', description: '', steps: [{ ...emptyStep, id: crypto.randomUUID() }] });
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    }
    setSaving(false);
  };

  const toggleActive = async (wf: Workflow) => {
    const { error } = await supabase
      .from('ai_workflows')
      .update({ active: !wf.active })
      .eq('id', wf.id);
    if (error) toast.error(error.message);
    else {
      toast.success(wf.active ? 'Workflow paused' : 'Workflow activated');
      load();
    }
  };
  const toggleWorkflow = toggleActive;

  const triggerWorkflow = async (wf: Workflow) => {
    const { error } = await supabase.from('ai_workflow_executions').insert({
      workflow_id: wf.id,
      status: 'running',
      current_step: 0,
    });
    if (error) toast.error(error.message);
    else {
      toast.success('Workflow triggered');
      await supabase.from('ai_workflows').update({
        execution_count: wf.execution_count + 1,
        last_executed: new Date().toISOString(),
      }).eq('id', wf.id);
      load();
    }
  };

  const deleteWorkflow = async (wf: Workflow) => {
    if (!confirm(`Delete "${wf.name}"?`)) return;
    const { error } = await supabase.from('ai_workflows').update({ deleted_at: new Date().toISOString() }).eq('id', wf.id);
    if (error) toast.error(error.message);
    else { toast.success('Deleted'); load(); }
  };

  const activeWorkflows = workflows.filter((w) => w.active).length;
  const totalExecutions = workflows.reduce((s, w) => s + w.execution_count, 0);
  const runningExecs = executions.filter((e) => e.status === 'running').length;

  const defaultWorkflows = [
    {
      name: 'New Lead Onboarding',
      trigger_event: 'lead_created',
      description: 'Automatically score, assign, and welcome new leads',
      steps: [
        { id: crypto.randomUUID(), agent: 'sales_manager', action: 'score_lead' },
        { id: crypto.randomUUID(), agent: 'sales_manager', action: 'assign_salesperson' },
        { id: crypto.randomUUID(), agent: 'whatsapp_manager', action: 'send_template' },
      ],
      active: true,
    },
    {
      name: 'Invoice Sent Automation',
      trigger_event: 'invoice_created',
      description: 'Verify GST, send invoice via email and WhatsApp',
      steps: [
        { id: crypto.randomUUID(), agent: 'accountant', action: 'verify_invoice' },
        { id: crypto.randomUUID(), agent: 'email_manager', action: 'send_email' },
        { id: crypto.randomUUID(), agent: 'whatsapp_manager', action: 'send_message' },
        { id: crypto.randomUUID(), agent: 'accountant', action: 'schedule_reminder' },
      ],
      active: true,
    },
    {
      name: 'Payment Follow-up',
      trigger_event: 'followup_due',
      description: 'Send payment reminders via multiple channels',
      steps: [
        { id: crypto.randomUUID(), agent: 'whatsapp_manager', action: 'send_message' },
        { id: crypto.randomUUID(), agent: 'email_manager', action: 'send_email' },
        { id: crypto.randomUUID(), agent: 'notifications', action: 'escalate_alert' },
      ],
      active: true,
    },
  ];

  const seedDefaults = async () => {
    for (const wf of defaultWorkflows) {
      await supabase.from('ai_workflows').insert(wf);
    }
    toast.success('Default workflows added');
    load();
  };

  return (
    <AppShell>
      <PageHeader
        title="AI Workflows"
        description="Autonomous multi-agent automation pipelines"
        action={
          <div className="flex gap-2">
            {workflows.length === 0 && (
              <Button variant="outline" onClick={seedDefaults} className="gap-2 rounded-xl">
                <RefreshCw className="h-4 w-4" />
                Add Defaults
              </Button>
            )}
            <Button onClick={() => setDialogOpen(true)} className="gap-2 rounded-xl">
              <Plus className="h-4 w-4" />
              Create Workflow
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Workflows', value: workflows.length, icon: Zap },
          { label: 'Active', value: activeWorkflows, icon: Play },
          { label: 'Total Runs', value: totalExecutions, icon: CheckCircle2 },
          { label: 'Running Now', value: runningExecs, icon: RefreshCw },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card flex items-center gap-3 p-4 premium-shadow"
          >
            <s.icon className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="font-display text-xl font-bold">{loading ? '—' : s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Workflows */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card overflow-hidden premium-shadow"
          >
            {loading ? (
              <div className="space-y-0">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 border-b border-border/40 p-4">
                    <div className="h-10 w-10 rounded-xl shimmer" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-1/3 rounded shimmer" />
                      <div className="h-3 w-1/2 rounded shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : workflows.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                  <Zap className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm font-medium">No workflows yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Create automation pipelines for repetitive tasks</p>
                <Button onClick={seedDefaults} className="mt-4 gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Add Default Workflows
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {workflows.map((wf, i) => (
                  <motion.div
                    key={wf.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="group p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                          wf.active ? 'bg-warning/10' : 'bg-muted'
                        )}>
                          <Zap className={cn('h-5 w-5', wf.active ? 'text-warning' : 'text-muted-foreground')} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{wf.name}</p>
                            <Badge variant="outline" className="text-[10px]">
                              {triggerEvents.find((t) => t.value === wf.trigger_event)?.label || wf.trigger_event}
                            </Badge>
                          </div>
                          {wf.description && (
                            <p className="mt-0.5 text-xs text-muted-foreground">{wf.description}</p>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            {wf.steps.map((step, idx) => (
                              <div key={step.id} className="flex items-center gap-1">
                                <span className="text-[10px] text-muted-foreground capitalize bg-muted px-1.5 py-0.5 rounded">
                                  {step.agent}
                                </span>
                                {idx < wf.steps.length - 1 && (
                                  <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-xs text-muted-foreground">{wf.execution_count} runs</span>
                        <Switch checked={wf.active} onCheckedChange={() => toggleWorkflow(wf)} />
                        <Button variant="outline" size="sm" onClick={() => triggerWorkflow(wf)}>
                          <Play className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Executions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 premium-shadow"
        >
          <h3 className="mb-4 font-display text-sm font-semibold">Recent Executions</h3>
          {executions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No executions yet</p>
          ) : (
            <div className="max-h-[400px] space-y-2 overflow-y-auto scrollbar-thin">
              {executions.map((exec) => {
                const wf = workflows.find((w) => w.id === exec.workflow_id);
                return (
                  <div
                    key={exec.id}
                    className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-2"
                  >
                    <div className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                      exec.status === 'running' ? 'bg-primary/10 text-primary' :
                      exec.status === 'completed' ? 'bg-success/10 text-success' :
                      exec.status === 'failed' ? 'bg-destructive/10 text-destructive' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {exec.status === 'running' ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : exec.status === 'completed' ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : exec.status === 'failed' ? (
                        <XCircle className="h-3.5 w-3.5" />
                      ) : (
                        <Pause className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{wf?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(exec.started_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize">{exec.status}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Workflow</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Workflow name" />
            </div>
            <div className="grid gap-2">
              <Label>Trigger Event</Label>
              <Select value={form.trigger_event} onValueChange={(v) => setForm({ ...form, trigger_event: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {triggerEvents.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>

            {/* Steps */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Steps</Label>
                <Button type="button" variant="outline" size="sm" onClick={addStep} className="gap-1">
                  <Plus className="h-3.5 w-3.5" /> Add Step
                </Button>
              </div>
              {form.steps.map((step, idx) => (
                <div key={step.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">Step {idx + 1}</Badge>
                    {form.steps.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeStep(idx)} className="ml-auto h-7 w-7 p-0 text-destructive">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-1">
                      <Label className="text-xs">Agent</Label>
                      <Select value={step.agent} onValueChange={(v) => updateStep(idx, 'agent', v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select agent" /></SelectTrigger>
                        <SelectContent>
                          {Object.keys(agentActions).map((agent) => (
                            <SelectItem key={agent} value={agent} className="capitalize">{agent.replace(/_/g, ' ')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-xs">Action</Label>
                      <Select value={step.action} onValueChange={(v) => updateStep(idx, 'action', v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select action" /></SelectTrigger>
                        <SelectContent>
                          {(agentActions[step.agent] || []).map((action) => (
                            <SelectItem key={action} value={action} className="capitalize text-xs">{action.replace(/_/g, ' ')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveWorkflow} disabled={saving}>{saving ? 'Creating...' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
