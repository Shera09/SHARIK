'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch,
  Wand2,
  Plus,
  Search,
  Play,
  Pause,
  Edit,
  Trash2,
  Copy,
  Sparkles,
  Zap,
  Mail,
  MessageSquare,
  Database,
  Webhook,
  Clock,
  Filter,
  ArrowRight,
  Circle,
  Square,
  Diamond,
  Settings,
  Save,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type Workflow = {
  id: string;
  name: string;
  description: string;
  status: string;
  trigger_type: string;
  steps: any[];
  is_active: boolean;
  ai_generated?: boolean;
  executions: number;
  last_run: string;
  created_at: string;
};

type TriggerBlock = {
  id: string;
  type: string;
  name: string;
  icon: string;
  category: string;
  description: string;
};

type ActionBlock = {
  id: string;
  type: string;
  name: string;
  icon: string;
  category: string;
  description: string;
};

const triggerBlocks: TriggerBlock[] = [
  { id: 'webhook', type: 'trigger', name: 'Webhook', icon: 'Webhook', category: 'external', description: 'Receive HTTP requests' },
  { id: 'schedule', type: 'trigger', name: 'Schedule', icon: 'Clock', category: 'time', description: 'Run at specific times' },
  { id: 'form-submit', type: 'trigger', name: 'Form Submit', icon: 'Database', category: 'internal', description: 'When form is submitted' },
  { id: 'email-received', type: 'trigger', name: 'Email Received', icon: 'Mail', category: 'communication', description: 'When email arrives' },
  { id: 'manual', type: 'trigger', name: 'Manual Trigger', icon: 'Play', category: 'manual', description: 'Manually triggered' },
];

const actionBlocks: ActionBlock[] = [
  { id: 'send-email', type: 'action', name: 'Send Email', icon: 'Mail', category: 'communication', description: 'Send an email' },
  { id: 'send-whatsapp', type: 'action', name: 'Send WhatsApp', icon: 'MessageSquare', category: 'communication', description: 'Send WhatsApp message' },
  { id: 'create-record', type: 'action', name: 'Create Record', icon: 'Database', category: 'data', description: 'Add database record' },
  { id: 'update-record', type: 'action', name: 'Update Record', icon: 'Database', category: 'data', description: 'Update database record' },
  { id: 'http-request', type: 'action', name: 'HTTP Request', icon: 'Webhook', category: 'external', description: 'Make API call' },
  { id: 'condition', type: 'condition', name: 'Condition', icon: 'Filter', category: 'logic', description: 'Branch based on condition' },
  { id: 'delay', type: 'action', name: 'Delay', icon: 'Clock', category: 'time', description: 'Wait for duration' },
  { id: 'transform', type: 'action', name: 'Transform', icon: 'Zap', category: 'data', description: 'Transform data' },
];

