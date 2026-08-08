'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Plus,
  Save,
  Play,
  Pause,
  Settings,
  Copy,
  Trash2,
  Download,
  Upload,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  MousePointer,
  Move,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Mail,
  MessageSquare,
  Phone,
  FileText,
  Users,
  Calendar,
  Bell,
  Globe,
  Database,
  Webhook,
  Timer,
  GitBranch,
  Repeat,
  Variable,
  Eye,
  History,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type WorkflowNode = {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  position: { x: number; y: number };
  data: {
    label: string;
    triggerType?: string;
    actionType?: string;
    config?: Record<string, any>;
    conditions?: any[];
  };
};

type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
};

type Workflow = {
  id: string;
  name: string;
  description: string;
  status: string;
  trigger_type: string;
  trigger_config: Record<string, any>;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  tags: string[];
  is_template: boolean;
};

const triggerTypes = [
  { value: 'manual', label: 'Manual Trigger', icon: MousePointer, color: 'text-gray-500' },
  { value: 'webhook', label: 'Webhook', icon: Webhook, color: 'text-purple-500' },
  { value: 'cron', label: 'Scheduled (Cron)', icon: Timer, color: 'text-blue-500' },
  { value: 'lead_created', label: 'Lead Created', icon: Users, color: 'text-green-500' },
  { value: 'lead_updated', label: 'Lead Updated', icon: Users, color: 'text-yellow-500' },
  { value: 'lead_converted', label: 'Lead Converted', icon: CheckCircle, color: 'text-emerald-500' },
  { value: 'customer_created', label: 'Customer Created', icon: Users, color: 'text-cyan-500' },
  { value: 'invoice_created', label: 'Invoice Created', icon: FileText, color: 'text-orange-500' },
  { value: 'invoice_paid', label: 'Invoice Paid', icon: CheckCircle, color: 'text-green-600' },
  { value: 'invoice_overdue', label: 'Invoice Overdue', icon: AlertCircle, color: 'text-red-500' },
  { value: 'payment_received', label: 'Payment Received', icon: CheckCircle, color: 'text-emerald-500' },
  { value: 'payment_failed', label: 'Payment Failed', icon: XCircle, color: 'text-red-500' },
  { value: 'quotation_created', label: 'Quotation Created', icon: FileText, color: 'text-blue-500' },
  { value: 'task_created', label: 'Task Created', icon: CheckCircle, color: 'text-purple-500' },
  { value: 'task_completed', label: 'Task Completed', icon: CheckCircle, color: 'text-green-500' },
  { value: 'calendar_event', label: 'Calendar Event', icon: Calendar, color: 'text-pink-500' },
  { value: 'whatsapp_received', label: 'WhatsApp Received', icon: MessageSquare, color: 'text-green-500' },
  { value: 'email_received', label: 'Email Received', icon: Mail, color: 'text-blue-500' },
  { value: 'form_submitted', label: 'Form Submitted', icon: FileText, color: 'text-indigo-500' },
  { value: 'birthday', label: 'Birthday', icon: Calendar, color: 'text-pink-500' },
  { value: 'service_expiry', label: 'Service Expiry', icon: Timer, color: 'text-orange-500' },
];

