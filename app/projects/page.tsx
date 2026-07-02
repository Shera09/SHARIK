'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  FolderKanban,
  CheckCircle2,
  Wallet,
  TrendingDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  Calendar,
  User,
  Users,
  Flag,
  Target,
  ListTodo,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { KpiCard } from '@/components/kpi-card';
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

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  manager: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number;
  spent: number;
  progress: number;
  color: string | null;
  tags: string[] | null;
  created_at: string;
};

type ProjectMember = {
  id: string;
  project_id: string;
  employee_id: string | null;
  role: string;
  allocated_hours: number;
  joined_at: string;
  employee: { name: string; role: string | null; department: string | null } | null;
};

type TaskItem = {
  id: string;
  title: string;
  assignee: string | null;
  priority: string;
  status: string;
  due_date: string | null;
};

const statusConfig: Record<string, { label: string; class: string; dot: string }> = {
  planning: { label: 'Planning', class: 'bg-accent/10 text-accent border-accent/20', dot: 'bg-accent' },
  active: { label: 'Active', class: 'bg-success/10 text-success border-success/20', dot: 'bg-success' },
  on_hold: { label: 'On Hold', class: 'bg-warning/10 text-warning border-warning/20', dot: 'bg-warning' },
  completed: { label: 'Completed', class: 'bg-primary/10 text-primary border-primary/20', dot: 'bg-primary' },
  cancelled: { label: 'Cancelled', class: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive' },
  archived: { label: 'Archived', class: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground' },
};

const priorityConfig: Record<string, { label: string; class: string; dot: string }> = {
  low: { label: 'Low', class: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground' },
  medium: { label: 'Medium', class: 'bg-accent/10 text-accent border-accent/20', dot: 'bg-accent' },
  high: { label: 'High', class: 'bg-warning/10 text-warning border-warning/20', dot: 'bg-warning' },
  critical: { label: 'Critical', class: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive' },
};

const filterTabs = [
  { key: 'all', label: 'All' },
  { key: 'planning', label: 'Planning' },
  { key: 'active', label: 'Active' },
  { key: 'on_hold', label: 'On Hold' },
  { key: 'completed', label: 'Completed' },
];

const colorPresets = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#3b82f6'];

const emptyForm = {
  name: '',
  description: '',
  status: 'planning',
  priority: 'medium',
  manager: '',
  start_date: '',
  end_date: '',
  budget: 0,
  color: colorPresets[0],
  tags: '',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Detail dialog state
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [projectTasks, setProjectTasks] = useState<TaskItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setProjects(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      (p.manager || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = projects.filter((p) => p.status === 'active').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const totalBudget = projects.reduce((s, p) => s + Number(p.budget || 0), 0);
  const totalSpent = projects.reduce((s, p) => s + Number(p.spent || 0), 0);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || '',
      status: p.status,
      priority: p.priority,
      manager: p.manager || '',
      start_date: p.start_date || '',
      end_date: p.end_date || '',
      budget: Number(p.budget) || 0,
      color: p.color || colorPresets[0],
      tags: (p.tags || []).join(', '),
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error('Project name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        status: form.status,
        priority: form.priority,
        manager: form.manager.trim() || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        budget: Number(form.budget) || 0,
        color: form.color,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };
      if (editing) {
        const { error: err } = await supabase.from('projects').update(payload).eq('id', editing.id);
        if (err) throw err;
        toast.success('Project updated');
      } else {
        const { error: err } = await supabase.from('projects').insert({ ...payload, spent: 0, progress: 0 });
        if (err) throw err;
        toast.success('Project created');
      }
      setDialogOpen(false);
      loadProjects();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    }
    setSaving(false);
  };

  const remove = async (p: Project) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    const { error: err } = await supabase.from('projects').delete().eq('id', p.id);
    if (err) toast.error(err.message);
    else {
      toast.success('Project deleted');
      loadProjects();
    }
  };

  const openDetail = async (p: Project) => {
    setDetailProject(p);
    setDetailLoading(true);
    setMembers([]);
    setProjectTasks([]);
    try {
      const [membersRes, tasksRes] = await Promise.all([
        supabase
          .from('project_members')
          .select('id, project_id, employee_id, role, allocated_hours, joined_at, employee:employees(name, role, department)')
          .eq('project_id', p.id)
          .order('joined_at', { ascending: true }),
        supabase
          .from('tasks')
          .select('id, title, assignee, priority, status, due_date')
          .eq('project_id', p.id)
          .order('created_at', { ascending: false }),
      ]);
      if (membersRes.error) throw membersRes.error;
      if (tasksRes.error) throw tasksRes.error;
      setMembers((membersRes.data || []) as unknown as ProjectMember[]);
      setProjectTasks((tasksRes.data || []) as TaskItem[]);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load project details');
    }
    setDetailLoading(false);
  };

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <AppShell>
      <PageHeader
        title="Projects"
        description="Plan, track, and deliver your projects"
        action={
          <Button onClick={openAdd} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Active Projects"
          value={String(activeCount)}
          icon={FolderKanban}
          gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
          delay={0}
        />
        <KpiCard
          title="Completed Projects"
          value={String(completedCount)}
          icon={CheckCircle2}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          delay={0.05}
        />
        <KpiCard
          title="Total Budget"
          value={`₹${totalBudget.toLocaleString('en-IN')}`}
          icon={Wallet}
          gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
          delay={0.1}
        />
        <KpiCard
          title="Total Spent"
          value={`₹${totalSpent.toLocaleString('en-IN')}`}
          change={`${totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% utilized`}
          trend={totalBudget > 0 && totalSpent / totalBudget > 0.8 ? 'down' : 'neutral'}
          icon={TrendingDown}
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          delay={0.15}
        />
      </div>

      {/* Search + Filter tabs */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="h-9 rounded-xl pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-muted/30 p-1">
          {filterTabs.map((tab) => (
            <Button
              key={tab.key}
              variant={statusFilter === tab.key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(tab.key)}
              className="h-7 rounded-lg px-3 text-xs"
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="glass-card mb-4 p-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={loadProjects}>
            Retry
          </Button>
        </div>
      )}

      {/* Projects grid */}
      {!error && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card space-y-3 p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl shimmer" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 w-2/3 rounded shimmer" />
                      <div className="h-3 w-1/3 rounded shimmer" />
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full shimmer" />
                  <div className="h-3 w-1/2 rounded shimmer" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 rounded-full shimmer" />
                    <div className="h-6 w-16 rounded-full shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-card flex flex-col items-center justify-center p-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <FolderKanban className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm font-medium">No projects found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {search || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first project to get started'}
              </p>
              {!search && statusFilter === 'all' && (
                <Button onClick={openAdd} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((p, i) => {
                  const sc = statusConfig[p.status] || statusConfig.planning;
                  const pc = priorityConfig[p.priority] || priorityConfig.medium;
                  const budget = Number(p.budget || 0);
                  const spent = Number(p.spent || 0);
                  const spentPct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
                  const progress = Math.max(0, Math.min(100, p.progress || 0));
                  return (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                      onClick={() => openDetail(p)}
                      className="group glass-card cursor-pointer overflow-hidden p-5 transition-shadow hover:premium-shadow"
                    >
                      {/* Color accent + header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                            style={{ background: p.color || colorPresets[0] }}
                          >
                            <Target className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold leading-tight">{p.name}</p>
                            {p.manager && (
                              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                {p.manager}
                              </p>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="rounded-lg p-1 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                            >
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                openEdit(p);
                              }}
                            >
                              <Pencil className="mr-2 h-3.5 w-3.5" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                remove(p);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Description */}
                      {p.description && (
                        <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                      )}

                      {/* Status + Priority badges */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={cn('text-[10px]', sc.class)}>
                          <span className={cn('mr-1 h-1.5 w-1.5 rounded-full', sc.dot)} />
                          {sc.label}
                        </Badge>
                        <Badge variant="outline" className={cn('text-[10px]', pc.class)}>
                          <Flag className="mr-1 h-2.5 w-2.5" />
                          {pc.label}
                        </Badge>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-[10px] font-medium text-muted-foreground">Progress</span>
                          <span className="text-[10px] font-semibold">{progress}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${progress}%`,
                              background: `linear-gradient(90deg, ${p.color || '#6366f1'}, ${p.color || '#6366f1'}dd)`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Budget vs Spent */}
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Budget</p>
                          <p className="text-sm font-semibold">₹{budget.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Spent</p>
                          <p className={cn('text-sm font-semibold', spentPct > 90 ? 'text-destructive' : '')}>
                            ₹{spent.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="mt-4 flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {fmtDate(p.start_date)}
                        </span>
                        <span>→</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {fmtDate(p.end_date)}
                        </span>
                      </div>

                      {/* Tags */}
                      {p.tags && p.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {p.tags.slice(0, 4).map((tag, idx) => (
                            <span
                              key={idx}
                              className="rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[9px] text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                          {p.tags.length > 4 && (
                            <span className="px-1.5 py-0.5 text-[9px] text-muted-foreground">
                              +{p.tags.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-thin sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Project' : 'New Project'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Project Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Website Redesign"
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Project description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Manager</Label>
              <Input
                value={form.manager}
                onChange={(e) => setForm({ ...form, manager: e.target.value })}
                placeholder="Project manager name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Budget (₹)</Label>
                <Input
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label>Tags</Label>
                <Input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="design, frontend (comma separated)"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Color Accent</Label>
              <div className="flex flex-wrap gap-2">
                {colorPresets.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    className={cn(
                      'h-8 w-8 rounded-lg transition-all',
                      form.color === c ? 'ring-2 ring-ring ring-offset-2 ring-offset-background' : ''
                    )}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailProject} onOpenChange={(open) => !open && setDetailProject(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-thin sm:max-w-2xl">
          {detailProject && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                    style={{ background: detailProject.color || colorPresets[0] }}
                  >
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle>{detailProject.name}</DialogTitle>
                    {detailProject.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{detailProject.description}</p>
                    )}
                  </div>
                </div>
              </DialogHeader>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                  <p className="text-[10px] text-muted-foreground">Status</p>
                  <Badge
                    variant="outline"
                    className={cn('mt-1 text-[10px]', statusConfig[detailProject.status]?.class)}
                  >
                    <span
                      className={cn('mr-1 h-1.5 w-1.5 rounded-full', statusConfig[detailProject.status]?.dot)}
                    />
                    {statusConfig[detailProject.status]?.label}
                  </Badge>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                  <p className="text-[10px] text-muted-foreground">Priority</p>
                  <Badge
                    variant="outline"
                    className={cn('mt-1 text-[10px]', priorityConfig[detailProject.priority]?.class)}
                  >
                    <Flag className="mr-1 h-2.5 w-2.5" />
                    {priorityConfig[detailProject.priority]?.label}
                  </Badge>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                  <p className="text-[10px] text-muted-foreground">Budget</p>
                  <p className="mt-1 text-sm font-semibold">₹{Number(detailProject.budget || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                  <p className="text-[10px] text-muted-foreground">Spent</p>
                  <p className="mt-1 text-sm font-semibold">₹{Number(detailProject.spent || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Progress</span>
                  <span className="text-xs font-semibold">{Math.max(0, Math.min(100, detailProject.progress || 0))}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(0, Math.min(100, detailProject.progress || 0))}%`,
                      background: `linear-gradient(90deg, ${detailProject.color || '#6366f1'}, ${detailProject.color || '#6366f1'}dd)`,
                    }}
                  />
                </div>
              </div>

              {detailLoading ? (
                <div className="space-y-2 py-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 rounded-xl shimmer" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  {/* Members section */}
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-semibold">Team Members</p>
                      <Badge variant="secondary" className="text-[10px]">
                        {members.length}
                      </Badge>
                    </div>
                    {members.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border/60 p-4 text-center">
                        <p className="text-xs text-muted-foreground">No members assigned yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {members.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-xs font-semibold text-primary">
                                {(m.employee?.name || '?').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{m.employee?.name || 'Unknown member'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {m.employee?.role || '—'}
                                  {m.employee?.department ? ` · ${m.employee.department}` : ''}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {m.allocated_hours > 0 && (
                                <span className="text-xs text-muted-foreground">{m.allocated_hours}h</span>
                              )}
                              <Badge variant="outline" className="text-[10px] capitalize">
                                {m.role}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tasks section */}
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <ListTodo className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-semibold">Linked Tasks</p>
                      <Badge variant="secondary" className="text-[10px]">
                        {projectTasks.length}
                      </Badge>
                    </div>
                    {projectTasks.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border/60 p-4 text-center">
                        <p className="text-xs text-muted-foreground">No tasks linked to this project</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {projectTasks.map((t) => {
                          const tpc = priorityConfig[t.priority] || priorityConfig.medium;
                          return (
                            <div
                              key={t.id}
                              className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-3"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{t.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {t.assignee || 'Unassigned'}
                                  {t.due_date
                                    ? ` · ${new Date(t.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                                    : ''}
                                </p>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <Badge variant="outline" className="text-[10px] capitalize">
                                  {t.status.replace(/_/g, ' ')}
                                </Badge>
                                <Badge variant="outline" className={cn('text-[10px]', tpc.class)}>
                                  {tpc.label}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (detailProject) openEdit(detailProject);
                    setDetailProject(null);
                  }}
                  className="gap-2"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Project
                </Button>
                <Button onClick={() => setDetailProject(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
