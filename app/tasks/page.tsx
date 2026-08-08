'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  LayoutGrid,
  Table as TableIcon,
  Pencil,
  Trash2,
  MoreHorizontal,
  Calendar,
  CheckSquare,
  Flag,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
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
import { taskSchema } from '@/lib/validations';

type Task = {
  id: string;
  title: string;
  description: string | null;
  assignee: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  created_at: string;
};

const stages = [
  { key: 'todo', label: 'To Do', color: 'hsl(221 83% 53%)' },
  { key: 'in_progress', label: 'In Progress', color: 'hsl(38 92% 50%)' },
  { key: 'review', label: 'Review', color: 'hsl(280 65% 60%)' },
  { key: 'done', label: 'Done', color: 'hsl(142 71% 45%)' },
];

const priorityConfig: Record<string, { label: string; class: string; dot: string }> = {
  low: { label: 'Low', class: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground' },
  medium: { label: 'Medium', class: 'bg-accent/10 text-accent border-accent/20', dot: 'bg-accent' },
  high: { label: 'High', class: 'bg-warning/10 text-warning border-warning/20', dot: 'bg-warning' },
  urgent: { label: 'Urgent', class: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive' },
};

const emptyForm = {
  title: '',
  description: '',
  assignee: '',
  priority: 'medium',
  status: 'todo',
  due_date: '',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'board' | 'table'>('board');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('tasks')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setTasks(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const filtered = tasks.filter((t) => {
    const q = search.toLowerCase();
    return t.title.toLowerCase().includes(q) || (t.assignee || '').toLowerCase().includes(q);
  });

  const openAdd = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = (t: Task) => {
    setEditing(t);
    setForm({ title: t.title, description: t.description || '', assignee: t.assignee || '', priority: t.priority, status: t.status, due_date: t.due_date || '' });
    setDialogOpen(true);
  };

  const save = async () => {
    const payload = { ...form, due_date: form.due_date || null };
    const validation = taskSchema.safeParse(payload);
    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || 'Invalid task data';
      toast.error(firstError);
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        const { error: err } = await supabase.from('tasks').update(payload).eq('id', editing.id);
        if (err) throw err;
        toast.success('Task updated');
      } else {
        const { error: err } = await supabase.from('tasks').insert(payload);
        if (err) throw err;
        toast.success('Task created');
      }
      setDialogOpen(false);
      loadTasks();
    } catch (e: any) { toast.error(e.message || 'Failed to save'); }
    setSaving(false);
  };

  const moveStage = async (task: Task, newStatus: string) => {
    const { error: err } = await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id);
    if (err) toast.error(err.message);
    else {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
      toast.success(`Moved to ${stages.find((s) => s.key === newStatus)?.label}`);
    }
  };

  const remove = async (t: Task) => {
    if (!confirm(`Delete "${t.title}"?`)) return;
    const { error: err } = await supabase
      .from('tasks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', t.id);
    if (err) toast.error(err.message);
    else { toast.success('Task deleted'); loadTasks(); }
  };

  return (
    <AppShell>
      <PageHeader
        title="Tasks"
        description="Manage tasks and assignments"
        action={<Button onClick={openAdd} className="gap-2 rounded-xl"><Plus className="h-4 w-4" />Add Task</Button>}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." className="h-9 rounded-xl pl-9" />
        </div>
        <div className="flex rounded-xl border border-border bg-muted/30 p-1">
          <Button variant={view === 'board' ? 'default' : 'ghost'} size="sm" onClick={() => setView('board')} className="gap-1.5"><LayoutGrid className="h-4 w-4" />Board</Button>
          <Button variant={view === 'table' ? 'default' : 'ghost'} size="sm" onClick={() => setView('table')} className="gap-1.5"><TableIcon className="h-4 w-4" />Table</Button>
        </div>
      </div>

      {error && <div className="glass-card mb-4 p-4 text-center"><p className="text-sm text-destructive">{error}</p><Button variant="outline" size="sm" className="mt-2" onClick={loadTasks}>Retry</Button></div>}

      {/* Board */}
      {view === 'board' && !error && (
        <div className="overflow-x-auto scrollbar-thin pb-4">
          {loading ? (
            <div className="grid grid-cols-4 gap-3 min-w-[800px]">{stages.map((s) => (<div key={s.key} className="space-y-2"><div className="h-6 w-20 rounded shimmer" />{[...Array(2)].map((_, i) => <div key={i} className="h-24 rounded-xl shimmer" />)}</div>))}</div>
          ) : (
            <div className="grid grid-cols-4 gap-3 min-w-[800px]">
              {stages.map((stage) => {
                const stageTasks = filtered.filter((t) => t.status === stage.key);
                return (
                  <div key={stage.key} className="flex flex-col">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: stage.color }} /><p className="text-xs font-semibold">{stage.label}</p></div>
                      <span className="text-[10px] text-muted-foreground">{stageTasks.length}</span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <AnimatePresence>
                        {stageTasks.map((t) => {
                          const pc = priorityConfig[t.priority] || priorityConfig.medium;
                          return (
                            <motion.div key={t.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} layout className="group glass-card cursor-pointer p-3 transition-shadow hover:premium-shadow">
                              <div className="flex items-start justify-between">
                                <p className="text-sm font-medium leading-tight">{t.title}</p>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild><button className="opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" /></button></DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openEdit(t)}><Pencil className="mr-2 h-3.5 w-3.5" />Edit</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => remove(t)} className="text-destructive"><Trash2 className="mr-2 h-3.5 w-3.5" />Delete</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              {t.description && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{t.description}</p>}
                              <div className="mt-2 flex items-center justify-between">
                                <Badge variant="outline" className={cn('text-[10px]', pc.class)}><span className={cn('mr-1 h-1.5 w-1.5 rounded-full', pc.dot)} />{pc.label}</Badge>
                                {t.assignee && <span className="text-[10px] text-muted-foreground">{t.assignee}</span>}
                              </div>
                              {t.due_date && <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground"><Calendar className="h-3 w-3" />{new Date(t.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>}
                              <div className="mt-2 flex flex-wrap gap-1">
                                {stages.filter((s) => s.key !== t.status).map((s) => (<button key={s.key} onClick={() => moveStage(t, s.key)} className="rounded-md border border-border/60 px-1.5 py-0.5 text-[9px] text-muted-foreground transition-colors hover:bg-muted">{s.label}</button>))}
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                      {stageTasks.length === 0 && <div className="rounded-xl border border-dashed border-border/60 p-4 text-center"><p className="text-[10px] text-muted-foreground">No tasks</p></div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      {view === 'table' && !error && (
        <div className="glass-card overflow-hidden premium-shadow">
          {loading ? (
            <div className="space-y-0">{[...Array(5)].map((_, i) => (<div key={i} className="flex items-center gap-4 border-b border-border/40 p-4"><div className="h-10 w-10 rounded-full shimmer" /><div className="flex-1 space-y-1.5"><div className="h-3.5 w-1/4 rounded shimmer" /><div className="h-3 w-1/3 rounded shimmer" /></div><div className="h-6 w-16 rounded-full shimmer" /></div>))}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"><CheckSquare className="h-7 w-7 text-muted-foreground" /></div>
              <p className="mt-4 text-sm font-medium">No tasks found</p>
              <p className="mt-1 text-xs text-muted-foreground">{search ? 'Try adjusting your search' : 'Create your first task'}</p>
              {!search && <Button onClick={openAdd} className="mt-4 gap-2"><Plus className="h-4 w-4" />Add Task</Button>}
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Task</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Assignee</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">Due Date</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, i) => {
                    const pc = priorityConfig[t.priority] || priorityConfig.medium;
                    const sc = stages.find((s) => s.key === t.status);
                    return (
                      <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="group border-b border-border/40 transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3"><p className="text-sm font-medium">{t.title}</p>{t.description && <p className="text-xs text-muted-foreground line-clamp-1">{t.description}</p>}</td>
                        <td className="hidden px-4 py-3 md:table-cell"><p className="text-sm text-muted-foreground">{t.assignee || '—'}</p></td>
                        <td className="px-4 py-3"><Badge variant="outline" className={cn('text-xs', pc.class)}><span className={cn('mr-1 h-1.5 w-1.5 rounded-full', pc.dot)} />{pc.label}</Badge></td>
                        <td className="px-4 py-3">
                          <Select value={t.status} onValueChange={(v) => moveStage(t, v)}>
                            <SelectTrigger className="h-7 w-28 text-xs"><span className="h-2 w-2 rounded-full" style={{ background: sc?.color }} /><SelectValue /></SelectTrigger>
                            <SelectContent>{stages.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent>
                          </Select>
                        </td>
                        <td className="hidden px-4 py-3 lg:table-cell">{t.due_date ? <span className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{new Date(t.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span> : <span className="text-xs text-muted-foreground/50">—</span>}</td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(t)}><Pencil className="mr-2 h-3.5 w-3.5" />Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => remove(t)} className="text-destructive"><Trash2 className="mr-2 h-3.5 w-3.5" />Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-thin sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit Task' : 'Add Task'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Task title" /></div>
            <div className="grid gap-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Task details..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Assignee</Label><Input value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} placeholder="Employee name" /></div>
              <div className="grid gap-2"><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{stages.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={save} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