const actionTypes = [
  { value: 'send_whatsapp', label: 'Send WhatsApp', icon: MessageSquare, color: 'text-green-500', category: 'Communication' },
  { value: 'send_email', label: 'Send Email', icon: Mail, color: 'text-blue-500', category: 'Communication' },
  { value: 'create_lead', label: 'Create Lead', icon: Users, color: 'text-purple-500', category: 'CRM' },
  { value: 'update_lead', label: 'Update Lead', icon: Users, color: 'text-yellow-500', category: 'CRM' },
  { value: 'create_customer', label: 'Create Customer', icon: Users, color: 'text-cyan-500', category: 'CRM' },
  { value: 'generate_invoice', label: 'Generate Invoice', icon: FileText, color: 'text-orange-500', category: 'Finance' },
  { value: 'generate_quotation', label: 'Generate Quotation', icon: FileText, color: 'text-blue-500', category: 'Finance' },
  { value: 'create_task', label: 'Create Task', icon: CheckCircle, color: 'text-purple-500', category: 'Operations' },
  { value: 'assign_employee', label: 'Assign Employee', icon: Users, color: 'text-indigo-500', category: 'Operations' },
  { value: 'notify_admin', label: 'Notify Admin', icon: Bell, color: 'text-red-500', category: 'Notification' },
  { value: 'notify_user', label: 'Notify User', icon: Bell, color: 'text-yellow-500', category: 'Notification' },
  { value: 'create_calendar_event', label: 'Create Calendar Event', icon: Calendar, color: 'text-pink-500', category: 'Calendar' },
  { value: 'webhook_call', label: 'Webhook Call', icon: Webhook, color: 'text-purple-500', category: 'Integration' },
  { value: 'api_call', label: 'API Call', icon: Globe, color: 'text-blue-500', category: 'Integration' },
  { value: 'ai_generate_summary', label: 'AI Generate Summary', icon: Sparkles, color: 'text-amber-500', category: 'AI' },
  { value: 'ai_generate_reply', label: 'AI Generate Reply', icon: Sparkles, color: 'text-amber-600', category: 'AI' },
  { value: 'export_pdf', label: 'Export PDF', icon: FileText, color: 'text-red-500', category: 'Export' },
  { value: 'export_excel', label: 'Export Excel', icon: FileText, color: 'text-green-600', category: 'Export' },
  { value: 'delay', label: 'Delay', icon: Timer, color: 'text-gray-500', category: 'Control' },
  { value: 'variable_set', label: 'Set Variable', icon: Variable, color: 'text-slate-500', category: 'Control' },
];

const nodeCategories = [
  { label: 'Triggers', type: 'trigger', items: triggerTypes },
  { label: 'Actions', type: 'action', items: actionTypes },
  { label: 'Conditions', type: 'condition', items: [
    { value: 'if', label: 'If Condition', icon: GitBranch, color: 'text-amber-500' },
    { value: 'switch', label: 'Switch', icon: GitBranch, color: 'text-orange-500' },
  ]},
];

const emptyWorkflow: Partial<Workflow> = {
  name: '',
  description: '',
  status: 'draft',
  trigger_type: 'manual',
  trigger_config: {},
  nodes: [],
  edges: [],
  tags: [],
};