export default function WorkflowStudioPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('workflows');
  const [generateDialog, setGenerateDialog] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [triggerType, setTriggerType] = useState('manual');
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [editDialog, setEditDialog] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    const { data } = await supabase
      .from('builder_projects')
      .select('*')
      .eq('project_type', 'workflow')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) setWorkflows(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateWorkflow = async () => {
    if (!workflowName.trim() || !prompt.trim()) {
      toast.error('Name and prompt are required');
      return;
    }

    setGenerating(true);

    await new Promise(r => setTimeout(r, 3000));

    const defaultSteps = [
      { id: 'trigger', type: 'trigger', subtype: triggerType, name: 'Trigger', position: 0 },
      { id: 'action-1', type: 'action', subtype: 'send-email', name: 'Send Email', position: 1 },
      { id: 'action-2', type: 'action', subtype: 'create-record', name: 'Create Record', position: 2 },
    ];

    const { data, error } = await supabase.from('builder_projects').insert({
      name: workflowName,
      description: prompt,
      project_type: 'workflow',
      prompt,
      ai_generated: true,
      status: 'draft',
      trigger_type: triggerType,
      steps: defaultSteps,
      is_active: false,
    }).select().single();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Workflow generated!');
      setWorkflows([data as Workflow, ...workflows]);
      setGenerateDialog(false);
      setPrompt('');
      setWorkflowName('');
    }

    setGenerating(false);
  };

  const createWorkflow = async () => {
    if (!workflowName.trim()) {
      toast.error('Name is required');
      return;
    }

    const defaultSteps = [
      { id: 'trigger', type: 'trigger', subtype: triggerType, name: 'Trigger', position: 0 },
    ];

    const { data, error } = await supabase.from('builder_projects').insert({
      name: workflowName,
      description: `New ${triggerType} workflow`,
      project_type: 'workflow',
      ai_generated: false,
      status: 'draft',
      trigger_type: triggerType,
      steps: defaultSteps,
      is_active: false,
    }).select().single();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Workflow created!');
      setWorkflows([data as Workflow, ...workflows]);
      setCreateDialog(false);
      setWorkflowName('');
    }
  };

  const toggleWorkflow = async (workflow: Workflow) => {
    const { error } = await supabase
      .from('builder_projects')
      .update({ is_active: !workflow.is_active })
      .eq('id', workflow.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(workflow.is_active ? 'Workflow paused' : 'Workflow activated');
      setWorkflows(workflows.map(w => w.id === workflow.id ? { ...w, is_active: !w.is_active } : w));
    }
  };

  const deleteWorkflow = async (id: string) => {
    if (!confirm('Delete this workflow?')) return;
    const { error } = await supabase.from('builder_projects').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Deleted');
      setWorkflows(workflows.filter(w => w.id !== id));
    }
  };

  const duplicateWorkflow = async (workflow: Workflow) => {
    const { error } = await supabase.from('builder_projects').insert({
      name: `${workflow.name} (Copy)`,
      description: workflow.description,
      project_type: 'workflow',
      ai_generated: workflow.ai_generated,
      status: 'draft',
      trigger_type: workflow.trigger_type,
      steps: workflow.steps,
      is_active: false,
    });

    if (error) toast.error(error.message);
    else {
      toast.success('Workflow duplicated');
      loadData();
    }
  };

  const filtered = workflows.filter(w => w.name.toLowerCase().includes(search.toLowerCase()));

  const renderBlockIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      Webhook: <Webhook className="h-5 w-5" />,
      Clock: <Clock className="h-5 w-5" />,
      Database: <Database className="h-5 w-5" />,
      Mail: <Mail className="h-5 w-5" />,
      MessageSquare: <MessageSquare className="h-5 w-5" />,
      Play: <Play className="h-5 w-5" />,
      Zap: <Zap className="h-5 w-5" />,
      Filter: <Filter className="h-5 w-5" />,
    };
    return icons[iconName] || <Zap className="h-5 w-5" />;
  };

  const getStatusIcon = (status: string, isActive: boolean) => {
    if (!isActive) return <Pause className="h-4 w-4 text-muted-foreground" />;
    switch (status) {
      case 'running': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="No-Code Workflow Studio"
        description="Build automations with drag-and-drop simplicity"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCreateDialog(true)} className="gap-2 rounded-xl">
              <Plus className="h-4 w-4" />
              Create Workflow
            </Button>
            <Button onClick={() => setGenerateDialog(true)} className="gap-2 rounded-xl">
              <Wand2 className="h-4 w-4" />
              Generate with AI
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="glass-card p-1 h-auto mb-4">
          <TabsTrigger value="workflows" className="rounded-lg">My Workflows</TabsTrigger>
          <TabsTrigger value="triggers" className="rounded-lg">Triggers</TabsTrigger>
          <TabsTrigger value="actions" className="rounded-lg">Actions</TabsTrigger>
        </TabsList>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="mt-0">
          <div className="mb-4 flex gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search workflows..." className="pl-9 rounded-xl" />
            </div>
            <div className="flex gap-1.5">
              {['all', 'active', 'paused', 'draft'].map((status) => (
                <button
                  key={status}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize bg-muted hover:bg-muted/80"
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-2xl shimmer" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No workflows yet</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Create your first automation</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => setCreateDialog(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Workflow
                </Button>
                <Button onClick={() => setGenerateDialog(true)} className="gap-2">
                  <Wand2 className="h-4 w-4" />
                  Generate with AI
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((workflow, i) => (
                <motion.div
                  key={workflow.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass-card p-4 premium-shadow group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center">
                      <GitBranch className="h-5 w-5 text-pink-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{workflow.name}</h3>
                        {workflow.is_active ? (
                          <Badge className="bg-success/10 text-success text-[9px]">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px]">Paused</Badge>
                        )}
                        {workflow.ai_generated && (
                          <Badge className="bg-purple-500/10 text-purple-500 text-[9px]">
                            <Sparkles className="h-3 w-3 mr-0.5" />
                            AI
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{workflow.description}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="text-center">
                        <p className="text-xs">Executions</p>
                        <p className="font-medium">{workflow.executions || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs">Trigger</p>
                        <p className="font-medium capitalize">{workflow.trigger_type}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs">Steps</p>
                        <p className="font-medium">{workflow.steps?.length || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleWorkflow(workflow)}
                        className="gap-1"
                      >
                        {workflow.is_active ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                        {workflow.is_active ? 'Pause' : 'Activate'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setSelectedWorkflow(workflow)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => duplicateWorkflow(workflow)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteWorkflow(workflow.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Triggers Tab */}
        <TabsContent value="triggers" className="mt-0">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Start your workflow with a trigger</h3>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {triggerBlocks.map((block, i) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="glass-card p-4 premium-shadow hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center mb-3 group-hover:bg-pink-500/20 transition-colors">
                  {renderBlockIcon(block.icon)}
                </div>
                <h3 className="font-medium text-sm">{block.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{block.description}</p>
                <Badge variant="outline" className="text-[10px] mt-2 capitalize">{block.category}</Badge>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="mt-0">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Add actions to your workflow</h3>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {actionBlocks.map((block, i) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="glass-card p-4 premium-shadow hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-3 group-hover:bg-orange-500/20 transition-colors">
                  {renderBlockIcon(block.icon)}
                </div>
                <h3 className="font-medium text-sm">{block.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{block.description}</p>
                <Badge variant="outline" className="text-[10px] mt-2 capitalize">{block.category}</Badge>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Generate Dialog */}
      <Dialog open={generateDialog} onOpenChange={setGenerateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-pink-500" />
              Generate Workflow with AI
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Workflow Name</label>
              <Input value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} placeholder="Lead Nurturing Workflow" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Trigger Type</label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="manual">Manual</option>
                <option value="webhook">Webhook</option>
                <option value="schedule">Schedule</option>
                <option value="form-submit">Form Submit</option>
                <option value="email-received">Email Received</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Describe your workflow</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="When a new lead is created, send a welcome email, wait 2 days, then send a follow-up email if they haven't responded..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateDialog(false)}>Cancel</Button>
            <Button onClick={generateWorkflow} disabled={generating} className="gap-2">
              {generating ? (
                <>
                  <Wand2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Workflow Name</label>
              <Input value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} placeholder="My Workflow" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Trigger Type</label>
              <div className="grid grid-cols-2 gap-2">
                {triggerBlocks.slice(0, 4).map((trigger) => (
                  <button
                    key={trigger.id}
                    onClick={() => setTriggerType(trigger.id)}
                    className={cn(
                      'p-3 rounded-xl border transition-all flex items-center gap-3',
                      triggerType === trigger.id ? 'border-primary bg-primary/5' : 'border-border'
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      {renderBlockIcon(trigger.icon)}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">{trigger.name}</p>
                      <p className="text-xs text-muted-foreground">{trigger.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button onClick={createWorkflow} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
