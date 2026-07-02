'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Activity,
  Settings,
  Play,
  Pause,
  RefreshCw,
  MessageSquare,
  Zap,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type Agent = {
  id: string;
  name: string;
  role: string;
  description: string | null;
  capabilities: string[];
  permissions: string[];
  status: string;
  config: Record<string, any>;
  metrics: Record<string, any>;
  last_activity: string | null;
  created_at: string;
};

type Communication = {
  id: string;
  from_agent_id: string | null;
  to_agent_id: string | null;
  message_type: string;
  content: string;
  data: Record<string, any>;
  read: boolean;
  created_at: string;
};

type Workflow = {
  id: string;
  name: string;
  trigger_event: string;
  description: string | null;
  steps: any[];
  active: boolean;
  execution_count: number;
  last_executed: string | null;
};

const agentIcons: Record<string, string> = {
  ceo: '👔',
  sales_manager: '📈',
  crm_manager: '🤝',
  accountant: '💰',
  gst_consultant: '📋',
  support: '💬',
  marketing: '📣',
  hr: '👥',
  operations: '⚙️',
  whatsapp: '📱',
  email: '📧',
  notifications: '🔔',
  document_verifier: '🔍',
};

export default function AIAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({ task_type: '', input_data: '{}', priority: 5 });

  const loadData = async () => {
    setLoading(true);
    const [agentsRes, commsRes, workflowsRes] = await Promise.all([
      supabase.from('ai_agents').select('*').order('name'),
      supabase.from('ai_communications').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('ai_workflows').select('*').order('created_at', { ascending: false }),
    ]);
    setAgents(agentsRes.data || []);
    setCommunications(commsRes.data || []);
    setWorkflows(workflowsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const toggleAgentStatus = async (agent: Agent) => {
    const newStatus = agent.status === 'active' ? 'paused' : 'active';
    const { error } = await supabase
      .from('ai_agents')
      .update({ status: newStatus })
      .eq('id', agent.id);
    if (error) toast.error(error.message);
    else {
      toast.success(`${agent.name} ${newStatus === 'active' ? 'activated' : 'paused'}`);
      loadData();
    }
  };

  const createTask = async () => {
    if (!selectedAgent || !newTask.task_type.trim()) {
      toast.error('Task type is required');
      return;
    }
    const { error } = await supabase.from('ai_tasks').insert({
      agent_id: selectedAgent.id,
      task_type: newTask.task_type,
      input_data: JSON.parse(newTask.input_data || '{}'),
      priority: newTask.priority,
    });
    if (error) toast.error(error.message);
    else {
      toast.success('Task created');
      setTaskDialogOpen(false);
      setNewTask({ task_type: '', input_data: '{}', priority: 5 });
    }
  };

  const triggerWorkflow = async (workflow: Workflow) => {
    const { error } = await supabase.from('ai_workflow_executions').insert({
      workflow_id: workflow.id,
      status: 'running',
    });
    if (error) toast.error(error.message);
    else toast.success(`Workflow "${workflow.name}" triggered`);
  };

  const activeAgents = agents.filter((a) => a.status === 'active').length;
  const totalTasksToday = agents.reduce((s, a) => s + (a.metrics?.tasks_completed_today || 0), 0);

  return (
    <AppShell>
      <PageHeader
        title="AI Agent Orchestration"
        description="Manage your autonomous AI workforce"
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Agents', value: agents.length, icon: Bot },
          { label: 'Active', value: activeAgents, icon: Activity },
          { label: 'Workflows', value: workflows.length, icon: Zap },
          { label: 'Tasks Today', value: totalTasksToday, icon: CheckCircle2 },
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
        {/* Agents List */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card overflow-hidden premium-shadow"
          >
            <div className="border-b border-border bg-muted/30 px-4 py-3">
              <h3 className="font-display text-sm font-semibold">AI Workforce</h3>
            </div>
            {loading ? (
              <div className="space-y-0">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 border-b border-border/40 p-4">
                    <div className="h-12 w-12 rounded-xl shimmer" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-1/3 rounded shimmer" />
                      <div className="h-3 w-1/2 rounded shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {agents.map((agent, i) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="group flex items-center gap-4 p-4 transition-colors hover:bg-muted/30"
                  >
                    <div className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl',
                      agent.status === 'active' ? 'bg-primary/10' : 'bg-muted'
                    )}>
                      {agentIcons[agent.role] || '🤖'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{agent.name}</p>
                        <Badge variant="outline" className={cn(
                          'text-[10px]',
                          agent.status === 'active'
                            ? 'border-success/40 text-success'
                            : 'border-border text-muted-foreground'
                        )}>
                          {agent.status}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                        {agent.role.replace(/_/g, ' ')} • {agent.capabilities?.length || 0} capabilities
                      </p>
                      {agent.last_activity && (
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          Last active: {new Date(agent.last_activity).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Switch
                        checked={agent.status === 'active'}
                        onCheckedChange={() => toggleAgentStatus(agent)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAgent(agent);
                          setDetailOpen(true);
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAgent(agent);
                          setTaskDialogOpen(true);
                        }}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Task
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Workflows & Communications */}
        <div className="space-y-6">
          {/* Workflows */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-5 premium-shadow"
          >
            <h3 className="mb-4 font-display text-sm font-semibold">Active Workflows</h3>
            {workflows.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No workflows configured</p>
            ) : (
              <div className="space-y-2">
                {workflows.slice(0, 4).map((wf) => (
                  <div
                    key={wf.id}
                    className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-2"
                  >
                    <Zap className={cn('h-4 w-4', wf.active ? 'text-warning' : 'text-muted-foreground')} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{wf.name}</p>
                      <p className="text-[10px] text-muted-foreground">{wf.execution_count} runs</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => triggerWorkflow(wf)}
                      className="h-7"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Agent Communications */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-5 premium-shadow"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold">Agent Communications</h3>
              <Badge variant="secondary" className="text-[10px]">{communications.length} messages</Badge>
            </div>
            {communications.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No communications yet</p>
            ) : (
              <div className="max-h-[300px] space-y-2 overflow-y-auto scrollbar-thin">
                {communications.slice(0, 8).map((comm) => (
                  <div
                    key={comm.id}
                    className={cn(
                      'rounded-lg px-3 py-2 text-xs',
                      comm.read ? 'bg-muted/20' : 'bg-primary/5 border border-primary/20'
                    )}
                  >
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      <span className="text-[10px]">
                        {new Date(comm.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2">{comm.content}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Agent Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {selectedAgent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                    {agentIcons[selectedAgent.role] || '🤖'}
                  </div>
                  <div>
                    <DialogTitle>{selectedAgent.name}</DialogTitle>
                    <p className="text-xs text-muted-foreground capitalize">{selectedAgent.role.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              </DialogHeader>
              <div className="py-4 space-y-4">
                {selectedAgent.description && (
                  <div>
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="mt-1 text-sm">{selectedAgent.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Capabilities</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {(selectedAgent.capabilities || []).map((cap) => (
                      <Badge key={cap} variant="secondary" className="text-[10px] capitalize">
                        {cap.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Permissions</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {(selectedAgent.permissions || []).map((perm) => (
                      <Badge key={perm} variant="outline" className="text-[10px]">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
                {selectedAgent.metrics && Object.keys(selectedAgent.metrics).length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground">Metrics</p>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      {Object.entries(selectedAgent.metrics).map(([key, value]) => (
                        <div key={key} className="rounded-lg bg-muted/40 px-3 py-2">
                          <p className="text-[10px] text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</p>
                          <p className="text-sm font-semibold">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Task to {selectedAgent?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Task Type *</Label>
              <Input
                value={newTask.task_type}
                onChange={(e) => setNewTask({ ...newTask, task_type: e.target.value })}
                placeholder="e.g., analyze_lead, generate_report"
              />
            </div>
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select
                value={String(newTask.priority)}
                onValueChange={(v) => setNewTask({ ...newTask, priority: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} {n <= 3 ? '(High)' : n >= 8 ? '(Low)' : '(Medium)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Input Data (JSON)</Label>
              <Textarea
                value={newTask.input_data}
                onChange={(e) => setNewTask({ ...newTask, input_data: e.target.value })}
                placeholder='{"key": "value"}'
                rows={4}
                className="font-mono text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
            <Button onClick={createTask}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