export default function AutomationPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Workflow>>(emptyWorkflow);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNodePanel, setShowNodePanel] = useState(false);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [undoStack, setUndoStack] = useState<Workflow[]>([]);
  const [redoStack, setRedoStack] = useState<Workflow[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('workflows').select('*').is('deleted_at', null).order('created_at', { ascending: false });
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);
    const { data, error } = await query;
    if (!error) setWorkflows((data || []) as Workflow[]);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = workflows.filter((w) => {
    const q = search.toLowerCase();
    return w.name.toLowerCase().includes(q) || (w.description || '').toLowerCase().includes(q);
  });

  const saveWorkflow = async () => {
    if (!form.name?.trim()) {
      toast.error('Workflow name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || null,
        status: form.status || 'draft',
        trigger_type: form.trigger_type || 'manual',
        trigger_config: form.trigger_config || {},
        nodes: form.nodes || [],
        edges: form.edges || [],
        tags: form.tags || [],
      };
      if (selectedWorkflow) {
        const { error } = await supabase
          .from('workflows')
          .update(payload)
          .eq('id', selectedWorkflow.id);
        if (error) throw error;
        toast.success('Workflow updated');
      } else {
        const { error } = await supabase.from('workflows').insert(payload);
        if (error) throw error;
        toast.success('Workflow created');
      }
      setEditing(false);
      setSelectedWorkflow(null);
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    }
    setSaving(false);
  };

  const deleteWorkflow = async (id: string) => {
    if (!confirm('Delete this workflow?')) return;
    const { error } = await supabase.from('workflows').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Deleted');
      load();
    }
  };

  const toggleStatus = async (workflow: Workflow) => {
    const newStatus = workflow.status === 'active' ? 'paused' : 'active';
    const { error } = await supabase
      .from('workflows')
      .update({ status: newStatus })
      .eq('id', workflow.id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Workflow ${newStatus === 'active' ? 'activated' : 'paused'}`);
      load();
    }
  };

  const duplicateWorkflow = async (workflow: Workflow) => {
    const { error } = await supabase.from('workflows').insert({
      name: `${workflow.name} (Copy)`,
      description: workflow.description,
      trigger_type: workflow.trigger_type,
      trigger_config: workflow.trigger_config,
      nodes: workflow.nodes,
      edges: workflow.edges,
      tags: workflow.tags,
      status: 'draft',
    });
    if (error) toast.error(error.message);
    else {
      toast.success('Workflow duplicated');
      load();
    }
  };

  const addNode = (type: string, nodeData: any) => {
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: type as any,
      position: { x: 200 + Math.random() * 100, y: 150 + form.nodes!.length * 80 },
      data: nodeData,
    };
    setForm((prev) => ({
      ...prev,
      nodes: [...(prev.nodes || []), newNode],
    }));
    saveToHistory();
  };

  const saveToHistory = () => {
    if (selectedWorkflow) {
      setUndoStack((prev) => [...prev, selectedWorkflow]);
      setRedoStack([]);
    }
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, selectedWorkflow!]);
    setForm(previous);
    setSelectedWorkflow(previous);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, selectedWorkflow!]);
    setForm(next);
    setSelectedWorkflow(next);
  };

  const deleteNode = (nodeId: string) => {
    setForm((prev) => ({
      ...prev,
      nodes: (prev.nodes || []).filter((n) => n.id !== nodeId),
      edges: (prev.edges || []).filter((e) => e.source !== nodeId && e.target !== nodeId),
    }));
    setSelectedNode(null);
    saveToHistory();
  };

  const connectNodes = (sourceId: string, targetId: string) => {
    const newEdge: WorkflowEdge = {
      id: `edge_${Date.now()}`,
      source: sourceId,
      target: targetId,
    };
    setForm((prev) => ({
      ...prev,
      edges: [...(prev.edges || []), newEdge],
    }));
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setDragging(true);
      setDragStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      setCanvasOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setDragging(false);
  };

  const handleNodeDrag = (nodeId: string, e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left - canvasOffset.x) / zoom;
    const y = (e.clientY - rect.top - canvasOffset.y) / zoom;
    setForm((prev) => ({
      ...prev,
      nodes: (prev.nodes || []).map((n) =>
        n.id === nodeId ? { ...n, position: { x, y } } : n
      ),
    }));
  };

  const statusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Active', class: 'bg-success/10 text-success' };
      case 'paused':
        return { label: 'Paused', class: 'bg-warning/10 text-warning' };
      case 'draft':
        return { label: 'Draft', class: 'bg-muted text-muted-foreground' };
      case 'error':
        return { label: 'Error', class: 'bg-destructive/10 text-destructive' };
      default:
        return { label: status, class: 'bg-muted text-muted-foreground' };
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Automation Engine"
        description="Build powerful no-code workflows to automate your business"
        action={
          <Button
            onClick={() => {
              setSelectedWorkflow(null);
              setForm(emptyWorkflow);
              setEditing(true);
            }}
            className="gap-2 rounded-xl"
          >
            <Plus className="h-4 w-4" />
            New Workflow
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Workflow List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search workflows..."
                className="h-9 rounded-xl pl-9"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {['all', 'draft', 'active', 'paused'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors capitalize',
                    statusFilter === s
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card overflow-hidden premium-shadow">
            {loading ? (
              <div className="space-y-0">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-3 border-b border-border/40">
                    <div className="h-4 w-2/3 rounded shimmer" />
                    <div className="h-3 w-1/2 mt-2 rounded shimmer" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                <Zap className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium">No workflows yet</p>
                <p className="text-xs text-muted-foreground mt-1">Create your first automation</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {filtered.map((workflow) => {
                  const sc = statusConfig(workflow.status);
                  return (
                    <div
                      key={workflow.id}
                      className={cn(
                        'group p-3 cursor-pointer transition-colors hover:bg-muted/30',
                        selectedWorkflow?.id === workflow.id && 'bg-primary/5'
                      )}
                      onClick={() => {
                        setSelectedWorkflow(workflow);
                        setForm(workflow);
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{workflow.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {workflow.description || 'No description'}
                          </p>
                        </div>
                        <Badge className={cn('shrink-0 text-[10px]', sc.class)}>
                          {sc.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {workflow.trigger_type.replace('_', ' ')}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitBranch className="h-3 w-3" />
                          {(workflow.nodes as any[]).length} nodes
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStatus(workflow);
                          }}
                        >
                          {workflow.status === 'active' ? (
                            <Pause className="h-3.5 w-3.5" />
                          ) : (
                            <Play className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateWorkflow(workflow);
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWorkflow(workflow.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Canvas / Editor */}
        <div className="lg:col-span-3">
          {selectedWorkflow ? (
            <div className="glass-card overflow-hidden premium-shadow">
              {/* Toolbar */}
              <div className="flex items-center justify-between border-b border-border/40 p-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(true)}
                    className="gap-1.5"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                  <div className="h-4 w-px bg-border/60" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={undo}
                    disabled={undoStack.length === 0}
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={redo}
                    disabled={redoStack.length === 0}
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                  <div className="h-4 w-px bg-border/60" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground w-12 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowNodePanel(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-1.5 rounded-xl"
                    onClick={saveWorkflow}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => duplicateWorkflow(selectedWorkflow)}>
                        <Copy className="mr-2 h-3.5 w-3.5" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-3.5 w-3.5" />
                        Export JSON
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Upload className="mr-2 h-3.5 w-3.5" />
                        Import JSON
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <History className="mr-2 h-3.5 w-3.5" />
                        View History
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteWorkflow(selectedWorkflow.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Canvas */}
              <div
                ref={canvasRef}
                className="relative h-[500px] bg-grid overflow-hidden cursor-grab active:cursor-grabbing"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              >
                {/* Animated background */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl animate-blob" />
                  <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-accent/5 blur-3xl animate-blob animation-delay-2000" />
                </div>

                {/* Canvas content */}
                <div
                  className="absolute inset-0"
                  style={{
                    transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`,
                    transformOrigin: '0 0',
                  }}
                >
                  {/* Edges */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {(form.edges || []).map((edge) => {
                      const source = (form.nodes || []).find((n) => n.id === edge.source);
                      const target = (form.nodes || []).find((n) => n.id === edge.target);
                      if (!source || !target) return null;
                      return (
                        <path
                          key={edge.id}
                          d={`M ${source.position.x + 120} ${source.position.y + 30} C ${source.position.x + 180} ${source.position.y + 30}, ${target.position.x + 60} ${target.position.y + 30}, ${target.position.x + 120} ${target.position.y + 30}`}
                          stroke="hsl(var(--primary) / 0.5)"
                          strokeWidth="2"
                          fill="none"
                          className="transition-colors"
                        />
                      );
                    })}
                  </svg>

                  {/* Nodes */}
                  {(form.nodes || []).map((node) => {
                    const triggerInfo = triggerTypes.find((t) => t.value === node.data.triggerType);
                    const actionInfo = actionTypes.find((a) => a.value === node.data.actionType);
                    const Icon = triggerInfo?.icon || actionInfo?.icon || Zap;
                    const color = triggerInfo?.color || actionInfo?.color || 'text-primary';

                    return (
                      <motion.div
                        key={node.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                          'absolute w-[240px] rounded-xl border-2 p-3 cursor-move transition-shadow',
                          'bg-card shadow-lg',
                          selectedNode?.id === node.id
                            ? 'border-primary shadow-xl ring-2 ring-primary/20'
                            : 'border-border/50 hover:border-primary/50'
                        )}
                        style={{
                          left: node.position.x,
                          top: node.position.y,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNode(node);
                        }}
                        draggable
                        onDragEnd={(e) => handleNodeDrag(node.id, e as any)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', `bg-${color.replace('text-', '')}/10`)}>
                            <Icon className={cn('h-4 w-4', color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{node.data.label}</p>
                            <p className="text-[10px] text-muted-foreground capitalize">
                              {node.type}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNode(node.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Connection points */}
                        {node.type !== 'trigger' && (
                          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-card border-2 border-primary hover:bg-primary transition-colors cursor-pointer" />
                        )}
                        {node.type !== 'condition' && (
                          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-card border-2 border-primary hover:bg-primary transition-colors cursor-pointer" />
                        )}
                      </motion.div>
                    );
                  })}

                  {/* Empty state */}
                  {(form.nodes || []).length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                          <Zap className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="font-medium">Empty Workflow</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Click the + button to add nodes
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mini Map */}
              <div className="absolute bottom-4 right-4 w-40 h-24 rounded-lg bg-muted/50 border border-border/40 overflow-hidden">
                <div className="relative w-full h-full p-2">
                  {(form.nodes || []).map((node) => (
                    <div
                      key={node.id}
                      className="absolute w-3 h-2 rounded-sm bg-primary/50"
                      style={{
                        left: `${(node.position.x % 300) / 5}%`,
                        top: `${(node.position.y % 200) / 3}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card h-[500px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-medium">Select a Workflow</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose a workflow from the list or create a new one
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedWorkflow ? 'Edit Workflow' : 'New Workflow'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name *</Label>
              <Input
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="My Automation"
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What does this workflow do?"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Trigger Type</Label>
                <Select
                  value={form.trigger_type || 'manual'}
                  onValueChange={(v) => setForm({ ...form, trigger_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={form.status || 'draft'}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.trigger_type === 'cron' && (
              <div className="grid gap-2">
                <Label>Cron Expression</Label>
                <Input
                  value={(form.trigger_config as any)?.cron || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      trigger_config: { ...(form.trigger_config as any), cron: e.target.value },
                    })
                  }
                  placeholder="0 9 * * *"
                />
                <p className="text-xs text-muted-foreground">
                  e.g., &quot;0 9 * * *&quot; runs daily at 9 AM
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button onClick={saveWorkflow} disabled={saving}>
              {saving ? 'Saving...' : selectedWorkflow ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Node Panel Sheet */}
      <Sheet open={showNodePanel} onOpenChange={setShowNodePanel}>
        <SheetContent className="w-[300px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Node</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-6">
            {nodeCategories.map((category) => (
              <div key={category.type}>
                <h3 className="text-sm font-semibold mb-3">{category.label}</h3>
                <div className="space-y-2">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.value}
                        onClick={() => {
                          if (category.type === 'trigger') {
                            addNode('trigger', {
                              label: item.label,
                              triggerType: item.value,
                            });
                          } else if (category.type === 'action') {
                            addNode('action', {
                              label: item.label,
                              actionType: item.value,
                              config: {},
                            });
                          } else {
                            addNode('condition', {
                              label: item.label,
                              conditions: [],
                            });
                          }
                          setShowNodePanel(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-colors text-left"
                      >
                        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', `bg-${item.color.replace('text-', '')}/10`)}>
                          <Icon className={cn('h-4 w-4', item.color)} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          {'category' in item && (
                            <p className="text-[10px] text-muted-foreground">{(item as any).category}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Node Config Sheet */}
      <Sheet open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
        <SheetContent className="w-[350px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {selectedNode?.data.label || 'Node Configuration'}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="grid gap-2">
              <Label>Node Label</Label>
              <Input
                value={selectedNode?.data.label || ''}
                onChange={(e) => {
                  if (selectedNode) {
                    setForm((prev) => ({
                      ...prev,
                      nodes: (prev.nodes || []).map((n) =>
                        n.id === selectedNode.id
                          ? { ...n, data: { ...n.data, label: e.target.value } }
                          : n
                      ),
                    }));
                  }
                }}
                placeholder="Enter label"
              />
            </div>

            {selectedNode?.type === 'action' && (
              <div className="grid gap-2">
                <Label>Action Type</Label>
                <Select
                  value={selectedNode.data.actionType || ''}
                  onValueChange={(v) => {
                    if (selectedNode) {
                      const action = actionTypes.find((a) => a.value === v);
                      setForm((prev) => ({
                        ...prev,
                        nodes: (prev.nodes || []).map((n) =>
                          n.id === selectedNode.id
                            ? { ...n, data: { ...n.data, actionType: v, label: action?.label || n.data.label } }
                            : n
                        ),
                      }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypes.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(selectedNode?.data.actionType === 'send_email' ||
              selectedNode?.data.actionType === 'send_whatsapp') && (
              <div className="grid gap-2">
                <Label>Template</Label>
                <Select
                  value={(selectedNode.data.config as any)?.template || ''}
                  onValueChange={(v) => {
                    if (selectedNode) {
                      setForm((prev) => ({
                        ...prev,
                        nodes: (prev.nodes || []).map((n) =>
                          n.id === selectedNode.id
                            ? { ...n, data: { ...n.data, config: { ...n.data.config, template: v } } }
                            : n
                        ),
                      }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome Email</SelectItem>
                    <SelectItem value="payment_reminder">Payment Reminder</SelectItem>
                    <SelectItem value="gst_reminder">GST Reminder</SelectItem>
                    <SelectItem value="birthday_wish">Birthday Wish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedNode?.data.actionType === 'create_task' && (
              <>
                <div className="grid gap-2">
                  <Label>Task Type</Label>
                  <Select
                    value={(selectedNode.data.config as any)?.taskType || 'follow_up'}
                    onValueChange={(v) => {
                      if (selectedNode) {
                        setForm((prev) => ({
                          ...prev,
                          nodes: (prev.nodes || []).map((n) =>
                            n.id === selectedNode.id
                              ? { ...n, data: { ...n.data, config: { ...n.data.config, taskType: v } } }
                              : n
                          ),
                        }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Due (Days)</Label>
                  <Input
                    type="number"
                    value={(selectedNode.data.config as any)?.dueDays || 1}
                    onChange={(e) => {
                      if (selectedNode) {
                        setForm((prev) => ({
                          ...prev,
                          nodes: (prev.nodes || []).map((n) =>
                            n.id === selectedNode.id
                              ? { ...n, data: { ...n.data, config: { ...n.data.config, dueDays: parseInt(e.target.value) } } }
                              : n
                          ),
                        }));
                      }
                    }}
                  />
                </div>
              </>
            )}

            {selectedNode?.data.actionType === 'delay' && (
              <div className="grid gap-2">
                <Label>Delay (Minutes)</Label>
                <Input
                  type="number"
                  value={(selectedNode.data.config as any)?.minutes || 5}
                  onChange={(e) => {
                    if (selectedNode) {
                      setForm((prev) => ({
                        ...prev,
                        nodes: (prev.nodes || []).map((n) =>
                          n.id === selectedNode.id
                            ? { ...n, data: { ...n.data, config: { ...n.data.config, minutes: parseInt(e.target.value) } } }
                            : n
                        ),
                      }));
                    }
                  }}
                />
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  if (selectedNode) deleteNode(selectedNode.id);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
